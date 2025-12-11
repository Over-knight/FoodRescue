import React from 'react';
import { Link } from 'react-router-dom';
import { MOCK_FOODS } from '../services/mockData';
import { FoodCard } from '../components/FoodCard';

export const Landing: React.FC = () => {
    // Get 3 active items for preview
    const previewFoods = MOCK_FOODS.slice(0, 3);

    return (
        <div>
            {/* Hero Section */}
            <div style={{
                position: 'relative',
                color: 'white',
                textAlign: 'center',
                padding: '8rem 0 10rem 0',
                borderRadius: '0 0 2rem 2rem',
                overflow: 'hidden',
                backgroundColor: '#10B981', // Fallback
                backgroundImage: 'url("https://images.unsplash.com/photo-1594771804886-7a58ab43850e?auto=format&fit=crop&w=1500&q=80")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }}>
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.8))'
                }}></div>

                <div className="container" style={{ position: 'relative', zIndex: 10 }}>
                    <h1 style={{
                        fontSize: 'clamp(3rem, 6vw, 5rem)',
                        fontWeight: 800,
                        margin: '1.5rem 0',
                        lineHeight: 1.1,
                        textShadow: '0 4px 10px rgba(0,0,0,0.3)'
                    }}>
                        Good Food.<br />
                        <span style={{ color: '#FCD34D' }}>Great Prices.</span><br />
                    </h1>
                    <p style={{
                        fontSize: '1.25rem',
                        maxWidth: '600px',
                        margin: '0 auto 2.5rem auto',
                        color: '#E5E7EB'
                    }}>
                        Get 50% off surplus meals from your favorite restaurants. Join thousands of Food Heroes acting against waste.
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                        <Link to="/login" className="btn" style={{
                            background: '#FCD34D',
                            color: '#78350F',
                            padding: '1rem 2.5rem',
                            fontSize: '1.1rem',
                            fontWeight: 'bold',
                            border: 'none'
                        }}>
                            Find Food Near Me
                        </Link>
                        <Link to="/signup" className="btn" style={{
                            background: 'rgba(255,255,255,0.1)',
                            color: 'white',
                            padding: '1rem 2.5rem',
                            fontSize: '1.1rem',
                            backdropFilter: 'blur(4px)',
                            border: '1px solid rgba(255,255,255,0.4)'
                        }}>
                            Restaurant Partner
                        </Link>
                    </div>
                </div>
            </div>

            {/* Live Active Listings Preview */}
            <div className="container" style={{ marginTop: '-4rem', position: 'relative', zIndex: 20 }}>
                <div style={{ background: 'white', borderRadius: '1.5rem', padding: '3rem', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <div>
                            <h2 style={{ margin: 0, fontSize: '1.75rem' }}>Available for Rescue Now</h2>
                            <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 0 0' }}>Live listings from top rated spots</p>
                        </div>
                        <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>View All &rarr;</Link>
                    </div>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                        gap: '2rem'
                    }}>
                        {previewFoods.map(food => (
                            <FoodCard key={food.id} food={food} />
                        ))}
                    </div>
                </div>
            </div>

            {/* Trusted By Section */}
            <div style={{ padding: '4rem 0', textAlign: 'center', background: '#F9FAFB' }}>
                <div className="container">
                    <p style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.9rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '2rem' }}>Trusted by 500+ Lagos establishments</p>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '3rem', flexWrap: 'wrap', opacity: 0.6, alignItems: 'center' }}>
                        <div style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: 'serif' }}>Chicken Republic</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: 'serif' }}>The Place</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: 'serif' }}>Mega Chicken</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: 'serif' }}>Sweet Sensation</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: 'serif' }}>Kilimanjaro</div>
                    </div>
                </div>
            </div>

            {/* Testimonials */}
            <div style={{ padding: '6rem 0' }}>
                <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '4rem', alignItems: 'center' }}>
                    <div>
                        <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', lineHeight: 1.2 }}>
                            "A game changer for my student budget."
                        </h2>
                        <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', marginBottom: '2rem' }}>
                            FoodRescue has saved me over ₦50,000 this month alone. The food is always fresh and it feels good to stop waste.
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ width: '50px', height: '50px', background: '#D1FAE5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', fontWeight: 'bold' }}>JD</div>
                            <div>
                                <div style={{ fontWeight: 'bold' }}>Jumoke D.</div>
                                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Student, UNILAG</div>
                            </div>
                        </div>
                    </div>
                    <div>
                        <div className="card" style={{ padding: '2rem', background: '#10B981', color: 'white' }}>
                            <h3 style={{ marginBottom: '1rem' }}>For Restaurants</h3>
                            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <li style={{ display: 'flex', gap: '1rem' }}>✅ Turn waste into revenue</li>
                                <li style={{ display: 'flex', gap: '1rem' }}>✅ Reach new local customers</li>
                                <li style={{ display: 'flex', gap: '1rem' }}>✅ Enhance your green reputation</li>
                            </ul>
                            <Link to="/signup" className="btn" style={{ background: 'white', color: '#10B981', width: '100%', marginTop: '2rem', textAlign: 'center', display: 'block' }}>Start Selling Today</Link>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};
