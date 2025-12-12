import { apiClient } from './apiClient';
import { BackendUser, ApiResponse } from '../types/api';

export interface UpdateProfileData {
    firstName?: string;
    lastName?: string;
    phone?: string;
    profile?: {
        address?: string;
        preferences?: string[];
        budget?: {
            min?: number;
            max?: number;
        };
    };
}

export const userService = {
    /**
     * Get current user profile
     */
    async getProfile(): Promise<BackendUser> {
        const response = await apiClient.get<ApiResponse<BackendUser>>('/auth/profile');
        return response.data!;
    },

    /**
     * Update user profile
     */
    async updateProfile(data: UpdateProfileData): Promise<BackendUser> {
        const response = await apiClient.put<ApiResponse<BackendUser>>('/auth/profile', data);
        
        // Update local storage
        if (response.data) {
            const currentUser = localStorage.getItem('user');
            if (currentUser) {
                const updatedUser = { ...JSON.parse(currentUser), ...response.data };
                localStorage.setItem('user', JSON.stringify(updatedUser));
            }
        }
        
        return response.data!;
    },

    /**
     * Request password reset
     */
    async forgotPassword(email: string): Promise<void> {
        await apiClient.post<ApiResponse<void>>('/auth/forgot-password', { email });
    },

    /**
     * Reset password with token
     */
    async resetPassword(email: string, resetToken: string, newPassword: string): Promise<void> {
        await apiClient.post<ApiResponse<void>>('/auth/reset-password', {
            email,
            resetToken,
            newPassword
        });
    },

    /**
     * Logout user
     */
    async logout(): Promise<void> {
        try {
            await apiClient.post<ApiResponse<void>>('/auth/logout');
        } finally {
            // Clear local storage regardless of API response
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
    }
};
