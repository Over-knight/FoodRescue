# Backend API Integration

## Backend URL
**Production:** https://food-rescue-backend.vercel.app/api

## Environment Setup

Create a `.env` file in the frontend root with:
```
REACT_APP_API_URL=https://food-rescue-backend.vercel.app/api
```

For local development:
```
REACT_APP_API_URL=http://localhost:5000/api
```

## Available Services

### 1. Authentication Service (`authService.ts`)
```typescript
import { authService } from './services/authService';

// Login
const response = await authService.login({
    email: 'user@example.com',
    password: 'password123'
});

// Signup
const response = await authService.signup({
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
    role: 'consumer'
});

// Logout
authService.logout();

// Check if authenticated
const isAuth = authService.isAuthenticated();
```

### 2. Food Service (`foodService.ts`)
```typescript
import { foodService } from './services/foodService';

// Get all foods
const foods = await foodService.getAllFoods();

// Get foods with filters
const filteredFoods = await foodService.getAllFoods({
    category: 'Rice',
    minPrice: 500,
    maxPrice: 2000
});

// Get nearby foods
const nearbyFoods = await foodService.getNearbyFoods(6.5244, 3.3792, 5);

// Create food (restaurant/stores)
const newFood = await foodService.createFood({
    name: 'Jollof Rice',
    description: 'Delicious Nigerian jollof',
    originalPrice: 2000,
    discountedPrice: 1000,
    quantity: 10,
    category: 'Rice'
});
```

### 3. Order Service (`orderService.ts`)
```typescript
import { orderService } from './services/orderService';

// Create order
const order = await orderService.createOrder({
    foodId: 'food123',
    quantity: 2
});

// Get user orders
const myOrders = await orderService.getUserOrders('user123');

// Update order status
await orderService.updateOrderStatus('order123', 'confirmed');
```

### 4. Analytics Service (`analyticsApiService.ts`)
```typescript
import { analyticsService } from './services/analyticsApiService';

// Get restaurant analytics
const analytics = await analyticsService.getRestaurantAnalytics('restaurant123');

// Get platform analytics (admin)
const platformStats = await analyticsService.getPlatformAnalytics();
```

### 5. AI Service (`aiApiService.ts`)
```typescript
import { aiService } from './services/aiApiService';

// Smart Food Matching
const matches = await aiService.matchFoods({
    preferences: ['Rice', 'Pastries', 'Fast Food'],
    budget: { min: 500, max: 2000 },
    location: { lat: 6.5244, lng: 3.3792 }
});

// Each match includes:
// - food: Food object
// - matchScore: 0-100
// - scoreBreakdown: { preferenceScore, budgetScore, locationScore, urgencyScore }
// - reasoning: Why this food was matched

// Get Personalized Recommendations
const recommendations = await aiService.getRecommendations('user123');

// Returns:
// - recommendations: Array of recommended foods with reasons
// - basedOn: { orderHistory, favoriteCategories, averageSpending }

// AI Pricing Suggestions (for restaurants)
const pricingSuggestion = await aiService.getPricingSuggestion({
    foodDetails: {
        originalPrice: 2000,
        category: 'Rice',
        quantity: 10
    },
    expiryTime: '2025-12-11T23:00:00Z'
});

// Returns:
// - suggestedDiscountPercent: e.g., 50
// - suggestedPrice: e.g., 1000
// - reasoning: Why this discount
// - urgencyLevel: 'low' | 'medium' | 'high' | 'critical'
// - timeUntilExpiry: { hours, minutes }

// Local Fallback (if API fails)
const localScore = aiService.calculateLocalMatchScore(
    food,
    ['Rice', 'Pastries'],
    { min: 500, max: 2000 },
    { lat: 6.5244, lng: 3.3792 }
);
```

## API Client (`apiClient.ts`)

The base API client handles:
- ✅ Automatic token injection from localStorage
- ✅ Error handling and logging
- ✅ JSON serialization
- ✅ All HTTP methods (GET, POST, PUT, PATCH, DELETE)

## Migration from Mock Data

To switch from mock data to real API:

**Before:**
```typescript
import { MOCK_FOODS } from './services/mockData';
const foods = MOCK_FOODS;
```

**After:**
```typescript
import { foodService } from './services/foodService';
const foods = await foodService.getAllFoods();
```

## Error Handling

All services throw errors that can be caught:

```typescript
try {
    const foods = await foodService.getAllFoods();
} catch (error) {
    console.error('Failed to fetch foods:', error);
    // Show error message to user
}
```

## Authentication Flow

1. User logs in → token saved to localStorage
2. All subsequent API calls include token in Authorization header
3. User logs out → token removed from localStorage

## Next Steps

1. Update components to use real API services instead of mock data
2. Add loading states while fetching data
3. Add error handling UI
4. Test all endpoints with deployed backend
