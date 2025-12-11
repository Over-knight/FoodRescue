import { apiClient } from './apiClient';

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface SignupData {
    name: string;
    email: string;
    password: string;
    role: 'consumer' | 'restaurant' | 'grocery' | 'ngo';
    phone?: string;
    location?: {
        address: string;
        lat: number;
        lng: number;
    };
}

export interface BackendAuthResponse {
    success: boolean;
    message: string;
    data: {
        token: string;
        user: {
            id: string;
            name: string;
            email: string;
            role: string;
        };
    };
}

export interface AuthResponse {
    token: string;
    user: {
        id: string;
        name: string;
        email: string;
        role: string;
    };
}

export const authService = {
    // Login
    async login(credentials: LoginCredentials): Promise<AuthResponse> {
        const response = await apiClient.post<BackendAuthResponse>('/auth/login', credentials);
        const { token, user } = response.data;
        if (token) {
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
        }
        return { token, user };
    },

    // Signup
    async signup(data: SignupData): Promise<AuthResponse> {
        const response = await apiClient.post<BackendAuthResponse>('/auth/signup', data);
        const { token, user } = response.data;
        if (token) {
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
        }
        return { token, user };
    },

    // Logout
    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },

    // Get current user
    getCurrentUser() {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    },

    // Check if authenticated
    isAuthenticated(): boolean {
        return !!localStorage.getItem('token');
    },
};
