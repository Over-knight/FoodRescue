import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const location = useLocation();
    const { user, logout } = useAuth();

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <nav className="navbar">
                <div className="container nav-content">
                    <Link to="/" className="logo">
                        FoodRescue
                    </Link>
                    <div className="nav-links">
                        <Link
                            to="/"
                            className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
                        >
                            Browse
                        </Link>

                        {(user?.role === 'restaurant' || user?.role === 'seller' || user?.role === 'grocery' || user?.role === 'ngo') && (
                            <>
                                <Link
                                    to="/dashboard"
                                    className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}
                                >
                                    Dashboard
                                </Link>
                                <Link
                                    to="/analytics"
                                    className={`nav-link ${location.pathname === '/analytics' ? 'active' : ''}`}
                                >
                                    Analytics
                                </Link>
                            </>
                        )}

                        {user?.role === 'admin' && (
                            <Link
                                to="/admin"
                                className={`nav-link ${location.pathname === '/admin' ? 'active' : ''}`}
                            >
                                Admin Panel
                            </Link>
                        )}

                        {(user?.role === 'consumer' || user?.role === 'customer' || user?.role === 'ngo') && (
                            <Link
                                to="/orders"
                                className={`nav-link ${location.pathname === '/orders' ? 'active' : ''}`}
                            >
                                My Orders
                            </Link>
                        )}

                        {user ? (
                            <button
                                onClick={logout}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444', fontWeight: 500, fontSize: '1rem' }}
                            >
                                Logout
                            </button>
                        ) : (
                            <Link
                                to="/login"
                                className={`nav-link ${location.pathname === '/login' ? 'active' : ''}`}
                            >
                                Login
                            </Link>
                        )}
                    </div>
                </div>
            </nav>
            <main className="container" style={{ flex: 1, paddingBottom: '2rem' }}>
                {children}
            </main>
            <footer style={{ background: '#1F2937', color: 'white', padding: '2rem 0', marginTop: 'auto' }}>
                <div className="container" style={{ textAlign: 'center', opacity: 0.8 }}>
                    <p>© 2025 FoodRescue Lagos. Fighting hunger, reducing waste.</p>
                </div>
            </footer>
        </div>
    );
};
