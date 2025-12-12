import { apiClient } from './apiClient';
import { Food } from '../types';
import { BackendProduct } from '../types/api';

export interface FoodFilters {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    lat?: number;
    lng?: number;
    radius?: number; // in km
}

// Helper: Transform Backend Data to Frontend Model
const transformProductToFood = (product: BackendProduct | any): Food => {
    const priceInKobo = product.pricing?.retail?.price || 0;
    const priceInNaira = priceInKobo / 100;

    // Calculate discount from deal if available
    let discountPercent = 0;
    let discountedPrice = priceInNaira;

    if (product.deal || product.dealId) {
        // If deal is populated, use its data
        const deal = product.deal;
        if (deal && typeof deal === 'object') {
            if (deal.discountPercentage) {
                discountPercent = deal.discountPercentage;
                discountedPrice = priceInNaira * (1 - discountPercent / 100);
            } else if (deal.dealPrice) {
                const dealPriceInNaira = deal.dealPrice / 100;
                discountedPrice = dealPriceInNaira;
                discountPercent = Math.round(((priceInNaira - dealPriceInNaira) / priceInNaira) * 100);
            }
        }
    }

    return {
        id: product._id,
        restaurantId: product.restaurant?._id || product.restaurant || '', // Handle population
        name: product.name,
        description: product.description || '',
        originalPrice: priceInNaira,
        discountedPrice: Math.round(discountedPrice * 100) / 100, // Round to 2 decimal places
        discountPercent: Math.max(0, Math.min(100, discountPercent)), // Ensure 0-100 range
        quantity: product.inventory?.availableStock || 0,
        quantityType: product.inventory?.unit || 'item',
        expiryTime: product.expiryDate || new Date().toISOString(),
        image: product.images?.[0] || 'https://via.placeholder.com/150',
        category: product.category?.name || 'General',
        tags: product.tags || [],
        status: product.status === 'active' ? 'active' : 'completed' // Map status
    };
};

export const foodService = {
    // Get all foods with optional filters
    async getAllFoods(filters?: FoodFilters): Promise<Food[]> {
        const queryParams = new URLSearchParams();
        
        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined) {
                    queryParams.append(key, value.toString());
                }
            });
        }

        const query = queryParams.toString();
        const endpoint = query ? `/products?${query}` : '/products';
        
        // Backend returns { success, data: { products, pagination } }
        const response = await apiClient.get<any>(endpoint);
        const products = response.data?.products || [];
        
        return products.map(transformProductToFood);
    },

    // Get food by ID
    async getFoodById(id: string): Promise<Food> {
        const response = await apiClient.get<any>(`/products/id/${id}`);
        return transformProductToFood(response.data);
    },

    // Create new food (for restaurants/stores)
    async createFood(foodData: Partial<Food>): Promise<Food> {
        return apiClient.post<Food>('/products', foodData);
    },

    // Update food
    async updateFood(id: string, foodData: Partial<Food>): Promise<Food> {
        return apiClient.put<Food>(`/products/${id}`, foodData);
    },

    // Delete food
    async deleteFood(id: string): Promise<void> {
        return apiClient.delete<void>(`/products/${id}`);
    },

    // Get nearby foods (geospatial query)
    async getNearbyFoods(lat: number, lng: number, radius: number = 5): Promise<Food[]> {
        const response = await apiClient.get<any>(`/products/nearby?lat=${lat}&lng=${lng}&radius=${radius}`);
        const products = response.data?.products || [];
        return products.map(transformProductToFood);
    },

    // Get foods by restaurant
    async getFoodsByRestaurant(restaurantId: string): Promise<Food[]> {
        const response = await apiClient.get<any>(`/products/restaurant/${restaurantId}`);
        const products = response.data?.products || [];
        return products.map(transformProductToFood);
    },
};
