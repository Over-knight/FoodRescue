import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const FOOD_CATEGORIES = [
    // Restaurant meals
    'Rice', 'Pastries', 'Fast Food', 'Local',
    'Soups', 'Grills', 'Vegetarian', 'Seafood',
    // Grocery items
    'Fresh Produce', 'Dairy', 'Bread & Bakery', 'Packaged Goods'
];

const MIN_BUDGET = 500;
const MAX_BUDGET = 5000;

export const Onboarding: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [step, setStep] = useState(1);
    const [budgetMin, setBudgetMin] = useState<number>(500);
    const [budgetMax, setBudgetMax] = useState<number>(2000);
    const [preferences, setPreferences] = useState<string[]>([]);

    const handleBudgetMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value);
        setBudgetMin(value);
        if (value > budgetMax) {
            setBudgetMax(value);
        }
    };

    const handleBudgetMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value);
        setBudgetMax(value);
        if (value < budgetMin) {
            setBudgetMin(value);
        }
    };

    const togglePreference = (category: string) => {
        setPreferences(prev =>
            prev.includes(category)
                ? prev.filter(p => p !== category)
                : [...prev, category]
        );
    };

    const handleNext = () => {
        if (step < 3) {
            setStep(step + 1);
        }
    };

    const handleBack = () => {
        if (step > 1) {
            setStep(step - 1);
        }
    };

    const handleSkip = () => {
        navigate('/');
    };

    const handleComplete = async () => {
        try {
            console.log('Saving profile:', {
                budgetMin,
                budgetMax,
                preferences
            });
            navigate('/');
        } catch (error) {
            console.error('Error saving profile:', error);
            navigate('/');
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #ECFDF5 0%, #F0FDF4 100%)',
            padding: '2rem 1rem'
        }}>
            <div className="card" style={{
                maxWidth: '600px',
                width: '100%',
                padding: '3rem',
                background: 'white'
            }}>
                {/* Progress Indicator */}
                <div style={{ marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                        {[1, 2, 3].map(i => (
                            <div key={i} style={{
                                width: '2.5rem',
                                height: '0.5rem',
                                borderRadius: '0.25rem',
                                background: i <= step ? 'var(--primary)' : '#E5E7EB',
                                transition: 'background 0.3s'
                            }} />
                        ))}
                    </div>
                    <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        Step {step} of 3
                    </p>
                </div>

                {/* Step 1: Budget Range Selection */}
                {step === 1 && (
                    <div style={{ textAlign: 'center' }}>
                        <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>
                            What's your daily food budget?
                        </h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '3rem' }}>
                            Set your minimum and maximum budget range
                        </p>

                        {/* Budget Range Display */}
                        <div style={{
                            background: '#ECFDF5',
                            padding: '2rem',
                            borderRadius: '1rem',
                            marginBottom: '2rem'
                        }}>
                            <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.5rem' }}>
                                ₦{budgetMin.toLocaleString()} - ₦{budgetMax.toLocaleString()}
                            </div>
                            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                per day
                            </div>
                        </div>

                        {/* Min Budget Slider */}
                        <div style={{ marginBottom: '2rem', textAlign: 'left' }}>
                            <label style={{ display: 'block', marginBottom: '1rem', fontSize: '0.95rem', fontWeight: 500, color: 'var(--text-main)' }}>
                                Minimum Budget
                            </label>
                            <input
                                type="range"
                                min={MIN_BUDGET}
                                max={MAX_BUDGET}
                                step={100}
                                value={budgetMin}
                                onChange={handleBudgetMinChange}
                                style={{
                                    width: '100%',
                                    height: '8px',
                                    borderRadius: '4px',
                                    outline: 'none',
                                    background: `linear-gradient(to right, var(--primary) 0%, var(--primary) ${((budgetMin - MIN_BUDGET) / (MAX_BUDGET - MIN_BUDGET)) * 100}%, #E5E7EB ${((budgetMin - MIN_BUDGET) / (MAX_BUDGET - MIN_BUDGET)) * 100}%, #E5E7EB 100%)`,
                                    WebkitAppearance: 'none',
                                    cursor: 'pointer'
                                }}
                            />
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                marginTop: '0.5rem',
                                fontSize: '0.85rem',
                                color: 'var(--text-muted)'
                            }}>
                                <span>₦{MIN_BUDGET.toLocaleString()}</span>
                                <span style={{ fontWeight: 600, color: 'var(--primary)' }}>₦{budgetMin.toLocaleString()}</span>
                            </div>
                        </div>

                        {/* Max Budget Slider */}
                        <div style={{ textAlign: 'left' }}>
                            <label style={{ display: 'block', marginBottom: '1rem', fontSize: '0.95rem', fontWeight: 500, color: 'var(--text-main)' }}>
                                Maximum Budget
                            </label>
                            <input
                                type="range"
                                min={MIN_BUDGET}
                                max={MAX_BUDGET}
                                step={100}
                                value={budgetMax}
                                onChange={handleBudgetMaxChange}
                                style={{
                                    width: '100%',
                                    height: '8px',
                                    borderRadius: '4px',
                                    outline: 'none',
                                    background: `linear-gradient(to right, var(--primary) 0%, var(--primary) ${((budgetMax - MIN_BUDGET) / (MAX_BUDGET - MIN_BUDGET)) * 100}%, #E5E7EB ${((budgetMax - MIN_BUDGET) / (MAX_BUDGET - MIN_BUDGET)) * 100}%, #E5E7EB 100%)`,
                                    WebkitAppearance: 'none',
                                    cursor: 'pointer'
                                }}
                            />
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                marginTop: '0.5rem',
                                fontSize: '0.85rem',
                                color: 'var(--text-muted)'
                            }}>
                                <span style={{ fontWeight: 600, color: 'var(--primary)' }}>₦{budgetMax.toLocaleString()}</span>
                                <span>₦{MAX_BUDGET.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 2: Preferences Selection */}
                {step === 2 && (
                    <div style={{ textAlign: 'center' }}>
                        <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>
                            What do you like to eat?
                        </h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
                            Select all that apply
                        </p>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            {FOOD_CATEGORIES.map(category => (
                                <button
                                    key={category}
                                    onClick={() => togglePreference(category)}
                                    style={{
                                        padding: '1rem',
                                        borderRadius: '0.75rem',
                                        border: preferences.includes(category) ? '2px solid var(--primary)' : '1px solid #E5E7EB',
                                        background: preferences.includes(category) ? '#ECFDF5' : 'white',
                                        color: preferences.includes(category) ? 'var(--primary)' : 'var(--text-main)',
                                        fontSize: '1rem',
                                        fontWeight: 500,
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.5rem'
                                    }}
                                >
                                    {preferences.includes(category) && <span>✓</span>}
                                    {category}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Step 3: Success Screen */}
                {step === 3 && (
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
                        <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>
                            You're all set!
                        </h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
                            We'll show you the best deals based on your preferences
                        </p>

                        <div style={{
                            background: '#F9FAFB',
                            padding: '1.5rem',
                            borderRadius: '0.75rem',
                            marginBottom: '2rem',
                            textAlign: 'left'
                        }}>
                            <div style={{ marginBottom: '1rem' }}>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Daily Budget Range:</span>
                                <div style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--primary)' }}>
                                    ₦{budgetMin.toLocaleString()} - ₦{budgetMax.toLocaleString()}
                                </div>
                            </div>
                            <div>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Preferences:</span>
                                <div style={{ marginTop: '0.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                    {preferences.length > 0 ? preferences.map(pref => (
                                        <span key={pref} style={{
                                            background: '#ECFDF5',
                                            color: 'var(--primary)',
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: '0.5rem',
                                            fontSize: '0.85rem',
                                            fontWeight: 500
                                        }}>
                                            {pref}
                                        </span>
                                    )) : (
                                        <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                            All categories
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Navigation Buttons */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginTop: '2rem',
                    gap: '1rem'
                }}>
                    {step > 1 && step < 3 && (
                        <button
                            onClick={handleBack}
                            className="btn"
                            style={{
                                flex: 1,
                                padding: '0.75rem',
                                background: 'white',
                                border: '1px solid #E5E7EB',
                                color: 'var(--text-main)'
                            }}
                        >
                            Back
                        </button>
                    )}

                    {step < 3 ? (
                        <>
                            <button
                                onClick={handleSkip}
                                style={{
                                    flex: 1,
                                    padding: '0.75rem',
                                    background: 'transparent',
                                    border: 'none',
                                    color: 'var(--text-muted)',
                                    cursor: 'pointer',
                                    fontSize: '0.95rem',
                                    fontWeight: 500
                                }}
                            >
                                Skip for now
                            </button>
                            <button
                                onClick={handleNext}
                                className="btn btn-primary"
                                style={{
                                    flex: 1,
                                    padding: '0.75rem'
                                }}
                            >
                                Next
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={handleComplete}
                            className="btn btn-primary"
                            style={{
                                width: '100%',
                                padding: '1rem',
                                fontSize: '1rem',
                                fontWeight: 600
                            }}
                        >
                            Start Browsing
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
