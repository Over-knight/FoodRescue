import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import {
    generateHistoricalData,
    getCategoryBreakdown,
    calculateStats,
    generatePredictiveInsights,
    getBestPostingTimes,
    generateRecommendations
} from '../services/analyticsService';

const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#6B7280'];

export const Analytics: React.FC = () => {
    const [historicalData, setHistoricalData] = useState<any[]>([]);
    const [categoryData, setCategoryData] = useState<any[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [predictions, setPredictions] = useState<any>(null);
    const [recommendations, setRecommendations] = useState<string[]>([]);

    useEffect(() => {
        // Load analytics data
        const data = generateHistoricalData('r1');
        const categories = getCategoryBreakdown('r1');
        const statistics = calculateStats(data);
        const predictive = generatePredictiveInsights(data);
        const recs = generateRecommendations(statistics, categories);

        setHistoricalData(data);
        setCategoryData(categories);
        setStats(statistics);
        setPredictions(predictive);
        setRecommendations(recs);
    }, []);

    if (!stats) return <div>Loading analytics...</div>;

    return (
        <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📊 Analytics Dashboard</h1>
                <p style={{ color: 'var(--text-muted)' }}>Data-driven insights for your food rescue operations</p>
            </div>

            {/* Key Metrics Cards */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '1.5rem',
                marginBottom: '2rem'
            }}>
                <div className="card" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', color: 'white' }}>
                    <div style={{ fontSize: '0.9rem', opacity: 0.9, marginBottom: '0.5rem' }}>Total Meals Saved</div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 700 }}>{stats.totalMeals}</div>
                    <div style={{ fontSize: '0.85rem', opacity: 0.8, marginTop: '0.5rem' }}>
                        {stats.trend > 0 ? '📈' : '📉'} {Math.abs(stats.trend)}% vs last month
                    </div>
                </div>

                <div className="card" style={{ padding: '1.5rem' }}>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Total Revenue</div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--primary)' }}>₦{stats.totalRevenue.toLocaleString()}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                        Avg: ₦{stats.avgRevenuePerDay.toLocaleString()}/day
                    </div>
                </div>

                <div className="card" style={{ padding: '1.5rem' }}>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Waste Reduced</div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 700, color: '#F59E0B' }}>{stats.totalWaste}kg</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                        🌍 {stats.co2Saved.toFixed(1)}kg CO₂ saved
                    </div>
                </div>

                <div className="card" style={{ padding: '1.5rem', background: '#F0FDF4' }}>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Next Week Forecast</div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--primary)' }}>{predictions.nextWeekMeals}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                        Predicted meals · ₦{predictions.nextWeekRevenue.toLocaleString()}
                    </div>
                </div>
            </div>

            {/* Charts Row 1 */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                {/* Meals Saved Over Time */}
                <div className="card" style={{ padding: '1.5rem' }}>
                    <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>Meals Saved Over Time</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={historicalData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                            <XAxis
                                dataKey="date"
                                tick={{ fontSize: 12 }}
                                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip
                                contentStyle={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: '0.5rem' }}
                                labelFormatter={(value) => new Date(value).toLocaleDateString()}
                            />
                            <Legend />
                            <Line type="monotone" dataKey="mealsSaved" stroke="#10B981" strokeWidth={3} name="Meals Saved" dot={{ fill: '#10B981' }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Category Breakdown */}
                <div className="card" style={{ padding: '1.5rem' }}>
                    <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>Category Breakdown</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={categoryData}
                                cx="50%"
                                cy="50%"
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="count"
                            >
                                {categoryData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Charts Row 2 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                {/* Revenue by Category */}
                <div className="card" style={{ padding: '1.5rem' }}>
                    <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>Revenue by Category</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={categoryData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                            <XAxis dataKey="category" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip contentStyle={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: '0.5rem' }} />
                            <Bar dataKey="revenue" fill="#10B981" radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Best Posting Times */}
                <div className="card" style={{ padding: '1.5rem' }}>
                    <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>Best Posting Times</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {getBestPostingTimes().map((time, idx) => (
                            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>{time.time}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{time.label}</div>
                                </div>
                                <div style={{ width: '60%', background: '#E5E7EB', borderRadius: '0.5rem', height: '1.5rem', position: 'relative', overflow: 'hidden' }}>
                                    <div style={{
                                        width: `${time.successRate}%`,
                                        background: 'linear-gradient(90deg, #10B981, #059669)',
                                        height: '100%',
                                        borderRadius: '0.5rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'flex-end',
                                        paddingRight: '0.5rem',
                                        color: 'white',
                                        fontSize: '0.75rem',
                                        fontWeight: 600
                                    }}>
                                        {time.successRate}%
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Data Science Insights */}
            <div className="card" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, #F0FDF4 0%, #ECFDF5 100%)' }}>
                <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    🤖 AI-Powered Insights & Recommendations
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    {recommendations.map((rec, idx) => (
                        <div key={idx} style={{
                            background: 'white',
                            padding: '1rem',
                            borderRadius: '0.5rem',
                            border: '1px solid #D1FAE5'
                        }}>
                            {rec}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
