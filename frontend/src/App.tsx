import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Checkout } from './pages/Checkout';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Landing } from './pages/Landing';
import { RestaurantDashboard } from './pages/RestaurantDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { Orders } from './pages/Orders';
import { Verification } from './pages/Verification';
import { Onboarding } from './pages/Onboarding';
import { Analytics } from './pages/Analytics';

function App() {
    return (
        <AuthProvider>
            <Router>
                <Layout>
                    <Routes>
                        <Route path="/" element={<AuthenticatedHome />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/signup" element={<Signup />} />
                        <Route path="/onboarding" element={<Onboarding />} />
                        <Route path="/analytics" element={<Analytics />} />
                        <Route path="/dashboard" element={<RestaurantDashboard />} />
                        <Route path="/verification" element={<Verification />} />
                        <Route path="/admin" element={<AdminDashboard />} />
                        <Route path="/orders" element={<Orders />} />
                        <Route path="/checkout/:foodId" element={<Checkout />} />
                        <Route path="*" element={<AuthenticatedHome />} />
                    </Routes>
                </Layout>
            </Router>
        </AuthProvider>
    );
}

// Helper to switch between Landing and Home based on auth
import { useAuth } from './context/AuthContext';
const AuthenticatedHome = () => {
    const { user } = useAuth();
    if (user) return <Home />;
    return <Landing />;
};

export default App;
