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
        const endpoint = query ? `/products?${query}` : '/products';
        
        // Backend returns { success, data: { products, pagination } }
        const response = await apiClient.get<any>(endpoint);
        return response.data?.products || [];
    },

    // Get food by ID
    async getFoodById(id: string): Promise<Food> {
        return apiClient.get<Food>(`/products/id/${id}`);
    },

    // Create new food (for restaurants/grocery stores)
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
        return apiClient.get<Food[]>(`/products/nearby?lat=${lat}&lng=${lng}&radius=${radius}`);
    },

    // Get foods by restaurant
    async getFoodsByRestaurant(restaurantId: string): Promise<Food[]> {
        return apiClient.get<Food[]>(`/products/restaurant/${restaurantId}`);
    },
};
