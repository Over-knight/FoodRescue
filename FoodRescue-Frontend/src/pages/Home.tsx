import React, { useState, useEffect } from 'react';
import { getActiveFoods, MOCK_USERS } from '../services/mockData';
import { smartMatchFoods } from '../services/aiService';
import { Food } from '../types';
import { Link } from 'react-router-dom';

export const Home: React.FC = () => {
    const [foods, setFoods] = useState<Food[]>([]);
    const [filter, setFilter] = useState<'all' | 'meals' | 'groceries'>('all');
    const user = MOCK_USERS[0]; // Simulate logged-in user

    useEffect(() => {
        // Simulate API fetch
        const allFoods = getActiveFoods();
        // Apply AI Matching
        const matchedFoods = smartMatchFoods(user, allFoods);
        setFoods(matchedFoods);
    }, [user]);

    return (
        <div>
            {/* Header */}
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Food Near You</h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                    <span>📍</span>
                    <span>Lagos, Nigeria (Within 3km)</span>
                </div>
            </div>

            {/* Filter Tabs */}
            <div style={{
                display: 'flex',
                gap: '1rem',
                marginBottom: '2rem',
                borderBottom: '2px solid #E5E7EB',
                paddingBottom: '0'
            }}>
                <button
                    onClick={() => setFilter('all')}
                    style={{
                        padding: '0.75rem 1.5rem',
                        background: 'none',
                        border: 'none',
                        borderBottom: filter === 'all' ? '3px solid var(--primary)' : '3px solid transparent',
                        color: filter === 'all' ? 'var(--primary)' : 'var(--text-muted)',
                        fontWeight: filter === 'all' ? 600 : 500,
                        cursor: 'pointer',
                        fontSize: '1rem',
                        transition: 'all 0.2s',
                        marginBottom: '-2px'
                    }}
                >
                    🍽️ All Items
                </button>
                <button
                    onClick={() => setFilter('meals')}
                    style={{
                        padding: '0.75rem 1.5rem',
                        background: 'none',
                        border: 'none',
                        borderBottom: filter === 'meals' ? '3px solid var(--primary)' : '3px solid transparent',
                        color: filter === 'meals' ? 'var(--primary)' : 'var(--text-muted)',
                        fontWeight: filter === 'meals' ? 600 : 500,
                        cursor: 'pointer',
                        fontSize: '1rem',
                        transition: 'all 0.2s',
                        marginBottom: '-2px'
                    }}
                >
                    🍱 Meals
                </button>
                <button
                    onClick={() => setFilter('groceries')}
                    style={{
                        padding: '0.75rem 1.5rem',
                        background: 'none',
                        border: 'none',
                        borderBottom: filter === 'groceries' ? '3px solid var(--primary)' : '3px solid transparent',
                        color: filter === 'groceries' ? 'var(--primary)' : 'var(--text-muted)',
                        fontWeight: filter === 'groceries' ? 600 : 500,
                        cursor: 'pointer',
                        fontSize: '1rem',
                        transition: 'all 0.2s',
                        marginBottom: '-2px'
                    }}
                >
                    🛒 Groceries
                </button>
            </div>

            {/* Top Picks Banner */}
            <div style={{
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                padding: '1.5rem 2rem',
                borderRadius: '1rem',
                marginBottom: '2rem',
                color: 'white'
            }}>
                <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.5rem' }}>Top Picks For You</h2>
                <p style={{ margin: 0, opacity: 0.9 }}>Based on your love for Rice, Pastry</p>
            </div>

            {/* Food Cards - Horizontal Layout */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {foods
                    .filter(food => {
                        // Filter based on selected tab
                        if (filter === 'all') return true;
                        if (filter === 'meals') {
                            // Meals are from restaurants or have cooked foodType
                            return food.category && !['Fresh Produce', 'Dairy', 'Bread & Bakery', 'Packaged Goods'].includes(food.category);
                        }
                        if (filter === 'groceries') {
                            // Groceries are the new categories
                            return food.category && ['Fresh Produce', 'Dairy', 'Bread & Bakery', 'Packaged Goods'].includes(food.category);
                        }
                        return true;
                    })
                    .map(food => (
                        <div key={food.id} className="card" style={{
                            display: 'grid',
                            gridTemplateColumns: '300px 1fr',
                            overflow: 'hidden',
                            transition: 'transform 0.2s, box-shadow 0.2s'
                        }}>
                            {/* Image Section */}
                            <div style={{ position: 'relative', height: '200px' }}>
                                <img
                                    src={food.image}
                                    alt={food.name}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                                <span className="badge badge-discount" style={{
                                    position: 'absolute',
                                    top: '1rem',
                                    right: '1rem',
                                    background: 'var(--primary)',
                                    color: 'white',
                                    fontSize: '0.9rem',
                                    padding: '0.5rem 1rem'
                                }}>
                                    -{food.discountPercent}% OFF
                                </span>
                                <div style={{
                                    position: 'absolute',
                                    bottom: '1rem',
                                    left: '1rem',
                                    background: 'rgba(0,0,0,0.7)',
                                    color: 'white',
                                    padding: '0.25rem 0.75rem',
                                    borderRadius: '0.5rem',
                                    fontSize: '0.85rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.25rem'
                                }}>
                                    📍 {Math.floor(Math.random() * 5) + 1}.{Math.floor(Math.random() * 10)} km
                                </div>
                            </div>

                            {/* Details Section */}
                            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                <div>
                                    <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem' }}>{food.name}</h3>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0 0 0.5rem 0' }}>
                                        Mama Put Lagos
                                    </p>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0 0 1rem 0' }}>
                                        {food.description}
                                    </p>

                                    {/* Time and Quantity Info */}
                                    <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <span style={{ color: '#EF4444' }}>⏰</span>
                                            <span>{Math.floor(Math.random() * 12) + 1}h {Math.floor(Math.random() * 60)}m left</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <span>📦</span>
                                            <span>{food.quantity} left</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Price and Button */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                                            ₦{food.originalPrice}
                                        </div>
                                        <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                                            ₦{food.discountedPrice}
                                        </div>
                                    </div>
                                    <Link
                                        to={`/checkout/${food.id}`}
                                        className="btn btn-primary"
                                        style={{
                                            padding: '0.75rem 2rem',
                                            textDecoration: 'none'
                                        }}
                                    >
                                        Rescue Meal
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
            </div>
        </div>
    );
};
