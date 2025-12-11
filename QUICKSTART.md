# FoodRescue Lagos - Quick Start

## 🚀 Run Locally (Both Frontend & Backend)

### Terminal 1 - Backend
```bash
cd backend
npm install
npm run dev
```
Backend runs on: http://localhost:5000

### Terminal 2 - Frontend
```bash
cd frontend
npm install
npm start
```
Frontend runs on: http://localhost:3000

---

## 📦 What You Need

### For Local Development:
- Node.js (v14+)
- MongoDB (local or Atlas)

### For Deployment:
- GitHub account
- Render.com account (free)
- MongoDB Atlas account (free)

---

## 🔧 Environment Setup

### Backend `.env`
```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/foodrescue
JWT_SECRET=your_secret_here
JWT_EXPIRE=30d
```

### Frontend `.env`
```env
REACT_APP_API_URL=http://localhost:5000/api
```

---

## 🌐 Deploy to Cloud

See `DEPLOYMENT.md` for full deployment guide to Render.com

Quick steps:
1. Push to GitHub
2. Connect to Render
3. Add environment variables
4. Deploy!

---

## 📚 Documentation

- `README.md` - Project overview
- `DEPLOYMENT.md` - Deployment guide
- `INTEGRATION.md` - Frontend-Backend integration
- `IMAGE_UPLOAD_SETUP.md` - Cloudinary setup
- `backend/README.md` - Backend API docs
