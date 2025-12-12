import { apiClient } from './apiClient';
import { 
  ApiResponse,
  RestaurantOverviewData,
  RestaurantSalesData,
  TopProductsData,
  RevenueByCategoryData,
  WasteReductionData
} from '../types/api';

export const analyticsApiService = {
  /**
   * Get restaurant overview - dashboard stats
   * GET /api/analytics/restaurant/overview
   */
  async getRestaurantOverview(): Promise<RestaurantOverviewData> {
    const response = await apiClient.get<ApiResponse<RestaurantOverviewData>>('/analytics/restaurant/overview');
    if (!response.data) {
      throw new Error('No data returned from analytics overview');
    }
    return response.data;
  },

  /**
   * Get restaurant sales over time
   * GET /api/analytics/restaurant/sales?period=daily|weekly|monthly
   */
  async getRestaurantSales(period: 'daily' | 'weekly' | 'monthly' = 'daily'): Promise<RestaurantSalesData> {
    const response = await apiClient.get<ApiResponse<RestaurantSalesData>>(`/analytics/restaurant/sales?period=${period}`);
    if (!response.data) {
      throw new Error('No data returned from sales analytics');
    }
    return response.data;
  },

  /**
   * Get top selling products
   * GET /api/analytics/restaurant/products?limit=10
   */
  async getTopProducts(limit: number = 10): Promise<TopProductsData> {
    const response = await apiClient.get<ApiResponse<TopProductsData>>(`/analytics/restaurant/products?limit=${limit}`);
    if (!response.data) {
      throw new Error('No data returned from top products');
    }
    return response.data;
  },

  /**
   * Get revenue breakdown by category
   * GET /api/analytics/restaurant/revenue
   */
  async getRevenueByCategory(): Promise<RevenueByCategoryData> {
    const response = await apiClient.get<ApiResponse<RevenueByCategoryData>>('/analytics/restaurant/revenue');
    if (!response.data) {
      throw new Error('No data returned from revenue by category');
    }
    return response.data;
  },

  /**
   * Get waste reduction metrics
   * GET /api/analytics/restaurant/waste
   */
  async getWasteReduction(): Promise<WasteReductionData> {
    const response = await apiClient.get<ApiResponse<WasteReductionData>>('/analytics/restaurant/waste');
    if (!response.data) {
      throw new Error('No data returned from waste reduction');
    }
    return response.data;
  },
};
