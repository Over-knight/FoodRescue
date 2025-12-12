import { apiClient, API_BASE_URL } from './apiClient';
import { BackendProduct, ProductListResponse, ApiResponse } from '../types/api';
import { nairaToKobo, koboToNaira } from '../utils/apiHelpers';

export interface ProductFilters {
    category?: string;
    status?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    tags?: string[];
    sort?: string;
    order?: 'asc' | 'desc';
    page?: number;
    limit?: number;
}

export interface CreateProductData {
    name: string;
    description: string;
    category: string;
    originalPrice: number; // in Naira
    quantity: number;
    unit?: string; // e.g., "plate", "pack", "kg"
    lowStockThreshold?: number;
    tags?: string[];
    expiryDate: string; // ISO Date string
    status?: 'draft' | 'active';
    images: File[];
}

export interface UpdateProductData {
// ... existing UpdateProductData ...
    name?: string;
    description?: string;
    category?: string;
    pricing?: {
        retail: {
            price: number; // in kobo
            currency: string;
        };
    };
    inventory?: {
        availableStock: number;
        lowStockThreshold: number;
    };
    tags?: string[];
    status?: 'draft' | 'active' | 'inactive';
}

export const productService = {
    /**
     * Get all products with filters
     */
    async getAllProducts(filters?: ProductFilters): Promise<{ products: BackendProduct[]; pagination: any }> {
        const queryParams = new URLSearchParams();
        
        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    if (Array.isArray(value)) {
                        value.forEach(v => queryParams.append(key, v.toString()));
                    } else {
                        queryParams.append(key, value.toString());
                    }
                }
            });
        }

        const query = queryParams.toString();
        const endpoint = query ? `/products?${query}` : '/products';
        
        const response = await apiClient.get<ApiResponse<ProductListResponse>>(endpoint);
        return response.data || { products: [], pagination: {} };
    },

    /**
     * Get product by ID
     */
    async getProductById(id: string): Promise<BackendProduct> {
        const response = await apiClient.get<ApiResponse<BackendProduct>>(`/products/id/${id}`);
        return response.data!;
    },

    /**
     * Get product by slug
     */
    async getProductBySlug(slug: string): Promise<BackendProduct> {
        const response = await apiClient.get<ApiResponse<BackendProduct>>(`/products/slug/${slug}`);
        return response.data!;
    },

    /**
     * Search products
     */
    async searchProducts(query: string, category?: string, limit: number = 10): Promise<BackendProduct[]> {
        const params = new URLSearchParams({ q: query, limit: limit.toString() });
        if (category) params.append('category', category);
        
        const response = await apiClient.get<ApiResponse<{ products: BackendProduct[] }>>(`/products/search?${params}`);
        return response.data?.products || [];
    },

    /**
     * Create new product (with image upload)
     */
    async createProduct(data: CreateProductData): Promise<BackendProduct> {
        const formData = new FormData();
        
        // Add basic fields
        formData.append('name', data.name);
        formData.append('description', data.description);
        formData.append('category', data.category);
        formData.append('status', data.status || 'draft');
        formData.append('expiryDate', data.expiryDate);
        
        const unit = data.unit || 'portion'; // Default unit if not provided

        // Add pricing (convert Naira to kobo)
        const pricing = {
            retail: {
                price: nairaToKobo(data.originalPrice),
                currency: 'NGN',
                unit: unit,
                minQuantity: 1 // Default minimum quantity
            }
        };
        formData.append('pricing', JSON.stringify(pricing));
        
        // Add inventory
        const inventory = {
            availableStock: data.quantity,
            lowStockThreshold: data.lowStockThreshold || Math.floor(data.quantity * 0.2),
            unit: unit
        };
        formData.append('inventory', JSON.stringify(inventory));
        
        // Add tags
        if (data.tags && data.tags.length > 0) {
            formData.append('tags', JSON.stringify(data.tags));
        }
        
        // Add images
        data.images.forEach((image) => {
            formData.append('images', image);
        });

        // Use fetch directly for multipart/form-data
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/products`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Failed to create product' }));
            throw new Error(error.message || 'Failed to create product');
        }

        const result = await response.json();
        return result.data;
    },

    /**
     * Update product
     */
    async updateProduct(id: string, data: UpdateProductData): Promise<BackendProduct> {
        const response = await apiClient.put<ApiResponse<BackendProduct>>(`/products/${id}`, data);
        return response.data!;
    },

    /**
     * Delete product
     */
    async deleteProduct(id: string): Promise<void> {
        await apiClient.delete<ApiResponse<void>>(`/products/${id}`);
    },

    /**
     * Update product stock
     */
    async updateStock(id: string, quantity: number): Promise<BackendProduct> {
        const response = await apiClient.patch<ApiResponse<BackendProduct>>(`/products/${id}/stock`, {
            availableStock: quantity
        });
        return response.data!;
    },

    /**
     * Increment product view count
     */
    async incrementViewCount(id: string): Promise<void> {
        await apiClient.post(`/products/${id}/view`);
    },

    /**
     * Get product statistics (seller/admin)
     */
    async getProductStats(): Promise<any> {
        const response = await apiClient.get<ApiResponse<any>>('/products/stats/overview');
        return response.data;
    },

    /**
     * Get inventory tracking (seller/admin)
     */
    async getInventoryTracking(filter?: string, sort?: string, order?: string): Promise<any> {
        const params = new URLSearchParams();
        if (filter) params.append('filter', filter);
        if (sort) params.append('sort', sort);
        if (order) params.append('order', order);
        
        const query = params.toString();
        const endpoint = query ? `/products/inventory/tracking?${query}` : '/products/inventory/tracking';
        
        const response = await apiClient.get<ApiResponse<any>>(endpoint);
        return response.data;
    }
};
