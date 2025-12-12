import React from 'react';
import { Link } from 'react-router-dom';
import { Food } from '../types';

interface FoodCardProps {
    food: Food;
}

export const FoodCard: React.FC<FoodCardProps> = ({ food }) => {
    return (
        <div className="card">
            <div style={{ position: 'relative', height: '200px' }}>
                <img
                    src={food.image}
                    alt={food.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
                    <span className="badge badge-discount">-{food.discountPercent}% OFF</span>
                </div>
            </div>
            <div style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                    <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{food.name}</h3>
                </div>
                <p style={{ color: '#6B7280', margin: '0 0 1rem 0', fontSize: '0.9rem' }}>
                    {food.description}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                    <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                        ₦{food.discountedPrice}
                    </span>
                    <span style={{ textDecoration: 'line-through', color: '#9CA3AF' }}>
                        ₦{food.originalPrice}
                    </span>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.875rem', color: '#6B7280', marginBottom: '1rem' }}>
                    <span>🕒 Expires in {new Date(food.expiryTime).getHours() - new Date().getHours()}h</span>
                    <span>•</span>
                    <span>{food.quantity} left</span>
                </div>

                <Link to={`/checkout/${food.id}`} className="btn btn-primary" style={{ width: '100%', textDecoration: 'none', boxSizing: 'border-box' }}>
                    Rescue Meal
                </Link>
            </div>
        </div>
    );
};
