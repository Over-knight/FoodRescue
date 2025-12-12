import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { MOCK_USERS } from '../services/mockData';
import { authService } from '../services/authService';

interface AuthContextType {
    user: User | null;
    login: (role: 'consumer' | 'restaurant' | 'stores' | 'ngo' | 'admin') => void;
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
        // Check if user is authenticated
        const currentUser = authService.getCurrentUser();
        if (currentUser) {
            setUser(currentUser);
        }
        setLoading(false);
    }, []);

    // Demo login (for quick testing)
    const login = (role: 'consumer' | 'restaurant' | 'stores' | 'ngo' | 'admin') => {
        const mockUser = MOCK_USERS.find(u => u.role === role);
        if (mockUser) {
            setUser(mockUser);
            localStorage.setItem('food_rescue_user', JSON.stringify(mockUser));
        }
    };

    // Real login with credentials
    const loginWithCredentials = async (email: string, password: string) => {
        try {
            const response = await authService.login({ email, password });
            setUser(response.user as User);
        } catch (error: any) {
            throw new Error(error.message || 'Login failed');
        }
    };

    const logout = () => {
        setUser(null);
        authService.logout();
    };

    return (
        <AuthContext.Provider value={{ user, login, loginWithCredentials, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
