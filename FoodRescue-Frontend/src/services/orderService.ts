import { apiClient } from './apiClient';

export interface Order {
    id: string;
    foodId: string;
    buyerId: string;
    restaurantId: string;
    quantity: number;
    totalPrice: number;
    status: 'pending' | 'confirmed' | 'ready' | 'picked-up' | 'cancelled';
    pickupCode?: string;
    createdAt: string;
    updatedAt?: string;
}

export interface CreateOrderData {
    foodId: string;
    quantity: number;
}

export const orderService = {
    // Create order
    async createOrder(orderData: CreateOrderData): Promise<Order> {
        return apiClient.post<Order>('/orders', orderData);
    },

    // Get user's orders
    async getUserOrders(userId: string): Promise<Order[]> {
        return apiClient.get<Order[]>(`/orders/user/${userId}`);
    },

    // Get restaurant's orders
    async getRestaurantOrders(restaurantId: string): Promise<Order[]> {
        return apiClient.get<Order[]>(`/orders/restaurant/${restaurantId}`);
    },

    // Get order by ID
    async getOrderById(id: string): Promise<Order> {
        return apiClient.get<Order>(`/orders/${id}`);
    },

    // Update order status
    async updateOrderStatus(id: string, status: Order['status']): Promise<Order> {
        return apiClient.patch<Order>(`/orders/${id}/status`, { status });
    },

    // Cancel order
    async cancelOrder(id: string): Promise<Order> {
        return apiClient.patch<Order>(`/orders/${id}/cancel`, {});
    },
};
