import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { analyticsApiService } from '../services/analyticsApiService';
import { getBestPostingTimes } from '../services/analyticsService';

const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#6B7280'];

export const Analytics: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');

    // State for API data
    const [overview, setOverview] = useState<any>(null);
    const [salesData, setSalesData] = useState<any[]>([]);
    const [categoryData, setCategoryData] = useState<any[]>([]);
    const [wasteData, setWasteData] = useState<any>(null);

    // Computed stats
    const [stats, setStats] = useState<any>(null);
    const [predictions, setPredictions] = useState<any>(null);
    const [recommendations, setRecommendations] = useState<string[]>([]);

    useEffect(() => {
        loadAnalyticsData();
    }, []);

    const loadAnalyticsData = async () => {
        try {
            setLoading(true);
            setError('');

            // Check if demo mode (no token)
            const token = localStorage.getItem('token');
            if (!token) {
                // Use mock data for demo
                loadDemoData();
                return;
            }

            // Fetch all analytics data in parallel
            const [overviewData, salesResponse, categoryResponse, wasteResponse] = await Promise.all([
                analyticsApiService.getRestaurantOverview(),
                analyticsApiService.getRestaurantSales('daily'),
                analyticsApiService.getRevenueByCategory(),
                analyticsApiService.getWasteReduction()
            ]);

            console.log('Analytics data loaded:', { overviewData, salesResponse, categoryResponse, wasteResponse });

            setOverview(overviewData);
            setWasteData(wasteResponse);

            // Transform sales data for charts
            const transformedSales = salesResponse.sales.map((item: any) => ({
                date: item.period,
                mealsSaved: item.mealsSaved,
                revenue: item.revenue,
                orders: item.orders
            }));
            setSalesData(transformedSales);

            // Transform category data for charts
            const transformedCategories = categoryResponse.categories.map((cat: any) => ({
                category: cat.categoryName,
                count: cat.itemsSold,
                revenue: cat.totalRevenue
            }));
            setCategoryData(transformedCategories);

            // Calculate stats from overview and waste data
            const calculatedStats = {
                totalMeals: wasteResponse.overview.totalMealsSaved,
                totalRevenue: overviewData.totalRevenue,
                totalWaste: wasteResponse.overview.weightSaved,
                co2Saved: wasteResponse.overview.co2Saved,
                trend: calculateTrend(transformedSales),
                avgMealsPerDay: Math.round(wasteResponse.overview.totalMealsSaved / 30),
                avgRevenuePerDay: Math.round(overviewData.totalRevenue / 30),
            };
            setStats(calculatedStats);

            // Generate predictions using simple linear regression
            const predictive = generatePredictiveInsights(transformedSales);
            setPredictions(predictive);

            // Generate recommendations
            const recs = generateRecommendations(calculatedStats, transformedCategories);
            setRecommendations(recs);

        } catch (err: any) {
            console.error('Error loading analytics:', err);
            setError(err.message || 'Failed to load analytics data');
        } finally {
            setLoading(false);
        }
    };

    // Demo mode data loader
    const loadDemoData = () => {
        // Mock sales data for past 30 days
        const mockSales = Array.from({ length: 30 }, (_, i) => ({
            date: `Day ${i + 1}`,
            mealsSaved: Math.floor(Math.random() * 50) + 20,
            revenue: Math.floor(Math.random() * 30000) + 15000,
            orders: Math.floor(Math.random() * 20) + 5
        }));
        setSalesData(mockSales);

        // Mock category data
        const mockCategories = [
            { category: 'Meals', count: 450, revenue: 360000 },
            { category: 'Groceries', count: 320, revenue: 256000 },
            { category: 'Bakery', count: 180, revenue: 144000 },
            { category: 'Beverages', count: 120, revenue: 96000 }
        ];
        setCategoryData(mockCategories);

        // Mock overview and waste
        const mockOverview = { totalRevenue: 856000 };
        const mockWaste = {
            overview: {
                totalMealsSaved: 1070,
                weightSaved: 428,
                co2Saved: 856
            }
        };
        setOverview(mockOverview);
        setWasteData(mockWaste);

        // Calculate demo stats
        const demoStats = {
            totalMeals: 1070,
            totalRevenue: 856000,
            totalWaste: 428,
            co2Saved: 856,
            trend: 15,
            avgMealsPerDay: 36,
            avgRevenuePerDay: 28533
        };
        setStats(demoStats);

        // Demo predictions
        setPredictions({
            nextWeekMeals: 252,
            nextWeekRevenue: 201600,
            trend: 'increasing'
        });

        // Demo recommendations
        setRecommendations([
            '📈 Excellent! Your waste reduction increased by 15% this month. Keep it up!',
            '🍱 Meals is your best performer with 450 meals saved.',
            '🌍 You\'ve saved 856.0kg of CO2 emissions - equivalent to 2140 km of car travel!',
            '💡 Demo mode active - Sign in with a real account to see your actual data'
        ]);

        setLoading(false);
    };

    // Calculate trend (comparing first week vs last week)
    const calculateTrend = (data: any[]) => {
        if (data.length < 14) return 0;

        const firstWeek = data.slice(0, 7).reduce((sum, d) => sum + d.mealsSaved, 0) / 7;
        const lastWeek = data.slice(-7).reduce((sum, d) => sum + d.mealsSaved, 0) / 7;

        if (firstWeek === 0) return 0;
        return Math.round(((lastWeek - firstWeek) / firstWeek) * 100);
    };

    // Predictive insights using simple linear regression
    const generatePredictiveInsights = (data: any[]) => {
        if (data.length === 0) {
            return { nextWeekMeals: 0, nextWeekRevenue: 0, trend: 'stable' };
        }

        const n = data.length;
        let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;

        data.forEach((d, i) => {
            sumX += i;
            sumY += d.mealsSaved;
            sumXY += i * d.mealsSaved;
            sumX2 += i * i;
        });

        const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;

        // Predict next 7 days
        const predictions = [];
        for (let i = 0; i < 7; i++) {
            const predicted = Math.round(slope * (n + i) + intercept);
            predictions.push(Math.max(0, predicted)); // Ensure non-negative
        }

        const weekPrediction = predictions.reduce((a, b) => a + b, 0);
        const avgRevenue = data.reduce((sum, d) => sum + d.revenue, 0) / data.length;
        const avgMeals = data.reduce((sum, d) => sum + d.mealsSaved, 0) / data.length;
        const revenuePerMeal = avgMeals > 0 ? avgRevenue / avgMeals : 800;
        const revenuePrediction = Math.round(weekPrediction * revenuePerMeal);

        return {
            nextWeekMeals: weekPrediction,
            nextWeekRevenue: revenuePrediction,
            trend: slope > 0 ? 'increasing' : slope < 0 ? 'decreasing' : 'stable',
        };
    };

    // Generate recommendations
    const generateRecommendations = (stats: any, categoryData: any[]) => {
        const recommendations: string[] = [];

        // Trend-based recommendations
        if (stats.trend > 20) {
            recommendations.push(`📈 Excellent! Your waste reduction increased by ${stats.trend}% this month. Keep it up!`);
        } else if (stats.trend < -10) {
            recommendations.push(`⚠️ Your waste reduction decreased by ${Math.abs(stats.trend)}%. Consider posting earlier in the day.`);
        }

        // Category-based recommendations
        if (categoryData.length > 0) {
            const topCategory = categoryData.reduce((max, cat) => cat.count > max.count ? cat : max, categoryData[0]);
            recommendations.push(`🍱 ${topCategory.category} is your best performer with ${topCategory.count} meals saved.`);
        }

        // Revenue recommendations
        if (stats.avgRevenuePerDay < 5000) {
            recommendations.push(`💰 Tip: Posting during lunch hours (12-2 PM) can increase sales by up to 40%.`);
        }

        // Environmental impact
        if (stats.co2Saved > 0) {
            recommendations.push(`🌍 You've saved ${stats.co2Saved.toFixed(1)}kg of CO2 emissions - equivalent to ${Math.round(stats.co2Saved / 0.4)} km of car travel!`);
        }

        return recommendations;
    };

    if (loading) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
                <h2>Loading analytics...</h2>
                <p style={{ color: 'var(--text-muted)' }}>Fetching your restaurant data</p>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
                <h2 style={{ color: 'var(--error)' }}>Error Loading Analytics</h2>
                <p style={{ color: 'var(--text-muted)' }}>{error}</p>
                <button className="btn btn-primary" onClick={loadAnalyticsData} style={{ marginTop: '1rem' }}>
                    Retry
                </button>
            </div>
        );
    }

    if (!stats) {
        return <div>No analytics data available</div>;
    }

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
                        {stats.trend > 0 ? '📈' : '📉'} {Math.abs(stats.trend)}% vs last period
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
                    {salesData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={salesData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                                <XAxis
                                    dataKey="date"
                                    tick={{ fontSize: 12 }}
                                />
                                <YAxis tick={{ fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: '0.5rem' }}
                                />
                                <Legend />
                                <Line type="monotone" dataKey="mealsSaved" stroke="#10B981" strokeWidth={3} name="Meals Saved" dot={{ fill: '#10B981' }} />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                            No sales data available yet
                        </div>
                    )}
                </div>

                {/* Category Breakdown */}
                <div className="card" style={{ padding: '1.5rem' }}>
                    <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>Category Breakdown</h3>
                    {categoryData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={categoryData}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="count"
                                    label
                                >
                                    {categoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                            No category data available
                        </div>
                    )}
                </div>
            </div>

            {/* Charts Row 2 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                {/* Revenue by Category */}
                <div className="card" style={{ padding: '1.5rem' }}>
                    <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>Revenue by Category</h3>
                    {categoryData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={categoryData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                                <XAxis dataKey="category" tick={{ fontSize: 12 }} />
                                <YAxis tick={{ fontSize: 12 }} />
                                <Tooltip contentStyle={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: '0.5rem' }} />
                                <Bar dataKey="revenue" fill="#10B981" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                            No revenue data available
                        </div>
                    )}
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

            {/* AI Insights */}
            {recommendations.length > 0 && (
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
            )}
        </div>
    );
};
