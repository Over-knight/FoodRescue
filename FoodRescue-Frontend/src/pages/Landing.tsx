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
                padding: 'clamp(3rem, 8vw, 8rem) 1rem clamp(3.5rem, 8vw, 10rem) 1rem',
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
                        fontSize: 'clamp(2rem, 8vw, 5rem)',
                        fontWeight: 800,
                        margin: 'clamp(0.5rem, 2vw, 1.5rem) 0',
                        lineHeight: 1.1,
                        textShadow: '0 4px 10px rgba(0,0,0,0.3)'
                    }}>
                        Good Food.<br />
                        <span style={{ color: '#FCD34D' }}>Great Prices.</span><br />
                    </h1>
                    <p style={{
                        fontSize: 'clamp(1rem, 3vw, 1.25rem)',
                        maxWidth: '600px',
                        margin: '0 auto clamp(1.5rem, 4vw, 2.5rem) auto',
                        color: '#E5E7EB',
                        padding: '0 1rem'
                    }}>
                        Get 50% off surplus meals from your favorite restaurants. Join thousands of Food Heroes acting against waste.
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap', padding: '0 1rem' }}>
                        <Link to="/login" className="btn" style={{
                            background: '#FCD34D',
                            color: '#78350F',
                            padding: 'clamp(0.75rem, 2vw, 1rem) clamp(1.5rem, 4vw, 2.5rem)',
                            fontSize: 'clamp(0.95rem, 2.5vw, 1.1rem)',
                            fontWeight: 'bold',
                            border: 'none',
                            width: 'auto',
                            minWidth: '160px'
                        }}>
                            Find Food Near Me
                        </Link>
                        <Link to="/signup" className="btn" style={{
                            background: 'rgba(255,255,255,0.1)',
                            color: 'white',
                            padding: 'clamp(0.75rem, 2vw, 1rem) clamp(1.5rem, 4vw, 2.5rem)',
                            fontSize: 'clamp(0.95rem, 2.5vw, 1.1rem)',
                            backdropFilter: 'blur(4px)',
                            border: '1px solid rgba(255,255,255,0.4)',
                            width: 'auto',
                            minWidth: '160px'
                        }}>
                            Restaurant Partner
                        </Link>
                    </div>
                </div>
            </div>

            {/* Live Active Listings Preview */}
            <div className="container" style={{ marginTop: 'clamp(-3rem, -5vw, -4rem)', position: 'relative', zIndex: 20 }}>
                <div style={{ background: 'white', borderRadius: '1.5rem', padding: 'clamp(1.5rem, 4vw, 3rem)', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'clamp(1.5rem, 3vw, 2rem)', flexWrap: 'wrap', gap: '1rem' }}>
                        <div>
                            <h2 style={{ margin: 0, fontSize: 'clamp(1.25rem, 3vw, 1.75rem)' }}>Available for Rescue Now</h2>
                            <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 0 0', fontSize: 'clamp(0.875rem, 2vw, 1rem)' }}>Live listings from top rated spots</p>
                        </div>
                        <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none', fontSize: 'clamp(0.9rem, 2vw, 1rem)', whiteSpace: 'nowrap' }}>View All &rarr;</Link>
                    </div>

                    <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 'clamp(1rem, 3vw, 2rem)',
                        justifyContent: 'center'
                    }}>
                        {previewFoods.map(food => (
                            <div key={food.id} style={{
                                flex: '1 1 calc(33.333% - 2rem)',
                                minWidth: '260px',
                                maxWidth: '350px'
                            }}>
                                <FoodCard food={food} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Trusted By Section */}
            <div style={{ padding: 'clamp(2.5rem, 6vw, 4rem) 0', textAlign: 'center', background: '#F9FAFB' }}>
                <div className="container">
                    <p style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: 'clamp(0.75rem, 2vw, 0.9rem)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 'clamp(1.5rem, 3vw, 2rem)', padding: '0 1rem' }}>Trusted by 500+ Lagos establishments</p>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 'clamp(1.5rem, 4vw, 3rem)', flexWrap: 'wrap', opacity: 0.6, alignItems: 'center', padding: '0 1rem' }}>
                        <div style={{ fontSize: 'clamp(1rem, 2.5vw, 1.25rem)', fontWeight: 700, fontFamily: 'serif' }}>Chicken Republic</div>
                        <div style={{ fontSize: 'clamp(1rem, 2.5vw, 1.25rem)', fontWeight: 700, fontFamily: 'serif' }}>The Place</div>
                        <div style={{ fontSize: 'clamp(1rem, 2.5vw, 1.25rem)', fontWeight: 700, fontFamily: 'serif' }}>Mega Chicken</div>
                        <div style={{ fontSize: 'clamp(1rem, 2.5vw, 1.25rem)', fontWeight: 700, fontFamily: 'serif' }}>Sweet Sensation</div>
                        <div style={{ fontSize: 'clamp(1rem, 2.5vw, 1.25rem)', fontWeight: 700, fontFamily: 'serif' }}>Kilimanjaro</div>
                    </div>
                </div>
            </div>

            {/* Testimonials */}
            <div style={{ padding: 'clamp(3rem, 8vw, 6rem) 0' }}>
                <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'clamp(2rem, 5vw, 4rem)', alignItems: 'center' }}>
                    <div style={{ padding: '0 1rem' }}>
                        <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', marginBottom: 'clamp(1rem, 2vw, 1.5rem)', lineHeight: 1.2 }}>
                            "A game changer for my student budget."
                        </h2>
                        <p style={{ fontSize: 'clamp(1rem, 2vw, 1.1rem)', color: 'var(--text-muted)', marginBottom: 'clamp(1.5rem, 3vw, 2rem)' }}>
                            FoodRescue has saved me over ₦50,000 this month alone. The food is always fresh and it feels good to stop waste.
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ width: '50px', height: '50px', background: '#D1FAE5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', fontWeight: 'bold', flexShrink: 0 }}>JD</div>
                            <div>
                                <div style={{ fontWeight: 'bold', fontSize: 'clamp(0.95rem, 2vw, 1rem)' }}>Jumoke D.</div>
                                <div style={{ fontSize: 'clamp(0.85rem, 1.5vw, 0.9rem)', color: 'var(--text-muted)' }}>Student, UNILAG</div>
                            </div>
                        </div>
                    </div>
                    <div style={{ padding: '0 1rem' }}>
                        <div className="card" style={{ padding: 'clamp(1.5rem, 3vw, 2rem)', background: '#10B981', color: 'white' }}>
                            <h3 style={{ marginBottom: 'clamp(0.75rem, 2vw, 1rem)', fontSize: 'clamp(1.25rem, 3vw, 1.5rem)' }}>For Restaurants</h3>
                            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 'clamp(0.75rem, 2vw, 1rem)' }}>
                                <li style={{ display: 'flex', gap: '0.75rem', fontSize: 'clamp(0.95rem, 2vw, 1rem)' }}>✅ Turn waste into revenue</li>
                                <li style={{ display: 'flex', gap: '0.75rem', fontSize: 'clamp(0.95rem, 2vw, 1rem)' }}>✅ Reach new local customers</li>
                                <li style={{ display: 'flex', gap: '0.75rem', fontSize: 'clamp(0.95rem, 2vw, 1rem)' }}>✅ Enhance your green reputation</li>
                            </ul>
                            <Link to="/signup" className="btn" style={{ background: 'white', color: '#10B981', width: '100%', marginTop: 'clamp(1.5rem, 3vw, 2rem)', textAlign: 'center', display: 'block', padding: 'clamp(0.75rem, 2vw, 1rem)', fontSize: 'clamp(0.95rem, 2vw, 1rem)' }}>Start Selling Today</Link>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};
