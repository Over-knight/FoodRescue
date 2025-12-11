# Frontend-Backend Integration Guide

## Setup

### 1. Backend Setup
```bash
cd backend
npm install
# Make sure MongoDB is running
npm run dev
```
Backend will run on `http://localhost:5000`

### 2. Frontend Setup
```bash
cd frontend
npm install axios  # Already done
npm start
```
Frontend will run on `http://localhost:3000`

## API Integration

The frontend now has two modes:

### Demo Mode (Quick Testing)
- Click the demo role buttons on login page
- Uses mock data (no backend required)
- Perfect for presentations

### Real API Mode
- Enter email/password in the login form
- Connects to backend API
- Requires backend server running

## Testing Real API

1. **Register a new user:**
   - Go to `/signup`
   - Fill in the form
   - User will be created in MongoDB

2. **Login:**
   - Use the registered email/password
   - JWT token will be stored in localStorage

3. **Protected Routes:**
   - Orders, Dashboard, etc. will use real API data

## Environment Variables

Frontend `.env`:
```
REACT_APP_API_URL=http://localhost:5000/api
```

Backend `.env`:
```
MONGO_URI=mongodb://localhost:27017/foodrescue
JWT_SECRET=your_secret_key
```

## API Endpoints Used

- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user
- `GET /api/foods` - Get all foods
- `POST /api/foods` - Create food (Restaurant)
- `GET /api/orders` - Get user orders
- `POST /api/orders` - Create order

## Notes

- The app works in **hybrid mode**: demo buttons for quick testing, real API for production
- All API calls include JWT token automatically via axios interceptor
- Mock data is still available as fallback
