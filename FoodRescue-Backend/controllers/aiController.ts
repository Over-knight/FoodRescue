import { Request, Response } from 'express';
import Product from '../models/product';
import Order from '../models/order';

// Smart Food Matching Algorithm
export const matchFoods = async (req: Request, res: Response) => {
    try {
        const { preferences, budget, location } = req.body;

        // Validate input
        if (!preferences || !budget || !location) {
            return res.status(400).json({ 
                message: 'Missing required fields: preferences, budget, location' 
            });
        }

        // Get all active products
        const products = await Product.find({ 
            isActive: true,
            quantity: { $gt: 0 }
        }).populate('vendorId', 'name location');

        // Calculate match score for each product
        const matches = products.map(product => {
            const scores = calculateMatchScore(product, preferences, budget, location);
            
            return {
                food: product,
                matchScore: scores.total,
                scoreBreakdown: {
                    preferenceScore: scores.preference,
                    budgetScore: scores.budget,
                    locationScore: scores.location,
                    urgencyScore: scores.urgency
                },
                reasoning: generateReasoning(scores, product)
            };
        });

        // Sort by match score (highest first)
        matches.sort((a, b) => b.matchScore - a.matchScore);

        res.json({
            matches: matches.slice(0, 20), // Return top 20 matches
            totalMatches: matches.length
        });

    } catch (error: any) {
        console.error('Match foods error:', error);
        res.status(500).json({ message: 'Failed to match foods', error: error.message });
    }
};

// Personalized Recommendations
export const getRecommendations = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;

        // Get user's order history
        const orders = await Order.find({ userId })
            .populate('productId')
            .sort({ createdAt: -1 })
            .limit(50);

        if (orders.length === 0) {
            // No order history - return popular items
            const popularProducts = await Product.find({ 
                isActive: true,
                quantity: { $gt: 0 }
            })
            .sort({ soldCount: -1 })
            .limit(10);

            return res.json({
                recommendations: popularProducts.map(p => ({
                    food: p,
                    reason: 'Popular item in your area',
                    confidence: 0.6
                })),
                basedOn: {
                    orderHistory: 0,
                    favoriteCategories: [],
                    averageSpending: 0
                }
            });
        }

        // Analyze order history
        const categoryCount: { [key: string]: number } = {};
        let totalSpent = 0;

        orders.forEach(order => {
            const product = order.productId as any;
            if (product && product.category) {
                categoryCount[product.category] = (categoryCount[product.category] || 0) + 1;
            }
            totalSpent += order.totalPrice;
        });

        // Get favorite categories
        const favoriteCategories = Object.entries(categoryCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([category]) => category);

        const averageSpending = totalSpent / orders.length;

        // Find products in favorite categories
        const recommendedProducts = await Product.find({
            isActive: true,
            quantity: { $gt: 0 },
            category: { $in: favoriteCategories },
            discountedPrice: { $lte: averageSpending * 1.5 } // Within budget
        })
        .limit(10);

        const recommendations = recommendedProducts.map(product => {
            const inFavoriteCategory = favoriteCategories.includes(product.category);
            const withinBudget = product.discountedPrice <= averageSpending;
            
            let confidence = 0.5;
            let reason = 'Recommended for you';

            if (inFavoriteCategory && withinBudget) {
                confidence = 0.9;
                reason = `You often order ${product.category} items in this price range`;
            } else if (inFavoriteCategory) {
                confidence = 0.75;
                reason = `Based on your love for ${product.category}`;
            } else if (withinBudget) {
                confidence = 0.6;
                reason = 'Within your typical budget';
            }

            return {
                food: product,
                reason,
                confidence
            };
        });

        res.json({
            recommendations,
            basedOn: {
                orderHistory: orders.length,
                favoriteCategories,
                averageSpending: Math.round(averageSpending)
            }
        });

    } catch (error: any) {
        console.error('Get recommendations error:', error);
        res.status(500).json({ message: 'Failed to get recommendations', error: error.message });
    }
};

// AI Pricing Suggestion
export const getPricingSuggestion = async (req: Request, res: Response) => {
    try {
        const { foodDetails, expiryTime } = req.body;

        if (!foodDetails || !expiryTime) {
            return res.status(400).json({ 
                message: 'Missing required fields: foodDetails, expiryTime' 
            });
        }

        const { originalPrice } = foodDetails;
        const now = new Date();
        const expiry = new Date(expiryTime);
        
        // Calculate time until expiry
        const msUntilExpiry = expiry.getTime() - now.getTime();
        const hoursUntilExpiry = msUntilExpiry / (1000 * 60 * 60);
        const minutesUntilExpiry = (msUntilExpiry / (1000 * 60)) % 60;

        // Determine discount based on urgency
        let discountPercent = 30; // Base discount
        let urgencyLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
        let reasoning = '';

        if (hoursUntilExpiry <= 0) {
            discountPercent = 80;
            urgencyLevel = 'critical';
            reasoning = 'Item has expired or is expiring now - maximum discount to avoid waste';
        } else if (hoursUntilExpiry <= 1) {
            discountPercent = 70;
            urgencyLevel = 'critical';
            reasoning = 'Less than 1 hour until expiry - urgent sale needed';
        } else if (hoursUntilExpiry <= 2) {
            discountPercent = 60;
            urgencyLevel = 'high';
            reasoning = 'Less than 2 hours until expiry - high discount recommended';
        } else if (hoursUntilExpiry <= 4) {
            discountPercent = 50;
            urgencyLevel = 'high';
            reasoning = 'Less than 4 hours until expiry - significant discount needed';
        } else if (hoursUntilExpiry <= 8) {
            discountPercent = 40;
            urgencyLevel = 'medium';
            reasoning = 'Less than 8 hours until expiry - moderate discount';
        } else if (hoursUntilExpiry <= 24) {
            discountPercent = 30;
            urgencyLevel = 'low';
            reasoning = 'More than 8 hours until expiry - standard discount';
        } else {
            discountPercent = 20;
            urgencyLevel = 'low';
            reasoning = 'More than 24 hours until expiry - minimal discount';
        }

        const suggestedPrice = Math.round(originalPrice * (1 - discountPercent / 100));

        res.json({
            suggestedDiscountPercent: discountPercent,
            suggestedPrice,
            reasoning,
            urgencyLevel,
            timeUntilExpiry: {
                hours: Math.floor(hoursUntilExpiry),
                minutes: Math.floor(minutesUntilExpiry)
            }
        });

    } catch (error: any) {
        console.error('Pricing suggestion error:', error);
        res.status(500).json({ message: 'Failed to generate pricing suggestion', error: error.message });
    }
};

// Helper: Calculate match score
function calculateMatchScore(
    product: any,
    preferences: string[],
    budget: { min: number; max: number },
    location: { lat: number; lng: number }
): { total: number; preference: number; budget: number; location: number; urgency: number } {
    let preferenceScore = 0;
    let budgetScore = 0;
    let locationScore = 0;
    let urgencyScore = 0;

    // Preference Score (40 points)
    if (preferences.includes(product.category)) {
        preferenceScore = 40;
    } else if (product.tags?.some((tag: string) => preferences.includes(tag))) {
        preferenceScore = 20; // Partial match
    }

    // Budget Score (30 points)
    const price = product.discountedPrice;
    if (price >= budget.min && price <= budget.max) {
        budgetScore = 30;
    } else if (price < budget.min) {
        budgetScore = 25; // Below budget is still good
    } else if (price <= budget.max * 1.2) {
        budgetScore = 15; // Slightly over budget
    }

    // Location Score (20 points)
    // Calculate distance using Haversine formula
    const vendorLocation = product.vendorId?.location;
    if (vendorLocation && vendorLocation.coordinates) {
        const distance = calculateDistance(
            location.lat,
            location.lng,
            vendorLocation.coordinates[1],
            vendorLocation.coordinates[0]
        );

        if (distance <= 2) {
            locationScore = 20; // Very close
        } else if (distance <= 5) {
            locationScore = 15; // Close
        } else if (distance <= 10) {
            locationScore = 10; // Moderate distance
        } else {
            locationScore = 5; // Far
        }
    } else {
        locationScore = 10; // Default if no location data
    }

    // Urgency Score (10 points)
    const expiryTime = new Date(product.expiryTime).getTime();
    const now = Date.now();
    const hoursUntilExpiry = (expiryTime - now) / (1000 * 60 * 60);

    if (hoursUntilExpiry <= 2) {
        urgencyScore = 10; // Very urgent
    } else if (hoursUntilExpiry <= 4) {
        urgencyScore = 7;
    } else if (hoursUntilExpiry <= 8) {
        urgencyScore = 5;
    } else {
        urgencyScore = 3;
    }

    const total = preferenceScore + budgetScore + locationScore + urgencyScore;

    return { total, preference: preferenceScore, budget: budgetScore, location: locationScore, urgency: urgencyScore };
}

// Helper: Calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
}

// Helper: Generate reasoning text
function generateReasoning(scores: any, product: any): string {
    const reasons: string[] = [];

    if (scores.preference >= 40) {
        reasons.push(`Perfect match for your ${product.category} preference`);
    } else if (scores.preference >= 20) {
        reasons.push('Matches some of your preferences');
    }

    if (scores.budget >= 30) {
        reasons.push('Within your budget');
    } else if (scores.budget >= 25) {
        reasons.push('Great value below your budget');
    }

    if (scores.location >= 20) {
        reasons.push('Very close to you');
    } else if (scores.location >= 15) {
        reasons.push('Nearby location');
    }

    if (scores.urgency >= 10) {
        reasons.push('Expiring soon - act fast!');
    }

    return reasons.join('. ') || 'Recommended for you';
}
