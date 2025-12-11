# AI Endpoints Documentation

## Overview
The AI endpoints provide intelligent food matching, personalized recommendations, and dynamic pricing suggestions to enhance the FoodRescue platform.

## Base URL
```
https://food-rescue-backend.vercel.app/api/ai
```

---

## Endpoints

### 1. Smart Food Matching
**POST** `/api/ai/match-foods`

Matches foods based on user preferences, budget, location, and urgency using a weighted scoring algorithm.

#### Request Body
```json
{
  "preferences": ["Rice", "Pastries", "Fast Food"],
  "budget": {
    "min": 500,
    "max": 2000
  },
  "location": {
    "lat": 6.5244,
    "lng": 3.3792
  }
}
```

#### Response
```json
{
  "matches": [
    {
      "food": { /* Product object */ },
      "matchScore": 85,
      "scoreBreakdown": {
        "preferenceScore": 40,
        "budgetScore": 30,
        "locationScore": 15,
        "urgencyScore": 10
      },
      "reasoning": "Perfect match for your Rice preference. Within your budget. Nearby location. Expiring soon - act fast!"
    }
  ],
  "totalMatches": 15
}
```

#### Scoring Algorithm
- **Preference Score (40 points)**: Matches user's favorite categories
- **Budget Score (30 points)**: Fits within user's budget range
- **Location Score (20 points)**: Based on distance from user
- **Urgency Score (10 points)**: Higher score for items expiring soon

---

### 2. Personalized Recommendations
**GET** `/api/ai/recommendations/:userId`

🔒 **Protected** - Requires authentication

Provides personalized food recommendations based on user's order history and preferences.

#### Parameters
- `userId` (path): User ID

#### Response
```json
{
  "recommendations": [
    {
      "food": { /* Product object */ },
      "reason": "You often order Rice items in this price range",
      "confidence": 0.9
    }
  ],
  "basedOn": {
    "orderHistory": 25,
    "favoriteCategories": ["Rice", "Pastries", "Fast Food"],
    "averageSpending": 1500
  }
}
```

#### Logic
1. Analyzes user's past orders
2. Identifies favorite categories
3. Calculates average spending
4. Recommends items matching patterns

---

### 3. AI Pricing Suggestion
**POST** `/api/ai/pricing-suggestion`

🔒 **Protected** - Requires authentication

Suggests optimal discount percentage based on time until expiry.

#### Request Body
```json
{
  "foodDetails": {
    "originalPrice": 2000,
    "category": "Rice",
    "quantity": 10
  },
  "expiryTime": "2025-12-11T23:00:00Z"
}
```

#### Response
```json
{
  "suggestedDiscountPercent": 50,
  "suggestedPrice": 1000,
  "reasoning": "Less than 4 hours until expiry - significant discount needed",
  "urgencyLevel": "high",
  "timeUntilExpiry": {
    "hours": 3,
    "minutes": 45
  }
}
```

#### Pricing Logic

| Time Until Expiry | Discount | Urgency Level |
|-------------------|----------|---------------|
| > 24 hours        | 20%      | low           |
| 8-24 hours        | 30%      | low           |
| 4-8 hours         | 40%      | medium        |
| 2-4 hours         | 50%      | high          |
| 1-2 hours         | 60%      | high          |
| < 1 hour          | 70%      | critical      |
| Expired           | 80%      | critical      |

---

## Implementation Details

### Distance Calculation
Uses Haversine formula to calculate distance between user and vendor:

```typescript
distance = 2 * R * arcsin(√(sin²(Δlat/2) + cos(lat1) * cos(lat2) * sin²(Δlon/2)))
```

Where R = 6371 km (Earth's radius)

### Location Scoring
- ≤ 2 km: 20 points
- ≤ 5 km: 15 points
- ≤ 10 km: 10 points
- > 10 km: 5 points

### Urgency Scoring
- ≤ 2 hours: 10 points
- ≤ 4 hours: 7 points
- ≤ 8 hours: 5 points
- > 8 hours: 3 points

---

## Error Handling

All endpoints return standard error responses:

```json
{
  "message": "Error description",
  "error": "Detailed error message"
}
```

### Common Error Codes
- `400` - Bad Request (missing required fields)
- `401` - Unauthorized (authentication required)
- `500` - Internal Server Error

---

## Usage Examples

### Frontend Integration

```typescript
import { aiService } from './services/aiApiService';

// Get smart matches
const matches = await aiService.matchFoods({
    preferences: ['Rice', 'Pastries'],
    budget: { min: 500, max: 2000 },
    location: { lat: 6.5244, lng: 3.3792 }
});

// Get recommendations
const recs = await aiService.getRecommendations('user123');

// Get pricing suggestion
const pricing = await aiService.getPricingSuggestion({
    foodDetails: {
        originalPrice: 2000,
        category: 'Rice',
        quantity: 10
    },
    expiryTime: '2025-12-11T23:00:00Z'
});
```

---

## Performance Considerations

- **Caching**: Consider caching match results for 5-10 minutes
- **Pagination**: Match results limited to top 20 items
- **Database Indexing**: Ensure indexes on:
  - `category`
  - `discountedPrice`
  - `expiryTime`
  - `location` (geospatial index)

---

## Future Enhancements

- [ ] Machine learning model for better predictions
- [ ] Collaborative filtering for recommendations
- [ ] A/B testing for pricing strategies
- [ ] Real-time demand-based pricing
- [ ] Weather-based discount adjustments
