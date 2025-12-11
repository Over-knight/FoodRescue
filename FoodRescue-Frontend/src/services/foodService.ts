import { apiClient } from './apiClient';
import { Food } from '../types';

export interface FoodFilters {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    lat?: number;
    lng?: number;
    radius?: number; // in km
}

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
        const endpoint = query ? `/foods?${query}` : '/foods';
        
        return apiClient.get<Food[]>(endpoint);
    },

    // Get food by ID
    async getFoodById(id: string): Promise<Food> {
        return apiClient.get<Food>(`/foods/${id}`);
    },

    // Create new food (for restaurants/grocery stores)
    async createFood(foodData: Partial<Food>): Promise<Food> {
        return apiClient.post<Food>('/foods', foodData);
    },

    // Update food
    async updateFood(id: string, foodData: Partial<Food>): Promise<Food> {
        return apiClient.put<Food>(`/foods/${id}`, foodData);
    },

    // Delete food
    async deleteFood(id: string): Promise<void> {
        return apiClient.delete<void>(`/foods/${id}`);
    },

    // Get nearby foods (geospatial query)
    async getNearbyFoods(lat: number, lng: number, radius: number = 5): Promise<Food[]> {
        return apiClient.get<Food[]>(`/foods/nearby?lat=${lat}&lng=${lng}&radius=${radius}`);
    },

    // Get foods by restaurant
    async getFoodsByRestaurant(restaurantId: string): Promise<Food[]> {
        return apiClient.get<Food[]>(`/foods/restaurant/${restaurantId}`);
    },
};
