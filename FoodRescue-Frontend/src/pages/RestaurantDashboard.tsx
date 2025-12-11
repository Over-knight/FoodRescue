import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getRestaurantStats, getRestaurantFoods, addFood } from '../services/mockData';
import { suggestPrice } from '../services/aiService';
import { Food } from '../types';
import { Link } from 'react-router-dom';

export const RestaurantDashboard: React.FC = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState<any>(null);
    const [foods, setFoods] = useState<Food[]>([]);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        originalPrice: '',
        quantity: '',
        expiryDate: '',
    });

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>('');
    const [aiSuggestion, setAiSuggestion] = useState<any>(null);

    useEffect(() => {
        if (user && user.role === 'restaurant') {
            setStats(getRestaurantStats(user.id));
            setFoods(getRestaurantFoods(user.id));
        }
    }, [user]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            // Create preview URL
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleGeneratePrice = () => {
        if (formData.originalPrice && formData.expiryDate) {
            const suggestion = suggestPrice(Number(formData.originalPrice), formData.expiryDate);
            setAiSuggestion(suggestion);
        } else {
            alert("Please enter Original Price and Expiry Date first.");
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        const newFood: Food = {
            id: `f_${Date.now()}`,
            restaurantId: user.id,
            name: formData.name,
            description: formData.description,
            originalPrice: Number(formData.originalPrice),
            discountedPrice: aiSuggestion ? aiSuggestion.suggestedPrice : Number(formData.originalPrice),
            discountPercent: aiSuggestion ? aiSuggestion.suggestedDiscount : 0,
            quantity: Number(formData.quantity),
            quantityType: 'portions',
            expiryTime: formData.expiryDate,
            image: imagePreview || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1000&q=80',
            category: 'General',
            tags: [],
            status: 'active',
        };

        addFood(newFood);
        setFoods([newFood, ...foods]);
        alert("Food Posted Successfully!");

        // Reset form
        setFormData({
            name: '',
            description: '',
            originalPrice: '',
            quantity: '',
            expiryDate: '',
        });
        setImageFile(null);
        setImagePreview('');
        setAiSuggestion(null);
    };

    if (!user || user.role !== 'restaurant') {
        return <div>Access Denied. Please login as a restaurant.</div>;
    }

    return (
        <div>
            <h1 style={{ marginBottom: '2rem' }}>Restaurant Dashboard</h1>

            {/* Verification Banner */}
            <div style={{ background: '#FFF7ED', border: '1px solid #FFEDD5', padding: '1rem', borderRadius: '0.5rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '1.5rem' }}>⚠️</span>
                    <div>
                        <div style={{ fontWeight: 'bold', color: '#9A3412' }}>Action Required: Verify Account</div>
                        <div style={{ fontSize: '0.9rem', color: '#C2410C' }}>Please submit your business documents to unlock full features.</div>
                    </div>
                </div>
                <Link to="/verification" className="btn" style={{ background: '#EA580C', color: 'white', fontSize: '0.9rem', padding: '0.5rem 1rem', textDecoration: 'none' }}>
                    Verify Now
                </Link>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                    <div className="card" style={{ padding: '1.5rem' }}>
                        <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Total Sales</h3>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>₦{stats.totalSales.toLocaleString()}</div>
                    </div>
                    <div className="card" style={{ padding: '1.5rem' }}>
                        <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Meals Saved</h3>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--success)' }}>{stats.mealsSaved}</div>
                    </div>
                    <div className="card" style={{ padding: '1.5rem' }}>
                        <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>CO₂ Avoided</h3>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary)' }}>{stats.co2Saved}kg</div>
                    </div>
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>

                {/* Post Food Form */}
                <div>
                    <div className="card" style={{ padding: '2rem' }}>
                        <h2 style={{ marginBottom: '1.5rem' }}>Post New Food</h2>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Item Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #D1D5DB' }}
                                    required
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #D1D5DB' }}
                                    rows={3}
                                    required
                                />
                            </div>

                            {/* Image Upload */}
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Food Image</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #D1D5DB' }}
                                />
                                {imagePreview && (
                                    <div style={{ marginTop: '1rem' }}>
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
                                            style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: '0.5rem' }}
                                        />
                                    </div>
                                )}
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Quantity</label>
                                    <input
                                        type="number"
                                        value={formData.quantity}
                                        onChange={e => setFormData({ ...formData, quantity: e.target.value })}
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #D1D5DB' }}
                                        required
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Expiry Date/Time</label>
                                    <input
                                        type="datetime-local"
                                        value={formData.expiryDate}
                                        onChange={e => setFormData({ ...formData, expiryDate: e.target.value })}
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #D1D5DB' }}
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Original Price (₦)</label>
                                <input
                                    type="number"
                                    value={formData.originalPrice}
                                    onChange={e => setFormData({ ...formData, originalPrice: e.target.value })}
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #D1D5DB' }}
                                    required
                                />
                            </div>

                            {/* AI Section */}
                            <div style={{ background: '#F0FDFA', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #CCFBF1' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                    <span style={{ fontWeight: 600, color: '#0F766E' }}>✨ AI Pricing Assistant</span>
                                    <button
                                        type="button"
                                        onClick={handleGeneratePrice}
                                        className="btn"
                                        style={{ background: 'white', border: '1px solid #0F766E', color: '#0F766E', padding: '0.25rem 0.75rem', fontSize: '0.8rem' }}
                                    >
                                        Suggestion
                                    </button>
                                </div>

                                {aiSuggestion ? (
                                    <div>
                                        <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem' }}>{aiSuggestion.reason}</p>
                                        <div style={{ display: 'flex', gap: '1rem', fontWeight: 'bold' }}>
                                            <div style={{ color: '#EF4444' }}>-{aiSuggestion.suggestedDiscount}% Off</div>
                                            <div>Suggest: ₦{aiSuggestion.suggestedPrice}</div>
                                        </div>
                                    </div>
                                ) : (
                                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#5E7EB' }}>
                                        Click calculate to get an optimal price based on expiry time.
                                    </p>
                                )}
                            </div>

                            <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }}>
                                Post Food Listing
                            </button>

                        </form>
                    </div>
                </div>

                {/* Active Listings */}
                <div>
                    <h2 style={{ marginBottom: '1.5rem' }}>Active Listings</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {foods.map(food => (
                            <div key={food.id} className="card" style={{ padding: '1rem', display: 'flex', gap: '1rem' }}>
                                <img src={food.image} alt={food.name} style={{ width: '80px', height: '80px', borderRadius: '0.5rem', objectFit: 'cover' }} />
                                <div>
                                    <h4 style={{ margin: '0 0 0.25rem 0' }}>{food.name}</h4>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                        {food.quantity} portions left • Expires: {new Date(food.expiryTime).toLocaleTimeString()}
                                    </div>
                                    <div style={{ marginTop: '0.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                                        ₦{food.discountedPrice} <span style={{ textDecoration: 'line-through', color: '#9CA3AF', fontWeight: 'normal' }}>₦{food.originalPrice}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {foods.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No active listings.</p>}
                    </div>
                </div>

            </div>

        </div>
    );
};
