import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { MOCK_USERS } from '../services/mockData';
import { authAPI } from '../services/api';

interface AuthContextType {
    user: User | null;
    login: (role: 'consumer' | 'restaurant' | 'grocery' | 'ngo' | 'admin') => void;
    loginWithCredentials: (email: string, password: string) => Promise<void>;
    logout: () => void;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    login: () => { },
    loginWithCredentials: async () => { },
    logout: () => { },
    loading: false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check local storage on load
        const savedUser = localStorage.getItem('food_rescue_user');
        const token = localStorage.getItem('token');

        if (savedUser) {
            setUser(JSON.parse(savedUser));
        } else if (token) {
            // If we have a token but no saved user, fetch user from API
            fetchCurrentUser();
        }
        setLoading(false);
    }, []);

    const fetchCurrentUser = async () => {
        try {
            const response = await authAPI.getCurrentUser();
            if (response.success) {
                setUser(response.data);
                localStorage.setItem('food_rescue_user', JSON.stringify(response.data));
            }
        } catch (error) {
            console.error('Failed to fetch user:', error);
            authAPI.logout();
        }
    };

    // Demo login (for quick testing)
    const login = (role: 'consumer' | 'restaurant' | 'grocery' | 'ngo' | 'admin') => {
        const mockUser = MOCK_USERS.find(u => u.role === role);
        if (mockUser) {
            setUser(mockUser);
            localStorage.setItem('food_rescue_user', JSON.stringify(mockUser));
        }
    };

    // Real login with credentials
    const loginWithCredentials = async (email: string, password: string) => {
        try {
            const response = await authAPI.login(email, password);
            if (response.success) {
                setUser(response.user);
                localStorage.setItem('food_rescue_user', JSON.stringify(response.user));
            }
        } catch (error: any) {
            throw new Error(error.response?.data?.error || 'Login failed');
        }
    };

    const logout = () => {
        setUser(null);
        authAPI.logout();
    };

    return (
        <AuthContext.Provider value={{ user, login, loginWithCredentials, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
