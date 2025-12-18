# Gemini AI Integration for FoodRescue

## Overview
This integration adds Google's Gemini AI to your FoodRescue backend, providing intelligent chatbot capabilities, personalized recommendations, and smart product search.

## Features Implemented

### 1. **AI Chatbot** 
Users can ask natural language questions like:
- "Which restaurant is closest to me?"
- "What products are available?"
- "Show me restaurants near my location"
- Questions about their order history

### 2. **Bulk Product Aggregation** (Perfect for NGOs)
NGOs can query for bulk quantities:
- "I need 50 spaghetti servings"
- "Find me 100 portions of rice"

The AI will:
- Search through all available products
- Calculate total available quantity
- Show which restaurants have what
- Sort by distance (if location provided)
- Tell if the request can be fulfilled

### 3. **Personalized Recommendations**
Based on user's order history, the AI suggests:
- Products they're likely to enjoy
- Items similar to past purchases
- New arrivals matching their preferences

### 4. **Smart Product Search**
Natural language search:
- "cheap pasta near me"
- "spicy food for dinner"
- "desserts under $10"

### 5. **Welcome Recommendations**
When users first enter the app:
- New users see popular items
- Returning users see personalized suggestions

## Setup Instructions

### Step 1: Get Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click "Create API Key"
3. Copy your API key

### Step 2: Add API Key to Environment

1. Create/edit `.env` file in `FoodRescue-Backend/`:
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```

### Step 3: Install Dependencies (Already Done)
```bash
cd FoodRescue-Backend
npm install @google/generative-ai
```

### Step 4: Start Your Backend
```bash
npm run dev
```

## API Endpoints

### 1. Chat with AI
**POST** `/api/ai/chat`

**Request Body:**
```json
{
  "message": "Which restaurant is closest to me?",
  "location": {
    "lat": 9.0820,
    "lng": 8.6753
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Based on your location, here are the closest restaurants:\n\n1. Pizza Palace - 0.5 km away\n2. Burger House - 1.2 km away\n3. Sushi Bar - 2.3 km away"
  }
}
```

**Auth:** Optional (better results if authenticated)

---

### 2. Aggregate Products (NGO Bulk Queries)
**POST** `/api/ai/aggregate`

**Request Body:**
```json
{
  "query": "I need 50 spaghetti servings",
  "location": {
    "lat": 9.0820,
    "lng": 8.6753
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
        "restaurantName": "Italian Kitchen",
        "productName": "Spaghetti Bolognese",
        "available": 30,
        "unit": "servings",
        "price": 500,
        "distance": "0.8 km",
        "productId": "..."
      },
      {
        "restaurantName": "Pasta Place",
        "productName": "Classic Spaghetti",
        "available": 25,
        "unit": "servings",
        "price": 450,
        "distance": "1.5 km",
        "productId": "..."
      },
      {
        "restaurantName": "Food Hub",
        "productName": "Spaghetti with Sauce",
        "available": 20,
        "unit": "servings",
        "price": 400,
        "distance": "2.1 km",
        "productId": "..."
      }
    ]
  }
}
```

**Auth:** Not required

---

### 3. Get Personalized Recommendations
**GET** `/api/ai/gemini-recommendations?limit=5`

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
        "pricing": { "retail": { "price": 800 } },
        "category": { "name": "Main Dishes" },
        "restaurant": {
          "firstName": "John",
          "lastName": "Doe"
        }
      }
    ],
    "count": 5
  }
}
```

**Auth:** Required (Bearer token)

---

### 4. Smart Product Search
**POST** `/api/ai/search`

**Request Body:**
```json
{
  "query": "spicy pasta under 1000 naira",
  "filters": {
    "visibleTo": "consumer",
    "location": {
      "lat": 9.0820,
      "lng": 8.6753,
      "maxDistance": 10000
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "products": [...],
    "count": 5
  }
}
```

**Auth:** Not required

---

### 5. Welcome Recommendations
**GET** `/api/ai/welcome`

Shows personalized recommendations for returning users, popular items for new users.

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Welcome back! Based on your preferences, we recommend:",
    "recommendations": [...]
  }
}
```

**Auth:** Optional (different results based on auth status)

---

## Frontend Integration Example

### Chat Component Example
```typescript
import axios from 'axios';

const ChatWithAI = () => {
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');
  const [location, setLocation] = useState(null);

  useEffect(() => {
    // Get user's location
    navigator.geolocation.getCurrentPosition((pos) => {
      setLocation({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude
      });
    });
  }, []);

  const handleChat = async () => {
    try {
      const res = await axios.post('http://localhost:5000/api/ai/chat', {
        message,
        location
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      setResponse(res.data.data.message);
    } catch (error) {
      console.error('Chat error:', error);
    }
  };

  return (
    <div>
      <input 
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Ask me anything..."
      />
      <button onClick={handleChat}>Send</button>
      {response && <div>{response}</div>}
    </div>
  );
};
```

### Welcome Page with Recommendations
```typescript
import axios from 'axios';

const WelcomePage = () => {
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
        
        const res = await axios.get('http://localhost:5000/api/ai/welcome', { headers });
        setRecommendations(res.data.data.recommendations);
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchRecommendations();
  }, []);

  return (
    <div>
      <h1>Welcome to FoodRescue!</h1>
      <div className="recommendations">
        {recommendations.map(product => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </div>
  );
};
```

### NGO Bulk Query Component
```typescript
const BulkQuery = () => {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState(null);

  const handleSearch = async () => {
    try {
      const res = await axios.post('http://localhost:5000/api/ai/aggregate', {
        query,
        location: { lat: 9.0820, lng: 8.6753 }
      });
      
      setResult(res.data.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div>
      <input 
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="e.g., I need 50 spaghetti servings"
      />
      <button onClick={handleSearch}>Search</button>
      
      {result && (
        <div>
          <h3>Results for {result.query}</h3>
          <p>You need: {result.requestedQuantity}</p>
          <p>Available: {result.totalAvailable}</p>
          <p>Can fulfill: {result.canFulfill ? 'Yes' : 'No'}</p>
          <p>Restaurants: {result.restaurantsCount}</p>
          
          <div>
            {result.breakdown.map((item, idx) => (
              <div key={idx}>
                <h4>{item.restaurantName}</h4>
                <p>{item.productName} - {item.available} {item.unit}</p>
                <p>Price: ₦{item.price}</p>
                <p>Distance: {item.distance}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
```

## Testing

### Test the Chat Endpoint
```bash
curl -X POST http://localhost:5000/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What restaurants are available?"
  }'
```

### Test Aggregate Endpoint
```bash
curl -X POST http://localhost:5000/api/ai/aggregate \
  -H "Content-Type: application/json" \
  -d '{
    "query": "I need 50 spaghetti servings",
    "location": {"lat": 9.0820, "lng": 8.6753}
  }'
```

## Important Notes

1. **API Key Security**: Never commit your `.env` file with the API key to GitHub
2. **Rate Limits**: Gemini has rate limits on the free tier - monitor usage
3. **Location Data**: For best results with "nearby" queries, always send user location
4. **User Context**: The AI works better when users are authenticated (can access order history)

## Troubleshooting

### Error: "Failed to process your request"
- Check if GEMINI_API_KEY is set in `.env`
- Verify the API key is valid

### Empty recommendations
- User may have no order history
- System falls back to popular products

### Location-based queries not working
- Ensure restaurants have location data in their profiles
- Send user's current location in requests

## Next Steps

1. Add the chat UI component to your frontend
2. Add welcome recommendations to your home page
3. Add bulk query interface for NGO users
4. Customize AI prompts in `geminiService.ts` for your specific needs

## Files Created/Modified

1. **New Files:**
   - `services/geminiService.ts` - Core AI service
   
2. **Modified Files:**
   - `controllers/aiController.ts` - Added Gemini endpoints
   - `routes/aiRoutes.ts` - Added new routes
   - `.env.example` - Added GEMINI_API_KEY

## Support

For issues or questions about the Gemini integration, check:
- [Google AI Studio](https://makersuite.google.com/)
- [Gemini API Documentation](https://ai.google.dev/docs)
