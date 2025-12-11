import { apiClient } from './apiClient';
import { Food } from '../types';

// AI Match Request
export interface MatchFoodsRequest {
    preferences: string[]; // User's favorite food categories
    budget: {
        min: number;
        max: number;
    };
    location: {
        lat: number;
        lng: number;
    };
}

// AI Match Response
export interface FoodMatch {
    food: Food;
    matchScore: number; // 0-100
    scoreBreakdown: {
        preferenceScore: number; // 0-40
        budgetScore: number; // 0-30
        locationScore: number; // 0-20
        urgencyScore: number; // 0-10
    };
    reasoning: string;
}

export interface MatchFoodsResponse {
    matches: FoodMatch[];
    totalMatches: number;
}

// Recommendation Response
export interface Recommendation {
    food: Food;
    reason: string;
    confidence: number; // 0-1
}

export interface RecommendationsResponse {
    recommendations: Recommendation[];
    basedOn: {
        orderHistory: number;
        favoriteCategories: string[];
        averageSpending: number;
    };
}

// Pricing Suggestion Request
export interface PricingSuggestionRequest {
    foodDetails: {
        originalPrice: number;
        category: string;
        quantity: number;
    };
    expiryTime: string; // ISO date string
}

// Pricing Suggestion Response
export interface PricingSuggestionResponse {
    suggestedDiscountPercent: number;
    suggestedPrice: number;
    reasoning: string;
    urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
    timeUntilExpiry: {
        hours: number;
        minutes: number;
    };
}

export const aiService = {
    /**
     * Smart Food Matching Algorithm
     * Matches foods based on user preferences, budget, location, and urgency
     */
    async matchFoods(request: MatchFoodsRequest): Promise<MatchFoodsResponse> {
        return apiClient.post<MatchFoodsResponse>('/ai/match-foods', request);
    },

    /**
     * Get Personalized Recommendations
     * Based on user's order history and preferences
     */
    async getRecommendations(userId: string): Promise<RecommendationsResponse> {
        return apiClient.get<RecommendationsResponse>(`/ai/recommendations/${userId}`);
    },

    /**
     * AI Pricing Suggestions for Restaurants
     * Suggests optimal discount based on expiry time
     */
    async getPricingSuggestion(request: PricingSuggestionRequest): Promise<PricingSuggestionResponse> {
        return apiClient.post<PricingSuggestionResponse>('/ai/pricing-suggestion', request);
    },

    /**
     * Helper: Calculate match score locally (fallback if API fails)
     * This mirrors the backend algorithm
     */
    calculateLocalMatchScore(
        food: Food,
        userPreferences: string[],
        userBudget: { min: number; max: number },
        userLocation: { lat: number; lng: number }
    ): number {
        let score = 0;

        // Preference Score (40 points)
        if (food.category && userPreferences.includes(food.category)) {
            score += 40;
        } else if (food.tags?.some(tag => userPreferences.includes(tag))) {
            score += 20; // Partial match
        }

        // Budget Score (30 points)
        const price = food.discountedPrice;
        if (price >= userBudget.min && price <= userBudget.max) {
            score += 30;
        } else if (price < userBudget.min) {
            score += 20; // Below budget is still good
        } else if (price <= userBudget.max * 1.2) {
            score += 10; // Slightly over budget
        }

        // Location Score (20 points) - simplified
        // In real implementation, calculate actual distance
        score += 15; // Assume nearby for now

        // Urgency Score (10 points)
        const expiryTime = new Date(food.expiryTime).getTime();
        const now = Date.now();
        const hoursUntilExpiry = (expiryTime - now) / (1000 * 60 * 60);

        if (hoursUntilExpiry <= 2) {
            score += 10; // Very urgent
        } else if (hoursUntilExpiry <= 4) {
            score += 7;
        } else if (hoursUntilExpiry <= 8) {
            score += 5;
        } else {
            score += 3;
        }

        return Math.min(score, 100);
    },

    /**
     * Helper: Calculate pricing suggestion locally (fallback)
     */
    calculateLocalPricingSuggestion(
        originalPrice: number,
        expiryTime: string
    ): { discountPercent: number; suggestedPrice: number } {
        const now = Date.now();
        const expiry = new Date(expiryTime).getTime();
        const hoursUntilExpiry = (expiry - now) / (1000 * 60 * 60);

        let discountPercent = 30; // Base discount

        if (hoursUntilExpiry <= 1) {
            discountPercent = 70; // Critical - 70% off
        } else if (hoursUntilExpiry <= 2) {
            discountPercent = 60; // High urgency
        } else if (hoursUntilExpiry <= 4) {
            discountPercent = 50; // Medium urgency
        } else if (hoursUntilExpiry <= 8) {
            discountPercent = 40; // Low urgency
        }

        const suggestedPrice = Math.round(originalPrice * (1 - discountPercent / 100));

        return { discountPercent, suggestedPrice };
    },
};
