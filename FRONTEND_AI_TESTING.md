# Gemini AI Frontend Integration - Testing Guide

## ✅ What's Been Implemented

### 1. **AI Chat Widget** 
- Floating chat button in bottom-right corner
- Click to open/close chat interface
- Real-time conversation with Gemini AI
- Auto-fetches user location for contextual responses
- Clean, modern UI matching your app design

### 2. **Personalized Recommendations**
- Horizontal scrollable section on Home page
- Shows AI-powered recommendations for logged-in users
- Based on order history and preferences
- Updates automatically when user logs in

### 3. **AI Service API**
Added new endpoints to `aiApiService.ts`:
- `chat()` - Chat with AI assistant
- `getGeminiRecommendations()` - Get personalized recommendations
- `searchProducts()` - Smart product search
- `aggregateProducts()` - Bulk product queries for NGOs
- `getWelcomeRecommendations()` - Welcome page suggestions

## 🧪 How to Test

### Test the Chat Widget

1. **Start your backend** (make sure it's running with Gemini API key):
   ```bash
   cd FoodRescue-Backend
   npm run dev
   ```

2. **Start your frontend**:
   ```bash
   cd FoodRescue-Frontend
   npm start
   ```

3. **Open the app** in browser (http://localhost:3000)

4. **Look for the green chat button** in the bottom-right corner

5. **Click it to open the chat**

6. **Try these test questions**:
   - "What food is available?"
   - "Which restaurant is closest to me?"
   - "Show me cheap food options"
   - "I need 50 spaghetti servings" (NGO bulk query)

### Test AI Recommendations

1. **Log in** to your account (recommendations only show for logged-in users)

2. **Go to Home page** - you should see a section titled "Recommended For You" with AI-powered suggestions

3. **If you don't see recommendations**:
   - Make sure you have some past orders
   - Check browser console for any errors
   - Verify backend is responding to `/api/ai/gemini-recommendations`

### Test Features by User Role

#### For Consumers:
- Browse recommendations
- Chat about products
- Ask for nearby restaurants

#### For NGOs:
- Chat: "I need 100 plates of rice from multiple restaurants"
- Get bulk availability across restaurants
- See distance-sorted results

## 🎨 UI Features

### Chat Widget
- ✅ Floating button (green, with message icon)
- ✅ Smooth open/close animation
- ✅ Modern chat interface
- ✅ Typing indicator while AI responds
- ✅ Message bubbles (user: green, AI: white)
- ✅ Auto-scroll to latest message
- ✅ Enter key to send messages

### Recommendations Section
- ✅ Sparkle icon header
- ✅ Horizontal scrollable cards
- ✅ Shows product images
- ✅ Displays discount badges
- ✅ Click to go to checkout

## 🔧 Troubleshooting

### Chat widget not appearing?
- Check browser console for errors
- Verify ChatWidget is imported in Layout.tsx
- Make sure backend is running

### Recommendations not loading?
- Log in first (recommendations require authentication)
- Check if you have order history
- Verify `/api/ai/gemini-recommendations` endpoint works

### "Failed to process your message" error?
- Check if GEMINI_API_KEY is set in backend .env
- Verify backend is running
- Check backend console for detailed errors

### Backend API errors?
- Make sure you installed `@google/generative-ai` package
- Restart backend after adding API key
- Check backend console logs

## 📝 Test Scenarios

### Scenario 1: First-time User
1. Open app (not logged in)
2. Chat widget should appear
3. Click and ask: "What food is available?"
4. AI should list available products

### Scenario 2: Returning User
1. Log in with existing account
2. See personalized recommendations on home page
3. Open chat and ask: "What did I order last time?"
4. AI should reference your order history

### Scenario 3: NGO Bulk Order
1. Log in as NGO user
2. Open chat
3. Ask: "I need 50 spaghetti servings"
4. AI should aggregate from multiple restaurants and show breakdown

## 🌐 API Endpoints Being Used

Frontend calls these backend endpoints:

- `POST /api/ai/chat` - Chat messages
- `GET /api/ai/gemini-recommendations?limit=4` - Personalized recommendations
- `POST /api/ai/search` - Smart product search
- `POST /api/ai/aggregate` - Bulk product aggregation
- `GET /api/ai/welcome` - Welcome recommendations

## 📱 Mobile Responsiveness

The chat widget is fully responsive:
- Adjusts width on smaller screens
- Touch-friendly buttons
- Smooth scrolling
- Works on all devices

## 🎯 Next Steps

1. Test all scenarios above
2. Try different question types in chat
3. Check recommendations with different users
4. Test on mobile devices
5. Gather user feedback

## 💡 Tips

- The AI uses your location (if permitted) for better recommendations
- Chat history is session-based (clears on page refresh)
- Recommendations update when you log in/out
- All responses are powered by Google Gemini AI

Happy testing! 🚀
