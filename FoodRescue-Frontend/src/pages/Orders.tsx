import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUserOrders } from '../services/mockData';
import { Link } from 'react-router-dom';

export const Orders: React.FC = () => {
    const { user } = useAuth();
    const [orders, setOrders] = useState<any[]>([]);

    useEffect(() => {
        if (user) {
            setOrders(getUserOrders(user.id));
        }
    }, [user]);

    if (!user) return <div>Please login to view orders.</div>;

    return (
        <div>
            <h1 style={{ marginBottom: '2rem' }}>My Rescues</h1>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {orders.map(order => (
                    <div key={order.id} className="card" style={{ padding: '1.5rem', display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                        <div style={{ flexShrink: 0 }}>
                            <img
                                src={order.food?.image || 'https://via.placeholder.com/100'}
                                alt={order.food?.name}
                                style={{ width: '100px', height: '100px', borderRadius: '0.5rem', objectFit: 'cover' }}
                            />
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <h3 style={{ margin: 0 }}>{order.food?.name}</h3>
                                <span className={`badge ${order.status === 'picked-up' ? 'badge-success' : 'badge-warning'}`}
                                    style={{ background: order.status === 'picked-up' ? '#D1FAE5' : '#FEF3C7', color: order.status === 'picked-up' ? '#065F46' : '#D97706' }}>
                                    {order.status === 'picked-up' ? 'Picked Up' : 'Reserved'}
                                </span>
                            </div>
                            <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-muted)' }}>
                                From <strong>{order.restaurant?.name}</strong> • {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                                <div style={{ fontWeight: 'bold' }}>₦{order.totalPrice}</div>
                                <div style={{ fontSize: '0.9rem' }}>Qty: {order.quantity}</div>
                                {order.status === 'reserved' && (
                                    <div style={{ padding: '0.25rem 0.75rem', background: '#F3F4F6', borderRadius: '0.5rem', border: '1px solid #D1D5DB' }}>
                                        Code: <strong>{order.pickupCode}</strong>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}

                {orders.length === 0 && (
                    <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
                        <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)' }}>No rescues yet.</p>
                        <Link to="/" className="btn btn-primary" style={{ marginTop: '1rem', textDecoration: 'none' }}>
                            Browse Food
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};
