import { Food, User } from '../types';

// AI Logic: Smart Matching
// Scores foods based on user preferences, budget, and distance (simulated)
export const smartMatchFoods = (user: User, foods: Food[]): Food[] => {
  return foods.map(food => {
    let score = 0;

    // 1. Budget Score
    if (food.discountedPrice <= user.budget) score += 30;

    // 2. Preference Score
    if (user.preferences.includes(food.category)) score += 40;
    food.tags.forEach(tag => {
      if (user.preferences.includes(tag)) score += 10;
    });

    // 3. Urgency Score (Closer to expiry = higher score to prevent waste)
    const hoursToExpiry = (new Date(food.expiryTime).getTime() - Date.now()) / (1000 * 60 * 60);
    if (hoursToExpiry < 2) score += 20;

    // 4. Distance Score (Simulated - random for now as we don't have real user location input stream)
    // In a real app, use Haversine formula here.
    score += Math.random() * 10; 

    return { ...food, matchScore: score };
  })
  .sort((a: any, b: any) => b.matchScore - a.matchScore);
};

// AI Logic: Pricing Suggestions
// Suggests optimal price based on time remaining
export const suggestPrice = (originalPrice: number, expiryDate: string) => {
  const hoursRemaining = (new Date(expiryDate).getTime() - Date.now()) / (1000 * 60 * 60);
  
  let suggestedDiscount = 0;
  let reason = "";

  if (hoursRemaining > 12) {
    suggestedDiscount = 20;
    reason = "Standard early bird discount to drive initial interest.";
  } else if (hoursRemaining > 6) {
    suggestedDiscount = 40;
    reason = "Mid-day markdown to clear inventory before peak hours end.";
  } else {
    suggestedDiscount = 60;
    reason = "Urgent markdown! High discount recommended to prevent total waste.";
  }

  const suggestedPrice = Math.floor(originalPrice * (1 - suggestedDiscount / 100));

  return {
    suggestedPrice,
    suggestedDiscount,
    reason
  };
};

export const generateWasteInsights = (restaurantId: string) => {
  // Mock analytics data generation
  return {
    mostWastedCategory: 'Rice',
    bestPostingTime: '2:00 PM',
    efficiencyScore: 85,
    projectedSavings: '₦45,000 this week'
  };
};
