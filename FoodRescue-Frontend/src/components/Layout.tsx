import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Icons } from './Icons';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const location = useLocation();
    const { user, logout } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const toggleMobileMenu = () => {
        setMobileMenuOpen(!mobileMenuOpen);
    };

    const closeMobileMenu = () => {
        setMobileMenuOpen(false);
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <nav className="navbar">
                <div className="container nav-content">
                    <Link to="/" className="logo" onClick={closeMobileMenu}>
                        FoodRescue
                    </Link>

                    {/* Hamburger Icon - Mobile Only */}
                    <button
                        onClick={toggleMobileMenu}
                        style={{
                            display: 'none',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '0.5rem',
                            color: 'var(--text-primary)'
                        }}
                        className="mobile-menu-toggle"
                        aria-label="Toggle menu"
                    >
                        {mobileMenuOpen ? <Icons.X size={24} /> : <Icons.Menu size={24} />}
                    </button>

                    {/* Navigation Links */}
                    <div className={`nav-links ${mobileMenuOpen ? 'mobile-open' : ''}`}>
                        <Link
                            to="/"
                            className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
                            onClick={closeMobileMenu}
                        >
                            Browse
                        </Link>

                        {(user?.role === 'restaurant' || user?.role === 'seller' || user?.role === 'stores' || user?.role === 'ngo') && (
                            <>
                                <Link
                                    to="/dashboard"
                                    className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}
                                    onClick={closeMobileMenu}
                                >
                                    Dashboard
                                </Link>
                                <Link
                                    to="/analytics"
                                    className={`nav-link ${location.pathname === '/analytics' ? 'active' : ''}`}
                                    onClick={closeMobileMenu}
                                >
                                    Analytics
                                </Link>
                            </>
                        )}

                        {user?.role === 'admin' && (
                            <Link
                                to="/admin"
                                className={`nav-link ${location.pathname === '/admin' ? 'active' : ''}`}
                                onClick={closeMobileMenu}
                            >
                                Admin Panel
                            </Link>
                        )}

                        {(user?.role === 'consumer' || user?.role === 'customer' || user?.role === 'ngo') && (
                            <Link
                                to="/orders"
                                className={`nav-link ${location.pathname === '/orders' ? 'active' : ''}`}
                                onClick={closeMobileMenu}
                            >
                                My Orders
                            </Link>
                        )}

                        {user ? (
                            <button
                                onClick={() => {
                                    logout();
                                    closeMobileMenu();
                                }}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444', fontWeight: 500, fontSize: '1rem' }}
                                className="logout-btn"
                            >
                                Logout
                            </button>
                        ) : (
                            <Link
                                to="/login"
                                className={`nav-link ${location.pathname === '/login' ? 'active' : ''}`}
                                onClick={closeMobileMenu}
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
