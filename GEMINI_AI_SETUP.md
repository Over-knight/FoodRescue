# Gemini AI Integration Setup Guide

## ✅ Installation Complete

The Gemini AI has been successfully integrated into your FoodRescue backend.

## 🔑 Getting Your API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy your API key

## ⚙️ Configuration

Add this to your `.env` file in `FoodRescue-Backend`:

```env
GEMINI_API_KEY=your_api_key_here
```

## 🚀 Available Endpoints

### 1. **AI Chat** (Public/Authenticated)
Ask questions about restaurants, products, availability.

```http
POST /api/ai/chat
Content-Type: application/json

{
  "message": "Which restaurant is closest to me?",
  "location": {
    "lat": 6.5244,
    "lng": 3.3792
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Based on your location, the closest restaurants are..."
  }
}
```

### 2. **Bulk Product Aggregation** (Public)
Perfect for NGOs to find bulk quantities.

```http
POST /api/ai/aggregate
Content-Type: application/json

{
  "query": "I need 50 spaghetti servings from restaurants near me",
  "location": {
    "lat": 6.5244,
    "lng": 3.3792
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "query": "spaghetti",
    "requestedQuantity": 50,
    "totalAvailable": 75,
    "canFulfill": true,
    "restaurantsCount": 3,
    "breakdown": [
      {
        "restaurantName": "John's Kitchen",
        "productName": "Spaghetti Bolognese",
        "available": 30,
        "unit": "servings",
        "price": 500,
        "distance": "1.2 km",
        "productId": "..."
      }
    ]
  }
}
```

### 3. **Personalized Recommendations** (Authenticated)
AI-powered recommendations based on order history.

```http
GET /api/ai/gemini-recommendations?limit=5
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "recommendations": [
      {
        "_id": "...",
        "name": "Jollof Rice",
        "description": "...",
        "pricing": {...},
        "restaurant": {...}
      }
    ],
    "count": 5
  }
}
```

### 4. **Smart Product Search** (Public)
Natural language product search.

```http
POST /api/ai/search
Content-Type: application/json

{
  "query": "spicy pasta under 1000 naira",
  "filters": {
    "visibleTo": "consumer",
    "location": {
      "lat": 6.5244,
      "lng": 3.3792,
      "maxDistance": 50000
    }
  }
}
```

### 5. **Welcome Recommendations** (Public/Authenticated)
Get recommendations when user enters the app.

```http
GET /api/ai/welcome
Authorization: Bearer <token> (optional)
```

- **Without auth**: Returns popular products
- **With auth**: Returns personalized recommendations based on history

## 🎯 Use Cases

### For Consumers
- "What's available near me?"
- "Show me cheap food options"
- Get personalized recommendations

### For NGOs
- "I need 100 plates of rice from multiple restaurants"
- Find bulk quantities across restaurants
- Calculate total availability

### For Everyone
- Natural language search
- Location-based recommendations
- Chat-based assistance

## 🔄 Testing

Start your backend:
```bash
cd FoodRescue-Backend
npm run dev
```

Test with curl:
```bash
curl -X POST http://localhost:5000/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What food is available?"}'
```

## 📝 Notes

- The AI uses Gemini 1.5 Flash model (fast and cost-effective)
- Chat supports optional authentication for personalized responses
- Location-based queries use Haversine formula for distance calculation
- Bulk aggregation automatically sorts restaurants by distance
