import { apiClient } from './apiClient';
import { BackendOrder, OrderListResponse, ApiResponse } from '../types/api';

export interface CreateOrderData {
    productId: string;
    quantity: number;
    dealId?: string;
}

export interface OrderFilters {
    status?: 'pending' | 'confirmed' | 'ready' | 'completed' | 'cancelled';
    page?: number;
    limit?: number;
}

export const orderService = {
    /**
     * Create new order
     */
    async createOrder(data: CreateOrderData): Promise<BackendOrder> {
        const payload = {
            items: [{
                productId: data.productId,
                quantity: data.quantity
            }],
            orderType: 'retail' // Default to retail for single item rescue
        };
        const response = await apiClient.post<ApiResponse<BackendOrder>>('/orders', payload);
        return response.data!;
    },

    /**
     * Get user's orders
     */
    async getMyOrders(filters?: OrderFilters): Promise<{ orders: BackendOrder[]; pagination: any }> {
        const queryParams = new URLSearchParams();
        
        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined) {
                    queryParams.append(key, value.toString());
                }
            });
        }

        const query = queryParams.toString();
        const endpoint = query ? `/orders?${query}` : '/orders';
        
        const response = await apiClient.get<ApiResponse<OrderListResponse>>(endpoint);
        return response.data || { orders: [], pagination: {} };
    },

    /**
     * Get single order by ID
     */
    async getOrderById(id: string): Promise<BackendOrder> {
        const response = await apiClient.get<ApiResponse<BackendOrder>>(`/orders/${id}`);
        return response.data!;
    },

    /**
     * Get restaurant's orders (seller only)
     */
    async getRestaurantOrders(filters?: OrderFilters): Promise<{ orders: BackendOrder[]; pagination: any }> {
        const queryParams = new URLSearchParams();
        
        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined) {
                    queryParams.append(key, value.toString());
                }
            });
        }

        const query = queryParams.toString();
        const endpoint = query ? `/orders/restaurant/orders?${query}` : '/orders/restaurant/orders';
        
        const response = await apiClient.get<ApiResponse<OrderListResponse>>(endpoint);
        return response.data || { orders: [], pagination: {} };
    },

    /**
     * Confirm order (seller)
     */
    async confirmOrder(orderId: string): Promise<BackendOrder> {
        const response = await apiClient.patch<ApiResponse<BackendOrder>>(`/orders/${orderId}/confirm`);
        return response.data!;
    },

    /**
     * Mark order as ready for pickup (seller)
     */
    async markOrderReady(orderId: string): Promise<BackendOrder> {
        const response = await apiClient.patch<ApiResponse<BackendOrder>>(`/orders/${orderId}/ready`);
        return response.data!;
    },

    /**
     * Complete order pickup
     */
    async completePickup(orderId: string, pickupCode?: string): Promise<BackendOrder> {
        const response = await apiClient.patch<ApiResponse<BackendOrder>>(`/orders/${orderId}/complete`, {
            pickupCode
        });
        return response.data!;
    },

    /**
     * Cancel order
     */
    async cancelOrder(orderId: string, reason?: string): Promise<BackendOrder> {
        const response = await apiClient.patch<ApiResponse<BackendOrder>>(`/orders/${orderId}/cancel`, {
            reason
        });
        return response.data!;
    },

    /**
     * Mark payment as successful (webhook)
     */
    async markPaymentSuccess(orderId: string, paymentReference: string): Promise<BackendOrder> {
        const response = await apiClient.post<ApiResponse<BackendOrder>>(`/orders/${orderId}/payment-success`, {
            paymentReference
        });
        return response.data!;
    }
};
