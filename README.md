# FoodRescue Lagos 🍱

**FoodRescue Lagos** is a mobile-first marketplace connecting **restaurants and stores** with surplus food to consumers at discounted prices, reducing food waste across the entire supply chain while fighting hunger.

---

## 🏆 Lagos Impact Hackathon '25 - Technical Requirements

### ✅ AI (Artificial Intelligence)
- **Smart Food Matching Algorithm** - Rule-based AI that scores and ranks food items based on user preferences, budget, location, and urgency
- **Dynamic Pricing Suggestions** - AI-powered pricing recommendations based on expiry time
- **Waste Insights Generation** - Automated analysis and recommendations for restaurants
- **AI-Powered Recommendations** - Data-driven insights for optimization

### ✅ Data Science
- **Statistical Analysis** - Trend analysis, averages, growth metrics, and performance tracking
- **Predictive Modeling** - Linear regression for forecasting future meals and revenue
- **Data Visualization** - Interactive charts (Line, Pie, Bar) with Recharts library
- **Pattern Recognition** - Best posting times, category performance, anomaly detection
- **Recommendation Engine** - Rule-based insights for restaurant optimization
- **Environmental Impact Modeling** - CO₂ savings calculations

---

## 🚀 Key Features

### For Consumers
- 🔍 **Browse Surplus Food** - Discover discounted meals AND groceries from local vendors
- 🤖 **AI-Powered Matching** - Get personalized recommendations based on your preferences and budget
- 💰 **Discounted Prices** - Save money while reducing food waste
- 📍 **Location-Based** - Find food near you with distance calculations
- 📊 **Budget Range** - Set min/max daily food budget during onboarding
- 🍱 **Food Preferences** - Select favorite categories (Rice, Pastries, Fresh Produce, Dairy, etc.)
- 🔄 **Smart Filters** - Toggle between "All Items", "Meals" (restaurants), or "Groceries" (stores)

### For Restaurants & Stores
- 📝 **Post Surplus Food** - List excess inventory before it goes to waste
- 🛒 **Multiple Vendor Types** - Restaurants (cooked meals) OR Stores (produce, dairy, packaged goods)
- 💵 **Revenue Recovery** - Earn money from food that would otherwise be discarded
- 📊 **Analytics Dashboard** - Comprehensive data science insights
- 📈 **Performance Tracking** - Monitor meals saved, revenue, and waste reduction
- 🔮 **Predictive Insights** - Forecast next week's performance with linear regression
- 🎯 **Optimization Tips** - AI-powered recommendations for best posting times
- 🌍 **Environmental Impact** - Track CO₂ savings and sustainability metrics

### For Admins
- ✅ **Restaurant Verification** - Approve/reject restaurant applications
- 👥 **User Management** - Monitor platform activity
- 📊 **Platform Analytics** - System-wide statistics and insights

---

## 📊 Data Science Analytics Dashboard

### Key Metrics
- **Total Meals Saved** - With week-over-week trend percentage
- **Total Revenue** - With daily average calculations
- **Waste Reduced** - In kilograms with CO₂ impact
- **Next Week Forecast** - Predictive modeling using linear regression

### Interactive Charts
1. **Line Chart** - 30-day trend of meals saved over time
2. **Pie Chart** - Category breakdown by food type
3. **Bar Chart** - Revenue analysis by category
4. **Progress Bars** - Best posting times with success rates

### AI-Powered Insights
- Performance alerts and trend notifications
- Category optimization recommendations
- Revenue improvement suggestions
- Environmental impact messaging
- Data-driven posting time suggestions

### Technical Implementation
- **Statistical Functions**: Mean, median, totals, trend analysis
- **Predictive Algorithm**: Custom linear regression implementation
- **Data Visualization**: Recharts library for React
- **Pattern Recognition**: Time-based and category-based analysis
- **Recommendation Engine**: Rule-based AI insights

---

## 📂 Project Structure

### Frontend (`/frontend`)
```
src/
├── pages/
│   ├── Home.tsx                    # Main food browsing page
│   ├── Analytics.tsx               # Data Science dashboard (NEW)
│   ├── Onboarding.tsx              # Post-signup preference collection
│   ├── Checkout.tsx                # Payment simulation
│   ├── RestaurantDashboard.tsx     # Restaurant food management
│   └── AdminDashboard.tsx          # Admin verification panel
├── services/
│   ├── aiService.ts                # AI matching algorithm
│   ├── analyticsService.ts         # Data Science functions (NEW)
│   └── mockData.ts                 # Sample data
└── components/
    ├── Layout.tsx                  # Navigation and layout
    └── FoodCard.tsx                # Food item display
```

### Backend (`/backend`)
```
src/
├── models/
│   ├── User.js                     # User schema with preferences
│   ├── Food.js                     # Food listing schema
│   └── Order.js                    # Order schema
├── routes/
│   ├── auth.js                     # Authentication endpoints
│   ├── foods.js                    # Food CRUD operations
│   ├── orders.js                   # Order management
│   └── users.js                    # User profile endpoints (NEW)
└── server.js                       # Express server setup
```

---

## 🛠 Setup & Run

### Prerequisites
- Node.js (v14+)
- npm or yarn
- MongoDB (for backend)

### Frontend Setup
```bash
cd frontend
npm install
npm start
```
App runs at `http://localhost:3000`

### Backend Setup (Optional)
```bash
cd backend
npm install
npm run dev
```
Server runs at `http://localhost:5000`

---

## 👤 Demo Accounts

### Consumer
- **Email**: `consumer@test.com`
- **Password**: `password123`
- **Features**: Browse food, AI matching, onboarding flow

### Restaurant
- **Email**: `restaurant@test.com`
- **Password**: `password123`
- **Features**: Post food, analytics dashboard, insights

### Store
- **Email**: `shoprite@example.com`
- **Password**: `password123`
- **Features**: Post store items, analytics dashboard, insights
- **Demo Items**: Rice, Tomatoes, Milk, Bread, Eggs, Canned Beans

### Admin
- **Email**: `admin@test.com`
- **Password**: `password123`
- **Features**: Verify restaurants, platform management

---

## 🎯 How to Demo

### 1. Consumer Flow
1. Login as consumer
2. Complete onboarding (set budget range & preferences)
3. Browse AI-matched food recommendations
4. **Use filter tabs**: Toggle between "All Items", "Meals", or "Groceries"
5. View food details and checkout

### 2. Restaurant/Store Flow
1. Login as restaurant OR store
2. Post surplus food items (meals or groceries)
3. View **Analytics Dashboard** (`/analytics`)
4. Review data science insights and predictions

### 3. Admin Flow
1. Login as admin
2. Review pending restaurant verifications
3. Approve/reject applications

---

## 🔬 Data Science Features

### Statistical Analysis
- **Descriptive Statistics**: Totals, averages, percentages
- **Trend Analysis**: Week-over-week comparison
- **Growth Metrics**: Performance tracking over time

### Predictive Modeling
```typescript
// Linear Regression Implementation
slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
intercept = (sumY - slope * sumX) / n
prediction = slope * x + intercept
```

### Environmental Impact
```typescript
// CO₂ Savings Calculation
co2Saved = wasteReduced * 2.5 // kg CO₂ per kg food waste
```

### Pattern Recognition
- Best posting times identification
- Category performance analysis
- Growth trend detection
- Anomaly awareness

---

## 🌍 Environmental Impact

Every meal AND store item saved through FoodRescue contributes to:
- **Reduced Food Waste** - Preventing edible food from landfills (cooked meals + fresh produce + packaged goods)
- **Lower CO₂ Emissions** - 2.5kg CO₂ saved per kg of food waste prevented
- **Resource Conservation** - Saving water, energy, and agricultural resources used in food production
- **Supply Chain Efficiency** - Tackling waste at both retail (stores) and preparation (restaurants) levels
- **Hunger Relief** - Making nutritious food accessible at affordable prices

**Example Impact:**
- 1 bag of rice saved = 50kg waste prevented = 125kg CO₂ saved
- 1 crate of tomatoes saved = 5kg waste prevented = 12.5kg CO₂ saved
- 1 plate of jollof rice saved = 0.5kg waste prevented = 1.25kg CO₂ saved

---

## 🚀 Technology Stack

### Frontend
- **React** with TypeScript
- **React Router** for navigation
- **Recharts** for data visualization
- **Context API** for state management

### Backend
- **Node.js** with Express
- **MongoDB** with Mongoose
- **JWT** for authentication
- **bcrypt** for password hashing

### AI & Data Science
- **Custom algorithms** in TypeScript
- **Linear regression** for predictions
- **Statistical analysis** functions
- **Pattern recognition** logic

---

## 📈 Future Enhancements

### Quick Wins
- [ ] Real-time notifications
- [ ] Export analytics to PDF
- [ ] Date range filters for analytics
- [ ] Mobile app (React Native)

### Advanced Features
- [ ] Machine Learning with TensorFlow.js
- [ ] User clustering/segmentation
- [ ] Dynamic pricing optimization
- [ ] Sentiment analysis on reviews
- [ ] Blockchain for transparency (Web3)

---

## 📄 License

This project was created for the Lagos Impact Hackathon '25.

---

## 🤝 Contributing

This is a hackathon project. For questions or suggestions, please reach out to the team.

---

## 📞 Contact

**FoodRescue Lagos Team**
- Fighting hunger, reducing waste, one meal at a time 🍱🌍
