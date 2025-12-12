import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { foodService } from '../services/foodService';
import { orderService } from '../services/orderService';
import { Food } from '../types';
import { BackendOrder } from '../types/api';

export const Checkout: React.FC = () => {
    const { foodId } = useParams<{ foodId: string }>();
    const [food, setFood] = useState<Food | undefined>();
    const [loading, setLoading] = useState(true);
    const [processingPayment, setProcessingPayment] = useState(false);
    const [order, setOrder] = useState<BackendOrder | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchFood = async () => {
            if (foodId) {
                try {
                    setLoading(true);
                    const data = await foodService.getFoodById(foodId);
                    setFood(data);
                } catch (err) {
                    setError('Failed to load product details.');
                    console.error(err);
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchFood();
    }, [foodId]);

    const handlePayment = async () => {
        if (!food) return;

        setProcessingPayment(true);
        try {
            // Simulate Paystack Payment Delay for UX
            await new Promise(resolve => setTimeout(resolve, 1500));

            const newOrder = await orderService.createOrder({
                productId: food.id,
                quantity: quantity
            });

            setOrder(newOrder);
        } catch (err) {
            console.error('Payment/Order failed:', err);
            alert('Failed to process order. Please try again.');
        } finally {
            setProcessingPayment(false);
        }
    };

    if (loading) {
        return (
            <div style={{ padding: '4rem', textAlign: 'center' }}>
                <h2>Loading Checkout...</h2>
            </div>
        );
    }

    if (error || !food) {
        return (
            <div style={{ padding: '4rem', textAlign: 'center', color: 'red' }}>
                <h2>{error || 'Product not found'}</h2>
                <Link to="/" className="btn btn-primary" style={{ marginTop: '1rem', display: 'inline-block' }}>Back to Home</Link>
            </div>
        );
    }

    if (order) {
        return (
            <div style={{ maxWidth: '600px', margin: '3rem auto', textAlign: 'center' }} className="card">
                <div style={{ padding: '3rem' }}>
                    <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
                    <h2 style={{ color: 'var(--success)', marginBottom: '0.5rem' }}>Meal Rescued!</h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
                        Show this code at <strong>{`Taste of Lagos`}</strong> to pickup.
                    </p>

                    <div style={{
                        background: '#F3F4F6',
                        padding: '2rem',
                        borderRadius: '1rem',
                        fontSize: '3rem',
                        fontWeight: 'bold',
                        letterSpacing: '0.5rem',
                        color: 'var(--text-main)',
                        marginBottom: '2rem'
                    }}>
                        {order.pickupCode || 'PENDING'}
                    </div>

                    <Link to="/" className="btn btn-outline">Back to Home</Link>
                    <Link to="/orders" className="btn btn-primary" style={{ marginLeft: '1rem' }}>View Orders</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="checkout-section" style={{ marginTop: '2rem' }}>
            <div style={{ flex: 1 }}>
                <h1 style={{ marginBottom: '2rem' }}>Checkout</h1>

                <div className="card" style={{ padding: '2rem' }}>
                    <h3 style={{ marginBottom: '1.5rem' }}>Order Summary</h3>

                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                        <img
                            src={food.image}
                            alt={food.name}
                            style={{ width: '100px', height: '100px', borderRadius: '0.5rem', objectFit: 'cover' }}
                        />
                        <div>
                            <h4 style={{ margin: '0 0 0.5rem 0' }}>{food.name}</h4>
                            <p style={{ margin: 0, color: 'var(--text-muted)' }}>{food.description}</p>
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <span>Price per portion</span>
                        <span>₦{food.discountedPrice.toLocaleString()}</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <span>Quantity</span>
                        <select
                            value={quantity}
                            onChange={(e) => setQuantity(Number(e.target.value))}
                            style={{ padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid #D1D5DB' }}
                        >
                            {[1, 2, 3, 4, 5].map(n => (
                                <option key={n} value={n}>{n}</option>
                            ))}
                        </select>
                    </div>

                    <div style={{ borderTop: '1px solid #E5E7EB', margin: '1rem 0' }}></div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: 'bold' }}>
                        <span>Total</span>
                        <span>₦{(food.discountedPrice * quantity).toLocaleString()}</span>
                    </div>
                </div>
            </div>

            <div style={{ width: '100%', maxWidth: '400px' }}>
                <div className="card" style={{ padding: '2rem', position: 'sticky', top: '100px' }}>
                    <h3 style={{ marginBottom: '1.5rem' }}>Payment</h3>
                    <p style={{ marginBottom: '2rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        Secure payment powered by <strong>Paystack</strong>. Your card information is encrypted.
                    </p>

                    <button
                        onClick={handlePayment}
                        className="btn btn-primary"
                        style={{ width: '100%' }}
                        disabled={processingPayment}
                    >
                        {processingPayment ? 'Processing...' : `Pay ₦${(food.discountedPrice * quantity).toLocaleString()}`}
                    </button>

                    <div style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.8rem', color: '#9CA3AF' }}>
                        <span role="img" aria-label="lock">🔒</span> Secured by Paystack
                    </div>
                </div>
            </div>
        </div>
    );
};
