import { GoogleGenerativeAI } from '@google/generative-ai';
import { Product } from '../models/product';
import { Order } from '../models/order';
import { User } from '../models/user';
import { Category } from '../models/Category';
import mongoose from 'mongoose';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || '');

export class GeminiService {
  private model;

  constructor() {
    this.model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  }

  /**
   * Chat with user and provide context-aware responses about products, restaurants, etc.
   */
  async chat(userMessage: string, userId?: string, userLocation?: { lat: number; lng: number }) {
    try {
      // Get relevant context from database based on the user's question
      const context = await this.getRelevantContext(userMessage, userId, userLocation);
      
      const prompt = `You are a helpful AI assistant for FoodRescue, a platform that connects restaurants with consumers and NGOs to reduce food waste.
      
Current context:
${context}

User question: ${userMessage}

Provide a helpful, concise response. If asked about restaurants, products, or availability, use the context provided. If you need to suggest products or restaurants, format them clearly.`;

      const result = await this.model.generateContent(prompt);
      const response = result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini chat error:', error);
      throw new Error('Failed to process your request');
    }
  }

  /**
   * Get product recommendations based on user's order history
   */
  async getRecommendations(userId: string, limit: number = 5) {
    try {
      // Get user's order history
      const orders = await Order.find({ customer: userId })
        .populate('items.product')
        .sort({ createdAt: -1 })
        .limit(10);

      // Extract product categories and names from past orders
      const pastProducts = orders.flatMap((order: any) => 
        order.items.map((item: any) => ({
          name: item.productName,
          category: (item.product as any)?.category
        }))
      );

      // Get available products
      const availableProducts = await Product.find({ 
        status: 'active',
        'inventory.availableStock': { $gt: 0 }
      })
        .populate('category')
        .populate('restaurant', 'firstName lastName')
        .limit(20);

      const prompt = `Based on the user's past orders:
${JSON.stringify(pastProducts, null, 2)}

Available products:
${JSON.stringify(availableProducts.map((p: any) => ({
  id: p._id,
  name: p.name,
  category: (p.category as any)?.name,
  restaurant: `${(p.restaurant as any)?.firstName} ${(p.restaurant as any)?.lastName}`,
  price: p.pricing.retail.price,
  stock: p.inventory.availableStock
})), null, 2)}

Recommend the top ${limit} products this user would likely be interested in. Return ONLY a JSON array of product IDs in this exact format:
["id1", "id2", "id3"]`;

      const result = await this.model.generateContent(prompt);
      const responseText = result.response.text();
      
      // Extract JSON from response
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const productIds = JSON.parse(jsonMatch[0]);
        const recommendations = await Product.find({
          _id: { $in: productIds }
        })
          .populate('category')
          .populate('restaurant', 'firstName lastName email phone');
        
        return recommendations;
      }

      // Fallback: return popular products
      return availableProducts.slice(0, limit);
    } catch (error) {
      console.error('Recommendation error:', error);
      // Fallback: return popular products
      const popular = await Product.find({ 
        status: 'active',
        'inventory.availableStock': { $gt: 0 }
      })
        .sort({ 'stats.orderCount': -1 })
        .limit(limit)
        .populate('category')
        .populate('restaurant', 'firstName lastName');
      
      return popular;
    }
  }

  /**
   * Search for products that match a query with AI understanding
   */
  async searchProducts(query: string, filters?: {
    visibleTo?: 'consumer' | 'ngo' | 'both';
    location?: { lat: number; lng: number; maxDistance?: number };
  }) {
    try {
      // Build search query
      const searchQuery: any = {
        status: 'active',
        'inventory.availableStock': { $gt: 0 }
      };

      if (filters?.visibleTo) {
        searchQuery.visibleTo = { $in: [filters.visibleTo, 'both'] };
      }

      let products = await Product.find(searchQuery)
        .populate('category')
        .populate('restaurant', 'firstName lastName profile.location');

      // Filter by location if provided
      if (filters?.location) {
        const maxDistance = filters.location.maxDistance || 50000; // 50km default
        products = products.filter((product: any) => {
          const restaurant = product.restaurant as any;
          if (restaurant?.profile?.location?.coordinates) {
            const [lng, lat] = restaurant.profile.location.coordinates;
            const distance = this.calculateDistance(
              filters.location!.lat,
              filters.location!.lng,
              lat,
              lng
            );
            return distance <= maxDistance;
          }
          return false;
        });
      }

      // Use AI to understand and filter products based on natural language query
      const prompt = `User is searching for: "${query}"

Available products:
${JSON.stringify(products.map((p: any) => ({
  id: p._id,
  name: p.name,
  description: p.description,
  category: (p.category as any)?.name,
  tags: p.tags
})), null, 2)}

Return the product IDs that best match the user's search query. Return ONLY a JSON array:
["id1", "id2", "id3"]`;

      const result = await this.model.generateContent(prompt);
      const responseText = result.response.text();
      
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const matchedIds = JSON.parse(jsonMatch[0]);
        return products.filter((p: any) => matchedIds.includes(p._id.toString()));
      }

      return products;
    } catch (error) {
      console.error('Product search error:', error);
      throw error;
    }
  }

  /**
   * Aggregate products for bulk queries (e.g., "find 50 spaghetti servings")
   */
  async aggregateProducts(query: string, userLocation?: { lat: number; lng: number }) {
    try {
      // Extract product type and quantity from query using AI
      const extractionPrompt = `Extract the product name and quantity from this query:
"${query}"

Return ONLY a JSON object in this format:
{"productName": "extracted product name", "quantity": extracted_number}`;

      const extractResult = await this.model.generateContent(extractionPrompt);
      const extractText = extractResult.response.text();
      const jsonMatch = extractText.match(/\{[\s\S]*\}/);
      
      if (!jsonMatch) {
        throw new Error('Could not understand the query');
      }

      const { productName, quantity } = JSON.parse(jsonMatch[0]);

      // Search for matching products
      const products = await Product.find({
        status: 'active',
        'inventory.availableStock': { $gt: 0 },
        $or: [
          { name: new RegExp(productName, 'i') },
          { description: new RegExp(productName, 'i') },
          { tags: new RegExp(productName, 'i') }
        ]
      })
        .populate('category')
        .populate('restaurant', 'firstName lastName profile.location');

      // Calculate how many restaurants and total quantity available
      let totalAvailable = 0;
      const restaurantBreakdown: any[] = [];

      for (const product of products) {
        const restaurant = product.restaurant as any;
        let distance = null;

        if (userLocation && restaurant?.profile?.location?.coordinates) {
          const [lng, lat] = restaurant.profile.location.coordinates;
          distance = this.calculateDistance(
            userLocation.lat,
            userLocation.lng,
            lat,
            lng
          );
        }

        totalAvailable += product.inventory.availableStock;
        restaurantBreakdown.push({
          restaurantName: `${restaurant.firstName} ${restaurant.lastName}`,
          productName: product.name,
          available: product.inventory.availableStock,
          unit: product.inventory.unit,
          price: product.pricing.retail.price,
          distance: distance ? `${(distance / 1000).toFixed(2)} km` : 'Unknown',
          productId: product._id
        });
      }

      return {
        query: productName,
        requestedQuantity: quantity,
        totalAvailable,
        canFulfill: totalAvailable >= quantity,
        restaurantsCount: restaurantBreakdown.length,
        breakdown: restaurantBreakdown.sort((a, b) => {
          if (a.distance === 'Unknown') return 1;
          if (b.distance === 'Unknown') return -1;
          return parseFloat(a.distance) - parseFloat(b.distance);
        })
      };
    } catch (error) {
      console.error('Aggregate products error:', error);
      throw error;
    }
  }

  /**
   * Get relevant context for the chat
   */
  private async getRelevantContext(message: string, userId?: string, userLocation?: { lat: number; lng: number }): Promise<string> {
    const contextParts: string[] = [];

    try {
      // Check if user is asking about nearby restaurants
      if (message.toLowerCase().includes('near') || message.toLowerCase().includes('closest') || message.toLowerCase().includes('around')) {
        const restaurants = await User.find({ 
          role: 'seller',
          isActive: true
        }).limit(10);

        if (userLocation) {
          const restaurantsWithDistance = restaurants
            .map(r => {
              if (r.profile?.location?.coordinates) {
                const [lng, lat] = r.profile.location.coordinates;
                const distance = this.calculateDistance(
                  userLocation.lat,
                  userLocation.lng,
                  lat,
                  lng
                );
                return {
                  name: `${r.firstName} ${r.lastName}`,
                  address: r.profile.address,
                  distance: `${(distance / 1000).toFixed(2)} km`,
                  distanceMeters: distance
                };
              }
              return null;
            })
            .filter(r => r !== null)
            .sort((a, b) => a!.distanceMeters - b!.distanceMeters)
            .slice(0, 5);

          if (restaurantsWithDistance.length > 0) {
            contextParts.push(`Nearby restaurants:\n${JSON.stringify(restaurantsWithDistance, null, 2)}`);
          }
        }
      }

      // Check if asking about products/food
      if (message.toLowerCase().includes('product') || message.toLowerCase().includes('food') || message.toLowerCase().includes('available')) {
        const products = await Product.find({ 
          status: 'active',
          'inventory.availableStock': { $gt: 0 }
        })
          .populate('category')
          .populate('restaurant', 'firstName lastName')
          .limit(10);

        if (products.length > 0) {
          contextParts.push(`Available products:\n${JSON.stringify(
            products.map((p: any) => ({
              name: p.name,
              category: (p.category as any)?.name,
              stock: p.inventory.availableStock,
              restaurant: `${(p.restaurant as any)?.firstName} ${(p.restaurant as any)?.lastName}`
            })), null, 2
          )}`);
        }
      }

      // Get user's order history if asking about past orders or preferences
      if (userId && (message.toLowerCase().includes('order') || message.toLowerCase().includes('bought') || message.toLowerCase().includes('prefer'))) {
        const recentOrders = await Order.find({ customer: userId })
          .sort({ createdAt: -1 })
          .limit(5)
          .populate('items.product');

        if (recentOrders.length > 0) {
          contextParts.push(`User's recent orders:\n${JSON.stringify(
            recentOrders.map((o: any) => ({
              products: o.items.map((i: any) => i.productName),
              date: o.createdAt,
              total: o.totalAmount
            })), null, 2
          )}`);
        }
      }

      return contextParts.length > 0 ? contextParts.join('\n\n') : 'No specific context available.';
    } catch (error) {
      console.error('Context gathering error:', error);
      return 'Error gathering context.';
    }
  }

  /**
   * Calculate distance between two coordinates (Haversine formula)
   */
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  }
}

export default new GeminiService();
