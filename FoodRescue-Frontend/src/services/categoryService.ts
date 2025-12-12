import { apiClient } from './apiClient';
import { BackendCategory, ApiResponse } from '../types/api';

export const categoryService = {
    /**
     * Get all categories
     */
    async getAllCategories(): Promise<BackendCategory[]> {
        const response = await apiClient.get<ApiResponse<BackendCategory[]>>('/categories');
        return response.data || [];
    },

    /**
     * Get category by slug
     */
    async getCategoryBySlug(slug: string): Promise<BackendCategory> {
        const response = await apiClient.get<ApiResponse<BackendCategory>>(`/categories/slug/${slug}`);
        return response.data!;
    },

    /**
     * Get category by ID
     */
    async getCategoryById(id: string): Promise<BackendCategory> {
        const response = await apiClient.get<ApiResponse<BackendCategory>>(`/categories/id/${id}`);
        return response.data!;
    }
};
