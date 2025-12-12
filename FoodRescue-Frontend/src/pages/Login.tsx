import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Login: React.FC = () => {
    const { login, loginWithCredentials } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showDemoAccess, setShowDemoAccess] = useState(false);

    const handleRealLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await loginWithCredentials(email, password);
            navigate('/');
        } catch (err: any) {
            setError(err.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    const handleDemoLogin = (role: 'consumer' | 'restaurant' | 'grocery' | 'ngo' | 'admin') => {
        login(role);
        if (role === 'restaurant' || role === 'grocery') {
            navigate('/dashboard');
        } else if (role === 'admin') {
            navigate('/admin');
        } else {
            navigate('/');
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            background: '#F3F4F6'
        }}>
            {/* Left Side - Login Form */}
            <div style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem',
                background: 'white'
            }}>
                <div style={{ width: '100%', maxWidth: '420px' }}>
                    {/* Logo */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2.5rem' }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            background: 'var(--primary)',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: '1.25rem'
                        }}>
                            FR
                        </div>
                        <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)' }}>
                            FoodRescue Lagos
                        </span>
                    </div>

                    {/* Heading */}
                    <h1 style={{
                        fontSize: '2rem',
                        fontWeight: 700,
                        color: 'var(--text-main)',
                        marginBottom: '0.5rem'
                    }}>
                        Welcome Back
                    </h1>
                    <p style={{
                        color: '#6B7280',
                        marginBottom: '2rem',
                        fontSize: '0.95rem'
                    }}>
                        Login to manage your orders or rescue food.
                    </p>

                    {error && (
                        <div style={{
                            background: '#FEE2E2',
                            color: '#991B1B',
                            padding: '0.75rem 1rem',
                            borderRadius: '0.5rem',
                            marginBottom: '1.5rem',
                            fontSize: '0.9rem'
                        }}>
                            {error}
                        </div>
                    )}

                    {/* Login Form */}
                    <form onSubmit={handleRealLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div>
                            <label style={{
                                display: 'block',
                                marginBottom: '0.5rem',
                                fontSize: '0.875rem',
                                fontWeight: 500,
                                color: 'var(--text-main)'
                            }}>
                                Email Address
                            </label>
                            <div style={{ position: 'relative' }}>
                                <span style={{
                                    position: 'absolute',
                                    left: '1rem',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: '#9CA3AF',
                                    fontSize: '1.1rem'
                                }}>

                                </span>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem 1rem 0.75rem 3rem',
                                        borderRadius: '0.5rem',
                                        border: '1px solid #D1D5DB',
                                        fontSize: '0.95rem',
                                        outline: 'none',
                                        transition: 'border-color 0.2s'
                                    }}
                                    placeholder="name@example.com"
                                    onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                                    onBlur={(e) => e.target.style.borderColor = '#D1D5DB'}
                                />
                            </div>
                        </div>

                        <div>
                            <label style={{
                                display: 'block',
                                marginBottom: '0.5rem',
                                fontSize: '0.875rem',
                                fontWeight: 500,
                                color: 'var(--text-main)'
                            }}>
                                Password
                            </label>
                            <div style={{ position: 'relative' }}>
                                <span style={{
                                    position: 'absolute',
                                    left: '1rem',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: '#9CA3AF',
                                    fontSize: '1.1rem'
                                }}>
                                    🔒
                                </span>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem 1rem 0.75rem 3rem',
                                        borderRadius: '0.5rem',
                                        border: '1px solid #D1D5DB',
                                        fontSize: '0.95rem',
                                        outline: 'none',
                                        transition: 'border-color 0.2s'
                                    }}
                                    placeholder="••••••••"
                                    onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                                    onBlur={(e) => e.target.style.borderColor = '#D1D5DB'}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: '100%',
                                padding: '0.875rem',
                                background: 'var(--primary)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '0.5rem',
                                fontSize: '1rem',
                                fontWeight: 600,
                                cursor: loading ? 'not-allowed' : 'pointer',
                                opacity: loading ? 0.7 : 1,
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => !loading && (e.currentTarget.style.background = '#059669')}
                            onMouseLeave={(e) => !loading && (e.currentTarget.style.background = 'var(--primary)')}
                        >
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>

                    <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                        <span style={{ color: '#6B7280', fontSize: '0.9rem' }}>Don't have an account? </span>
                        <Link
                            to="/signup"
                            style={{
                                color: 'var(--primary)',
                                fontWeight: 600,
                                textDecoration: 'none'
                            }}
                        >
                            Sign Up
                        </Link>
                    </div>

                    {/* Demo Access */}
                    <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid #E5E7EB' }}>
                        <button
                            type="button"
                            onClick={() => setShowDemoAccess(!showDemoAccess)}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: '#6B7280',
                                fontSize: '0.85rem',
                                cursor: 'pointer',
                                width: '100%',
                                textAlign: 'center',
                                padding: '0.5rem'
                            }}
                        >
                            {showDemoAccess ? 'Hide Demo Access' : 'Show Demo Access (For Testing)'}
                        </button>

                        {showDemoAccess && (
                            <div style={{
                                marginTop: '1rem',
                                display: 'grid',
                                gridTemplateColumns: 'repeat(2, 1fr)',
                                gap: '0.75rem'
                            }}>
                                {[
                                    { role: 'consumer', label: 'Consumer' },
                                    { role: 'restaurant', label: 'Restaurant' },
                                    { role: 'grocery', label: 'Grocery' },
                                    { role: 'ngo', label: 'NGO' },
                                    { role: 'admin', label: 'Admin' }
                                ].map(({ role, label }) => (
                                    <button
                                        key={role}
                                        onClick={() => handleDemoLogin(role as any)}
                                        style={{
                                            padding: '0.5rem',
                                            fontSize: '0.85rem',
                                            background: '#F3F4F6',
                                            color: 'var(--text-main)',
                                            border: '1px solid #E5E7EB',
                                            borderRadius: '0.375rem',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = '#E5E7EB';
                                            e.currentTarget.style.borderColor = 'var(--primary)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = '#F3F4F6';
                                            e.currentTarget.style.borderColor = '#E5E7EB';
                                        }}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Right Side - Hero Section */}
            <div style={{
                flex: 1,
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                backgroundImage: 'url("https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=1200&q=80")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundBlendMode: 'overlay',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                padding: '4rem',
                color: 'white'
            }}>
                {/* Overlay */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.95) 0%, rgba(5, 150, 105, 0.95) 100%)'
                }} />

                {/* Content */}
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <h2 style={{
                        fontSize: '2.5rem',
                        fontWeight: 800,
                        marginBottom: '1.5rem',
                        lineHeight: 1.2
                    }}>
                        Fight Hunger. Reduce Waste.
                    </h2>
                    <p style={{
                        fontSize: '1.15rem',
                        marginBottom: '3rem',
                        opacity: 0.95,
                        lineHeight: 1.6
                    }}>
                        Join thousands of food heroes rescuing delicious meals from top restaurants and grocery stores at up to 50% off. Save money while making a difference.
                    </p>

                    {/* Stats */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            background: 'rgba(255, 255, 255, 0.15)',
                            padding: '1.25rem',
                            borderRadius: '0.75rem',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255, 255, 255, 0.2)'
                        }}>
                            <div style={{
                                width: '48px',
                                height: '48px',
                                background: 'rgba(255, 255, 255, 0.2)',
                                borderRadius: '0.5rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.5rem'
                            }}>
                                📧
                            </div>
                            <div>
                                <div style={{ fontSize: '1.75rem', fontWeight: 700 }}>50k+ Meals Rescued</div>
                                <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>And counting</div>
                            </div>
                        </div>

                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            background: 'rgba(255, 255, 255, 0.15)',
                            padding: '1.25rem',
                            borderRadius: '0.75rem',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255, 255, 255, 0.2)'
                        }}>
                            <div style={{
                                width: '48px',
                                height: '48px',
                                background: 'rgba(255, 255, 255, 0.2)',
                                borderRadius: '0.5rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.5rem'
                            }}>

                            </div>
                            <div>
                                <div style={{ fontSize: '1.75rem', fontWeight: 700 }}>Support NGOs</div>
                                <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Donate excess easily</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
