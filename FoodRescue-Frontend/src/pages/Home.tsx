import React, { useState, useEffect } from 'react';
import { foodService } from '../services/foodService';
import { Food } from '../types';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Icons } from '../components/Icons';

// Helper: Calculate time remaining until expiry
const getTimeRemaining = (expiryTime: string) => {
    const now = new Date().getTime();
    const expiry = new Date(expiryTime).getTime();
    const diff = expiry - now;

    if (diff <= 0) return 'Expired';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    // Show days if more than 24 hours
    if (days > 0) {
        return `${days} day${days > 1 ? 's' : ''} left`;
    }

    // Show hours and minutes if less than a day
    if (hours > 0) {
        return `${hours}h ${minutes}m left`;
    }

    // Show only minutes if less than an hour
    return `${minutes}m left`;
};

export const Home: React.FC = () => {
    const [foods, setFoods] = useState<Food[]>([]);
    const [filter, setFilter] = useState<'all' | 'meals' | 'groceries'>('all');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();

    useEffect(() => {
        const fetchFoods = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await foodService.getAllFoods();
                setFoods(data);
            } catch (err: any) {
                console.error('Error fetching foods:', err);
                setError('Failed to load food items. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchFoods();
    }, []);

    return (
        <div>
            {/* Header */}
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Food Near You</h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                    <Icons.MapPin size={16} />
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
                    <Icons.UtensilsCrossed size={16} /> All Items
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
                    <Icons.Restaurant size={16} /> Meals
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
                    <Icons.ShoppingBag size={16} /> Groceries
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
                <p style={{ margin: 0, opacity: 0.9 }}>Fresh deals from local vendors</p>
            </div>

            {/* Loading State */}
            {loading && (
                <div style={{ textAlign: 'center', padding: '3rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                        <Icons.Loader size={48} color="var(--primary)" />
                    </div>
                    <p style={{ color: 'var(--text-muted)' }}>Loading delicious deals...</p>
                </div>
            )}

            {/* Error State */}
            {error && (
                <div style={{
                    background: '#FEE2E2',
                    border: '1px solid #EF4444',
                    borderRadius: '0.75rem',
                    padding: '1.5rem',
                    textAlign: 'center'
                }}>
                    <p style={{ color: '#EF4444', margin: 0 }}>{error}</p>
                </div>
            )}

            {/* Food Cards - Horizontal Layout */}
            {!loading && !error && foods.length === 0 && (
                <div style={{ textAlign: 'center', padding: '3rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                        <Icons.UtensilsCrossed size={48} color="var(--text-muted)" />
                    </div>
                    <p style={{ color: 'var(--text-muted)' }}>No food items available at the moment.</p>
                </div>
            )}
            <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '1.5rem',
                width: '100%'
            }}>
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
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden',
                            transition: 'transform 0.2s, box-shadow 0.2s',
                            cursor: 'pointer',
                            flex: '1 1 calc(33.333% - 1rem)',
                            minWidth: '280px',
                            maxWidth: '400px'
                        }}>
                            {/* Image Section */}
                            <div style={{ position: 'relative', height: '200px', overflow: 'hidden' }}>
                                <img
                                    src={food.image || 'https://via.placeholder.com/400x200?text=No+Image'}
                                    alt={food.name}
                                    onError={(e) => {
                                        e.currentTarget.src = 'https://via.placeholder.com/400x200?text=No+Image';
                                    }}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                                {food.discountPercent > 0 && (
                                    <span style={{
                                        position: 'absolute',
                                        top: '0.75rem',
                                        right: '0.75rem',
                                        background: '#FF6B35',
                                        color: 'white',
                                        fontSize: '0.85rem',
                                        fontWeight: 'bold',
                                        padding: '0.4rem 0.8rem',
                                        borderRadius: '0.5rem'
                                    }}>
                                        -{food.discountPercent}% OFF
                                    </span>
                                )}
                            </div>

                            {/* Details Section */}
                            <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                                <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', fontWeight: 'bold' }}>
                                    {food.name}
                                </h3>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: '0 0 0.75rem 0' }}>
                                    {food.category || 'Food Item'}
                                </p>
                                <p style={{
                                    color: 'var(--text-muted)',
                                    fontSize: '0.875rem',
                                    margin: '0 0 1rem 0',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    lineHeight: '1.4'
                                }}>
                                    {food.description}
                                </p>

                                {/* Time and Quantity Info */}
                                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                        <Icons.Clock size={14} color="#EF4444" />
                                        <span>{getTimeRemaining(food.expiryTime)}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                        <Icons.Package size={14} />
                                        <span>{food.quantity} {food.quantityType} left</span>
                                    </div>
                                </div>

                                {/* Price Section */}
                                <div style={{ marginBottom: '1rem', marginTop: 'auto' }}>
                                    {food.discountPercent > 0 && (
                                        <div style={{
                                            fontSize: '0.9rem',
                                            color: 'var(--text-muted)',
                                            textDecoration: 'line-through',
                                            marginBottom: '0.25rem'
                                        }}>
                                            ₦{food.originalPrice.toLocaleString()}
                                        </div>
                                    )}
                                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                                        ₦{food.discountedPrice.toLocaleString()}
                                    </div>
                                </div>

                                {/* Button */}
                                <Link
                                    to={`/checkout/${food.id}`}
                                    className="btn btn-primary"
                                    style={{
                                        padding: '0.75rem 1rem',
                                        textDecoration: 'none',
                                        textAlign: 'center',
                                        width: '100%',
                                        display: 'block'
                                    }}
                                >
                                    Rescue Meal
                                </Link>
                            </div>
                        </div>
                    ))}
            </div>
        </div>
    );
};
