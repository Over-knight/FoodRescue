import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';

export const Signup: React.FC = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [role, setRole] = useState<'consumer' | 'restaurant' | 'grocery' | 'ngo'>('consumer');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        // Restaurant/NGO specific
        organizationName: '',
        contactPerson: '',
        address: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Call the actual signup API
            await authService.signup({
                name: formData.name,
                email: formData.email,
                password: formData.password,
                role: role,
                phone: formData.phone || undefined,
                location: formData.address ? {
                    address: formData.address,
                    lat: 0, // TODO: Get actual coordinates
                    lng: 0
                } : undefined
            });

            // Use window.location to force page reload and AuthContext update
            if (role === 'restaurant' || role === 'grocery') {
                window.location.href = '/dashboard';
            } else if (role === 'consumer') {
                window.location.href = '/onboarding';
            } else {
                window.location.href = '/';
            }
        } catch (err: any) {
            setError(err.message || 'Signup failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div style={{ maxWidth: '600px', margin: '4rem auto', padding: '0 1rem' }}>
            <div className="card" style={{ padding: '3rem', background: 'white' }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '2rem', background: '#ECFDF5', padding: '2rem', borderRadius: '0.5rem', margin: '-3rem -3rem 2rem -3rem' }}>
                    <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.75rem', color: 'var(--text-main)' }}>Create your account</h2>
                    <p style={{ margin: 0, color: 'var(--text-muted)' }}>Join the movement to reduce food waste in Lagos</p>
                </div>

                {/* Role Selector */}
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', justifyContent: 'center' }}>
                    <button
                        type="button"
                        onClick={() => setRole('consumer')}
                        style={{
                            padding: '0.75rem 1.5rem',
                            borderRadius: '0.5rem',
                            border: role === 'consumer' ? '2px solid var(--primary)' : '1px solid #E5E7EB',
                            background: role === 'consumer' ? '#ECFDF5' : 'white',
                            color: role === 'consumer' ? 'var(--primary)' : 'var(--text-muted)',
                            fontWeight: 500,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            transition: 'all 0.2s'
                        }}
                    >
                        <span>👤</span> Consumer
                    </button>
                    <button
                        type="button"
                        onClick={() => setRole('restaurant')}
                        style={{
                            padding: '0.75rem 1.5rem',
                            borderRadius: '0.5rem',
                            border: role === 'restaurant' ? '2px solid var(--primary)' : '1px solid #E5E7EB',
                            background: role === 'restaurant' ? '#ECFDF5' : 'white',
                            color: role === 'restaurant' ? 'var(--primary)' : 'var(--text-muted)',
                            fontWeight: 500,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            transition: 'all 0.2s'
                        }}
                    >
                        Restaurant
                    </button>
                    <button
                        type="button"
                        onClick={() => setRole('grocery')}
                        style={{
                            padding: '0.75rem 1.5rem',
                            borderRadius: '0.5rem',
                            border: role === 'grocery' ? '2px solid var(--primary)' : '1px solid #E5E7EB',
                            background: role === 'grocery' ? '#ECFDF5' : 'white',
                            color: role === 'grocery' ? 'var(--primary)' : 'var(--text-muted)',
                            fontWeight: 500,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            transition: 'all 0.2s'
                        }}
                    >
                        Grocery Store
                    </button>
                    <button
                        type="button"
                        onClick={() => setRole('ngo')}
                        style={{
                            padding: '0.75rem 1.5rem',
                            borderRadius: '0.5rem',
                            border: role === 'ngo' ? '2px solid var(--primary)' : '1px solid #E5E7EB',
                            background: role === 'ngo' ? '#ECFDF5' : 'white',
                            color: role === 'ngo' ? 'var(--primary)' : 'var(--text-muted)',
                            fontWeight: 500,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            transition: 'all 0.2s'
                        }}
                    >
                        NGO
                    </button>
                </div>

                {/* Error Message */}
                {error && (
                    <div style={{
                        background: '#FEE2E2',
                        color: '#991B1B',
                        padding: '0.75rem 1rem',
                        borderRadius: '0.5rem',
                        marginBottom: '1rem',
                        fontSize: '0.9rem'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    {/* Consumer Form */}
                    {role === 'consumer' && (
                        <>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 500 }}>Full Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #D1D5DB', fontSize: '0.95rem' }}
                                        placeholder="John Doe"
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 500 }}>Phone Number</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #D1D5DB', fontSize: '0.95rem' }}
                                        placeholder="+234..."
                                    />
                                </div>
                            </div>
                        </>
                    )}

                    {/* Restaurant Form */}
                    {role === 'restaurant' && (
                        <>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 500 }}>Restaurant Name</label>
                                <div style={{ position: 'relative' }}>

                                    <input
                                        type="text"
                                        name="organizationName"
                                        value={formData.organizationName}
                                        onChange={handleChange}
                                        required
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #D1D5DB', fontSize: '0.95rem' }}
                                        placeholder="Mama's Kitchen"
                                    />
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 500 }}>Owner Name</label>
                                    <div style={{ position: 'relative' }}>
                                        <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }}>👤</span>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                            style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #D1D5DB', fontSize: '0.95rem' }}
                                            placeholder="John Doe"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 500 }}>Phone Number</label>
                                    <div style={{ position: 'relative' }}>
                                        <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }}>📱</span>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            required
                                            style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #D1D5DB', fontSize: '0.95rem' }}
                                            placeholder="+234..."
                                        />
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 500 }}>Restaurant Address</label>
                                <div style={{ position: 'relative' }}>

                                    <input
                                        type="text"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        required
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #D1D5DB', fontSize: '0.95rem' }}
                                        placeholder="123 Lekki Phase 1, Lagos"
                                    />
                                </div>
                            </div>
                        </>
                    )}

                    {/* NGO Form */}
                    {role === 'ngo' && (
                        <>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 500 }}>Organization Name</label>
                                <div style={{ position: 'relative' }}>

                                    <input
                                        type="text"
                                        name="organizationName"
                                        value={formData.organizationName}
                                        onChange={handleChange}
                                        required
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #D1D5DB', fontSize: '0.95rem' }}
                                        placeholder="Lagos Food Bank"
                                    />
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 500 }}>Contact Person</label>
                                    <div style={{ position: 'relative' }}>
                                        <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }}>👤</span>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                            style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #D1D5DB', fontSize: '0.95rem' }}
                                            placeholder="Jane Smith"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 500 }}>Phone Number</label>
                                    <div style={{ position: 'relative' }}>
                                        <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }}>📱</span>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            required
                                            style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #D1D5DB', fontSize: '0.95rem' }}
                                            placeholder="+234..."
                                        />
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 500 }}>Office Address</label>
                                <div style={{ position: 'relative' }}>

                                    <input
                                        type="text"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        required
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #D1D5DB', fontSize: '0.95rem' }}
                                        placeholder="45 Ikeja GRA, Lagos"
                                    />
                                </div>
                            </div>
                        </>
                    )}

                    {/* Grocery Store Form */}
                    {role === 'grocery' && (
                        <>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 500 }}>Store Name</label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type="text"
                                        name="organizationName"
                                        value={formData.organizationName}
                                        onChange={handleChange}
                                        required
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #D1D5DB', fontSize: '0.95rem' }}
                                        placeholder="Lagos Fresh Market"
                                    />
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 500 }}>Owner Name</label>
                                    <div style={{ position: 'relative' }}>
                                        <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }}>👤</span>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                            style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #D1D5DB', fontSize: '0.95rem' }}
                                            placeholder="John Doe"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 500 }}>Phone Number</label>
                                    <div style={{ position: 'relative' }}>
                                        <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }}>📱</span>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            required
                                            style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #D1D5DB', fontSize: '0.95rem' }}
                                            placeholder="+234..."
                                        />
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 500 }}>Store Address</label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type="text"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        required
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #D1D5DB', fontSize: '0.95rem' }}
                                        placeholder="10 Balogun Street, Lagos"
                                    />
                                </div>
                            </div>
                        </>
                    )}


                    {/* Common Fields */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 500 }}>Email Address</label>
                        <div style={{ position: 'relative' }}>

                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #D1D5DB', fontSize: '0.95rem' }}
                                placeholder="name@company.com"
                            />
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 500 }}>Password</label>
                        <div style={{ position: 'relative' }}>
                            <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }}>🔒</span>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #D1D5DB', fontSize: '0.95rem' }}
                                placeholder="Create a strong password"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-primary"
                        style={{
                            width: '100%',
                            marginTop: '1rem',
                            padding: '1rem',
                            fontSize: '1rem',
                            fontWeight: 600,
                            cursor: loading ? 'not-allowed' : 'pointer',
                            opacity: loading ? 0.7 : 1
                        }}
                    >
                        {loading ? 'Creating Account...' : 'Create Account'}
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Already have an account? </span>
                    <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>Log in</Link>
                </div>
            </div>
        </div>
    );
};
