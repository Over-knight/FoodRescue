// Mock historical data generator for analytics
export interface AnalyticsData {
    date: string;
    mealsSaved: number;
    revenue: number;
    wasteReduced: number; // in kg
}

export interface CategoryData {
    category: string;
    count: number;
    revenue: number;
}

// Generate mock historical data for the past 30 days
export const generateHistoricalData = (restaurantId: string): AnalyticsData[] => {
    const data: AnalyticsData[] = [];
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        
        // Simulate growth trend with some randomness
        const baseMeals = 5 + (29 - i) * 0.3; // Growing trend
        const randomFactor = 0.7 + Math.random() * 0.6; // 0.7 to 1.3
        
        data.push({
            date: date.toISOString().split('T')[0],
            mealsSaved: Math.floor(baseMeals * randomFactor),
            revenue: Math.floor(baseMeals * randomFactor * 800), // ~₦800 per meal
            wasteReduced: Math.floor(baseMeals * randomFactor * 0.5), // ~0.5kg per meal
        });
    }
    
    return data;
};

// Category breakdown data
export const getCategoryBreakdown = (restaurantId: string): CategoryData[] => {
    return [
        { category: 'Rice', count: 45, revenue: 36000 },
        { category: 'Pastries', count: 32, revenue: 19200 },
        { category: 'Fast Food', count: 28, revenue: 22400 },
        { category: 'Soups', count: 18, revenue: 14400 },
        { category: 'Grills', count: 15, revenue: 18000 },
        { category: 'Others', count: 12, revenue: 9600 },
    ];
};

// Calculate statistics
export const calculateStats = (data: AnalyticsData[]) => {
    const totalMeals = data.reduce((sum, d) => sum + d.mealsSaved, 0);
    const totalRevenue = data.reduce((sum, d) => sum + d.revenue, 0);
    const totalWaste = data.reduce((sum, d) => sum + d.wasteReduced, 0);
    
    // Calculate trend (comparing first week vs last week)
    const firstWeek = data.slice(0, 7).reduce((sum, d) => sum + d.mealsSaved, 0) / 7;
    const lastWeek = data.slice(-7).reduce((sum, d) => sum + d.mealsSaved, 0) / 7;
    const trend = ((lastWeek - firstWeek) / firstWeek) * 100;
    
    // CO2 savings (avg 2.5kg CO2 per kg food waste prevented)
    const co2Saved = totalWaste * 2.5;
    
    return {
        totalMeals,
        totalRevenue,
        totalWaste,
        co2Saved,
        trend: Math.round(trend),
        avgMealsPerDay: Math.round(totalMeals / data.length),
        avgRevenuePerDay: Math.round(totalRevenue / data.length),
    };
};

// Predictive insights using simple linear regression
export const generatePredictiveInsights = (data: AnalyticsData[]) => {
    // Calculate trend line
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
        predictions.push(predicted);
    }
    
    const weekPrediction = predictions.reduce((a, b) => a + b, 0);
    const revenuePrediction = weekPrediction * 800;
    
    return {
        nextWeekMeals: weekPrediction,
        nextWeekRevenue: revenuePrediction,
        dailyPredictions: predictions,
        trend: slope > 0 ? 'increasing' : slope < 0 ? 'decreasing' : 'stable',
    };
};

// Best posting times analysis
export const getBestPostingTimes = () => {
    return [
        { time: '12:00 PM - 2:00 PM', successRate: 85, label: 'Lunch Rush' },
        { time: '6:00 PM - 8:00 PM', successRate: 78, label: 'Dinner Time' },
        { time: '2:00 PM - 4:00 PM', successRate: 62, label: 'Afternoon' },
        { time: '8:00 PM - 10:00 PM', successRate: 45, label: 'Late Evening' },
    ];
};

// Recommendations based on data
export const generateRecommendations = (stats: ReturnType<typeof calculateStats>, categoryData: CategoryData[]) => {
    const recommendations: string[] = [];
    
    // Trend-based recommendations
    if (stats.trend > 20) {
        recommendations.push(`📈 Excellent! Your waste reduction increased by ${stats.trend}% this month. Keep it up!`);
    } else if (stats.trend < -10) {
        recommendations.push(`⚠️ Your waste reduction decreased by ${Math.abs(stats.trend)}%. Consider posting earlier in the day.`);
    }
    
    // Category-based recommendations
    const topCategory = categoryData.reduce((max, cat) => cat.count > max.count ? cat : max);
    recommendations.push(`🍱 ${topCategory.category} is your best performer with ${topCategory.count} meals saved.`);
    
    // Revenue recommendations
    if (stats.avgRevenuePerDay < 5000) {
        recommendations.push(`💰 Tip: Posting during lunch hours (12-2 PM) can increase sales by up to 40%.`);
    }
    
    // Environmental impact
    recommendations.push(`🌍 You've saved ${stats.co2Saved.toFixed(1)}kg of CO2 emissions - equivalent to ${Math.round(stats.co2Saved / 0.4)} km of car travel!`);
    
    return recommendations;
};
