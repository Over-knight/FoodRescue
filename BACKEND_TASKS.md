# Backend Engineer Tasks - FoodRescue Lagos

## Priority 1: Critical Backend Integration (Must Do)

### 1. Database Setup & Connection
- [ ] Set up MongoDB Atlas account (or local MongoDB)
- [ ] Create database: `foodrescue_lagos`
- [ ] Configure connection string in `.env`
- [ ] Test database connection
- [ ] Create indexes for performance:
  - `foods`: location (2dsphere), expiryTime, isActive
  - `users`: email (unique), role
  - `orders`: userId, foodId, createdAt

### 2. Authentication System
- [ ] Implement JWT token generation in `auth.js`
- [ ] Add password hashing with bcrypt (currently missing)
- [ ] Create refresh token mechanism
- [ ] Add email verification flow
- [ ] Implement password reset functionality
- [ ] Add rate limiting to prevent brute force attacks

### 3. API Endpoints - Complete Implementation
Currently, routes are scaffolded but need full implementation:

#### Foods API (`/api/foods`)
- [ ] GET `/` - Implement filtering by location, category, price range
- [ ] GET `/:id` - Add population of restaurant details
- [ ] POST `/` - Add image upload validation
- [ ] PUT `/:id` - Add authorization check (only owner can edit)
- [ ] DELETE `/:id` - Implement soft delete (set isActive: false)
- [ ] GET `/nearby` - Implement geospatial query for location-based search

#### Orders API (`/api/orders`)
- [ ] POST `/` - Create order with inventory check
- [ ] GET `/user/:userId` - Get user's order history
- [ ] GET `/restaurant/:restaurantId` - Get restaurant's orders
- [ ] PATCH `/:id/status` - Update order status (pending → confirmed → completed)
- [ ] Add order cancellation logic
- [ ] Implement order expiry (auto-cancel after 30 mins if not confirmed)

#### Users API (`/api/users`)
- [ ] GET `/profile` - Already created, test it
- [ ] PATCH `/profile` - Already created, test it
- [ ] GET `/restaurants/pending` - List unverified restaurants (for admin)
- [ ] PATCH `/restaurants/:id/verify` - Verify restaurant (admin only)
- [ ] Add user statistics endpoint (orders count, savings, etc.)

### 4. Analytics Data Endpoints
The frontend analytics dashboard needs real data:

- [ ] GET `/api/analytics/restaurant/:id` - Return historical data
  - Daily meals saved (last 30 days)
  - Revenue by category
  - Waste reduction metrics
  - CO2 impact calculations
  
- [ ] GET `/api/analytics/platform` - Admin platform-wide stats
  - Total meals saved
  - Total restaurants
  - Total users
  - Environmental impact

### 5. Image Upload with Cloudinary
- [ ] Install Cloudinary SDK: `npm install cloudinary multer`
- [ ] Configure Cloudinary credentials in `.env`
- [ ] Create upload middleware in `/middleware/upload.js`
- [ ] Integrate with POST `/api/foods` endpoint
- [ ] Add image optimization (resize, compress)
- [ ] Implement image deletion when food is deleted

---

## Priority 2: Important Features

### 6. Real-time Notifications
- [ ] Install Socket.io: `npm install socket.io`
- [ ] Set up WebSocket server
- [ ] Emit events for:
  - New food posted nearby
  - Order status changes
  - Food about to expire (1 hour warning)
  - Restaurant verification approved/rejected

### 7. Payment Integration (Paystack)
- [ ] Install Paystack SDK: `npm install paystack`
- [ ] Create payment initialization endpoint
- [ ] Implement payment verification webhook
- [ ] Handle payment success/failure
- [ ] Store transaction records
- [ ] Add refund functionality

### 8. Email Service
- [ ] Install Nodemailer: `npm install nodemailer`
- [ ] Configure email service (Gmail/SendGrid)
- [ ] Create email templates:
  - Welcome email
  - Order confirmation
  - Restaurant verification
  - Password reset
  - Daily deals digest

### 9. Data Validation & Error Handling
- [ ] Install Joi: `npm install joi`
- [ ] Create validation schemas for all models
- [ ] Add input validation middleware
- [ ] Implement global error handler
- [ ] Add request logging with Morgan
- [ ] Create custom error classes

### 10. Security Enhancements
- [ ] Install Helmet: `npm install helmet`
- [ ] Add CORS configuration
- [ ] Implement rate limiting (express-rate-limit)
- [ ] Add request sanitization (express-mongo-sanitize)
- [ ] Set up security headers
- [ ] Add API key authentication for admin routes

---

## Priority 3: Optimization & Testing

### 11. Database Optimization
- [ ] Add database seeding script with sample data
- [ ] Implement pagination for list endpoints
- [ ] Add caching with Redis (optional)
- [ ] Create database backup script
- [ ] Add data aggregation for analytics

### 12. API Documentation
- [ ] Install Swagger: `npm install swagger-ui-express swagger-jsdoc`
- [ ] Document all endpoints with JSDoc comments
- [ ] Create Swagger UI at `/api-docs`
- [ ] Add request/response examples
- [ ] Document authentication flow

### 13. Testing
- [ ] Install Jest & Supertest: `npm install --save-dev jest supertest`
- [ ] Write unit tests for models
- [ ] Write integration tests for API endpoints
- [ ] Add test coverage reporting
- [ ] Create test database configuration

### 14. Deployment Preparation
- [ ] Create production environment config
- [ ] Set up environment variables for production
- [ ] Add health check endpoint (`/health`)
- [ ] Configure logging for production
- [ ] Create deployment documentation
- [ ] Set up CI/CD pipeline (GitHub Actions)

---

## Priority 4: Advanced Features (If Time Permits)

### 15. Search & Filtering
- [ ] Implement full-text search for food items
- [ ] Add autocomplete for restaurant names
- [ ] Create advanced filtering (multiple categories, price ranges)
- [ ] Add sorting options (price, distance, expiry time)

### 16. Recommendation Engine
- [ ] Create algorithm to suggest foods based on user history
- [ ] Implement collaborative filtering
- [ ] Add "Frequently bought together" feature
- [ ] Create personalized deals

### 17. Admin Dashboard Backend
- [ ] Create admin statistics endpoints
- [ ] Add user management (ban/unban users)
- [ ] Implement content moderation
- [ ] Add system health monitoring
- [ ] Create audit logs

---

## Suggested Task Distribution

### Week 1 (Critical)
- Database setup & connection
- Complete authentication system
- Implement all CRUD operations for Foods, Orders, Users
- Add basic error handling

### Week 2 (Important)
- Image upload with Cloudinary
- Analytics endpoints for dashboard
- Email service setup
- Payment integration basics

### Week 3 (Polish)
- Security enhancements
- API documentation
- Testing
- Deployment preparation

---

## Files to Work On

### New Files to Create:
```
backend/
├── middleware/
│   ├── upload.js          # Cloudinary upload
│   ├── validation.js      # Joi validation
│   └── errorHandler.js    # Global error handler
├── utils/
│   ├── email.js           # Email service
│   ├── payment.js         # Paystack integration
│   └── analytics.js       # Analytics calculations
├── tests/
│   ├── auth.test.js
│   ├── foods.test.js
│   └── orders.test.js
└── config/
    ├── cloudinary.js
    └── swagger.js
```

### Existing Files to Complete:
- `routes/auth.js` - Add password hashing, token refresh
- `routes/foods.js` - Implement all endpoints fully
- `routes/orders.js` - Add order lifecycle management
- `routes/users.js` - Add analytics endpoints
- `server.js` - Add middleware, error handling, security

---

## How to Present This

**Tell your backend engineer:**

> "Hey! I've scaffolded the frontend and basic backend structure. Here's what we need you to handle on the backend side:
> 
> **Critical (Must have for demo):**
> 1. Set up MongoDB and connect it
> 2. Complete the authentication with JWT and password hashing
> 3. Implement all the API endpoints (they're scaffolded but need logic)
> 4. Add the analytics endpoints for the dashboard
> 5. Set up Cloudinary for image uploads
> 
> **Important (Would be great to have):**
> 6. Payment integration with Paystack
> 7. Email notifications
> 8. Security middleware (Helmet, rate limiting)
> 
> I've created a detailed task list in `BACKEND_TASKS.md` - check Priority 1 first!"

This gives them substantial, important work that's clearly their domain! 🎯
