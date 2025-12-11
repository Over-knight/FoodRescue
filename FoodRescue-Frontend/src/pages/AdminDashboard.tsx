import React from 'react';
import { useAuth } from '../context/AuthContext';
import { MOCK_USERS, MOCK_RESTAURANTS, MOCK_FOODS } from '../services/mockData';

export const AdminDashboard: React.FC = () => {
    const { user } = useAuth();

    if (!user || user.role !== 'admin') {
        return <div>Access Denied</div>;
    }

    const stats = {
        totalUsers: MOCK_USERS.length,
        totalRestaurants: MOCK_RESTAURANTS.length,
        pendingVerifications: 2, // Mocked
        totalOrders: 156, // Mocked
    };

    return (
        <div>
            <h1 style={{ marginBottom: '2rem' }}>Platform Administration</h1>

            {/* Admin Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                <div className="card" style={{ padding: '1.5rem' }}>
                    <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Total Users</h3>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.totalUsers}</div>
                </div>
                <div className="card" style={{ padding: '1.5rem' }}>
                    <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Restaurants</h3>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.totalRestaurants}</div>
                </div>
                <div className="card" style={{ padding: '1.5rem' }}>
                    <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Pending Verifications</h3>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#F59E0B' }}>{stats.pendingVerifications}</div>
                </div>
                <div className="card" style={{ padding: '1.5rem' }}>
                    <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Total Orders</h3>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary)' }}>{stats.totalOrders}</div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <div>
                    <div className="card" style={{ padding: '2rem' }}>
                        <h3 style={{ marginBottom: '1.5rem' }}>Pending Restaurant Requests</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ padding: '1rem', border: '1px solid #E5E7EB', borderRadius: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ fontWeight: 600 }}>Tee's Kitchen</div>
                                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Registered today</div>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>Verify</button>
                                </div>
                            </div>
                            <div style={{ padding: '1rem', border: '1px solid #E5E7EB', borderRadius: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ fontWeight: 600 }}>Mama Tobi Bucateria</div>
                                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Registered yesterday</div>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>Verify</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div>
                    <div className="card" style={{ padding: '2rem' }}>
                        <h3 style={{ marginBottom: '1.5rem' }}>Latest Activity</h3>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                            <p>• <strong>Chidi</strong> rescued <strong>Jollof Rice</strong> from <strong>Taste of Lagos</strong></p>
                            <p>• <strong>New Signup</strong>: Lagos Food Bank (NGO)</p>
                            <p>• <strong>Taste of Lagos</strong> posted 5 new items</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
