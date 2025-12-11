import { apiClient } from './apiClient';

export interface AnalyticsData {
    totalMeals: number;
    totalRevenue: number;
    wasteReduced: number;
    co2Saved: number;
    dailyData: Array<{
        date: string;
        meals: number;
        revenue: number;
    }>;
    categoryData: Array<{
        category: string;
        count: number;
        revenue: number;
    }>;
    predictions?: {
        nextWeekMeals: number;
        nextWeekRevenue: number;
    };
}

export const analyticsService = {
    // Get restaurant analytics
    async getRestaurantAnalytics(restaurantId: string): Promise<AnalyticsData> {
        return apiClient.get<AnalyticsData>(`/analytics/restaurant/${restaurantId}`);
    },

    // Get platform-wide analytics (admin only)
    async getPlatformAnalytics(): Promise<AnalyticsData> {
        return apiClient.get<AnalyticsData>('/analytics/platform');
    },
};
