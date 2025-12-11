# FoodRescue Backend API

Node.js/Express backend for FoodRescue Lagos application.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file in the backend directory with:
```
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/foodrescue
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=30d
```

3. Make sure MongoDB is running locally or update `MONGO_URI` with your MongoDB Atlas connection string.

4. Start the server:
```bash
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (Protected)

### Foods
- `GET /api/foods` - Get all active foods
- `GET /api/foods/:id` - Get single food
- `POST /api/foods` - Create food (Restaurant only)
- `PUT /api/foods/:id` - Update food (Restaurant only)
- `DELETE /api/foods/:id` - Delete food (Restaurant only)

### Orders
- `GET /api/orders` - Get user's orders (Protected)
- `POST /api/orders` - Create order (Protected)
- `PUT /api/orders/:id` - Update order status (Protected)

## Testing

Use Postman or Thunder Client to test the API endpoints.

Example register request:
```json
POST http://localhost:5000/api/auth/register
{
  "name": "Test User",
  "email": "test@example.com",
  "password": "password123",
  "role": "consumer"
}
```
