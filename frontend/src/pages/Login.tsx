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
        <div style={{ maxWidth: '400px', margin: '4rem auto' }}>
            <div className="card" style={{ padding: '2rem' }}>
                <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Welcome Back</h2>

                {error && (
                    <div style={{ background: '#FEE2E2', color: '#991B1B', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>
                        {error}
                    </div>
                )}

                {/* Real Form */}
                <form onSubmit={handleRealLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #D1D5DB' }}
                            placeholder="you@example.com"
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #D1D5DB' }}
                            placeholder="••••••••"
                        />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Don't have an account? </span>
                    <Link to="/signup" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>Sign up</Link>
                </div>

                <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: '1.5rem' }}></div>

                {/* Demo Section Toggle */}
                <div style={{ textAlign: 'center' }}>
                    <button
                        type="button"
                        onClick={() => setShowDemoAccess(!showDemoAccess)}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#EA580C',
                            fontSize: '0.9rem',
                            cursor: 'pointer',
                            textDecoration: 'none',
                            padding: '0.5rem',
                        }}
                    >
                        {showDemoAccess ? 'Hide Demo Access' : 'Show Demo Access (For Testing)'}
                    </button>
                </div>

                {/* Demo Buttons (Collapsible) */}
                {showDemoAccess && (
                    <div style={{ marginTop: '1rem', animation: 'fadeIn 0.3s ease-in' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                            <button
                                onClick={() => handleDemoLogin('consumer')}
                                className="btn"
                                style={{ padding: '0.5rem', fontSize: '0.85rem', background: '#F3F4F6', color: 'var(--text-main)' }}
                            >
                                Consumer
                            </button>

                            <button
                                onClick={() => handleDemoLogin('restaurant')}
                                className="btn"
                                style={{ padding: '0.5rem', fontSize: '0.85rem', background: '#F3F4F6', color: 'var(--text-main)' }}
                            >
                                Restaurant
                            </button>

                            <button
                                onClick={() => handleDemoLogin('grocery')}
                                className="btn"
                                style={{ padding: '0.5rem', fontSize: '0.85rem', background: '#F3F4F6', color: 'var(--text-main)' }}
                            >
                                Grocery Store
                            </button>

                            <button
                                onClick={() => handleDemoLogin('ngo')}
                                className="btn"
                                style={{ padding: '0.5rem', fontSize: '0.85rem', background: '#F3F4F6', color: 'var(--text-main)' }}
                            >
                                NGO
                            </button>

                            <button
                                onClick={() => handleDemoLogin('admin')}
                                className="btn"
                                style={{ padding: '0.5rem', fontSize: '0.85rem', background: '#F3F4F6', color: 'var(--text-main)' }}
                            >
                                Admin
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
