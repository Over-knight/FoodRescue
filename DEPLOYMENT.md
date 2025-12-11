# Complete Deployment Guide - Frontend + Backend

## Overview

Your project structure:
```
FoodRescue/
├── frontend/    → Deploy to Vercel/Netlify
├── backend/     → Deploy to Render.com
└── (shared files)
```

---

## Part 1: Deploy Backend to Render.com

### Step 1: Prepare Backend
1. Make sure `backend/package.json` has:
   ```json
   {
     "scripts": {
       "start": "node src/server.js",
       "dev": "nodemon src/server.js"
     }
   }
   ```

### Step 2: Setup MongoDB Atlas (Free Database)
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create a free cluster (M0)
4. Create database user (username + password)
5. Whitelist all IPs: `0.0.0.0/0`
6. Get connection string:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/foodrescue?retryWrites=true&w=majority
   ```

### Step 3: Deploy to Render
1. Go to https://render.com
2. Sign up with GitHub
3. Click "New +" → "Web Service"
4. Connect your GitHub repo
5. Configure:
   - **Name**: `foodrescue-backend`
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free

6. Add Environment Variables:
   ```
   NODE_ENV=production
   PORT=5000
   MONGO_URI=your_mongodb_atlas_connection_string
   JWT_SECRET=your_random_secret_key_here
   JWT_EXPIRE=30d
   CLOUDINARY_CLOUD_NAME=your_cloudinary_name
   CLOUDINARY_API_KEY=your_cloudinary_key
   CLOUDINARY_API_SECRET=your_cloudinary_secret
   ```

7. Click "Create Web Service"
8. Wait for deployment (5-10 minutes)
9. Copy your backend URL: `https://foodrescue-backend.onrender.com`

---

## Part 2: Deploy Frontend to Vercel

### Step 1: Update Frontend Environment
1. Create `frontend/.env.production`:
   ```env
   REACT_APP_API_URL=https://foodrescue-backend.onrender.com/api
   ```

### Step 2: Deploy to Vercel
1. Go to https://vercel.com
2. Sign up with GitHub
3. Click "Add New" → "Project"
4. Import your GitHub repository
5. Configure:
   - **Framework Preset**: Create React App
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`

6. Add Environment Variables:
   ```
   REACT_APP_API_URL=https://foodrescue-backend.onrender.com/api
   ```

7. Click "Deploy"
8. Wait for deployment (2-3 minutes)
9. Get your frontend URL: `https://foodrescue.vercel.app`

---

## Part 3: Alternative - Deploy Frontend to Netlify

### Option B: Netlify (Instead of Vercel)
1. Go to https://netlify.com
2. Sign up with GitHub
3. Click "Add new site" → "Import an existing project"
4. Connect GitHub
5. Configure:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/build`

6. Add Environment Variables:
   ```
   REACT_APP_API_URL=https://foodrescue-backend.onrender.com/api
   ```

7. Deploy!

---

## Testing Your Deployment

### 1. Test Backend
```bash
# Health check
curl https://foodrescue-backend.onrender.com

# Should return: {"message":"FoodRescue API is running"}
```

### 2. Test Frontend
1. Visit your Vercel/Netlify URL
2. Try to signup/login
3. Check browser console (F12) for API calls
4. Verify no CORS errors

---

## Important Notes

### CORS Configuration
Your backend already has CORS enabled in `server.js`:
```javascript
app.use(cors());
```

### Free Tier Limitations
- **Render**: Backend sleeps after 15 min inactivity (wakes on request)
- **Vercel/Netlify**: Unlimited bandwidth for personal projects
- **MongoDB Atlas**: 512MB storage (plenty for demo)

### Custom Domain (Optional)
Both Vercel and Netlify allow free custom domains:
1. Buy domain (Namecheap, GoDaddy)
2. Add to Vercel/Netlify
3. Update DNS records

---

## Quick Deployment Checklist

- [ ] Push code to GitHub
- [ ] Create MongoDB Atlas cluster
- [ ] Deploy backend to Render
- [ ] Get backend URL
- [ ] Update frontend `.env.production`
- [ ] Deploy frontend to Vercel/Netlify
- [ ] Test signup/login
- [ ] Test food listing
- [ ] Test image upload (if Cloudinary configured)

---

## Troubleshooting

### Backend Issues
- **500 Error**: Check Render logs, verify MongoDB connection
- **CORS Error**: Ensure `cors()` is enabled in server.js
- **Env vars**: Double-check all environment variables in Render

### Frontend Issues
- **Can't connect to API**: Verify `REACT_APP_API_URL` is correct
- **Build fails**: Check for TypeScript errors
- **Blank page**: Check browser console for errors

### Database Issues
- **Connection timeout**: Whitelist all IPs (0.0.0.0/0) in MongoDB Atlas
- **Auth failed**: Verify username/password in connection string

---

## Cost Breakdown

| Service | Free Tier | Paid (if needed) |
|---------|-----------|------------------|
| Render | 750 hours/month | $7/month |
| Vercel | Unlimited | $20/month (pro) |
| Netlify | 100GB bandwidth | $19/month (pro) |
| MongoDB Atlas | 512MB storage | $9/month (M2) |
| Cloudinary | 25GB storage | $89/month (plus) |

**Total for demo: $0/month** ✅

---

## Next Steps After Deployment

1. Share your live URL with others
2. Monitor usage in dashboards
3. Add analytics (Google Analytics)
4. Setup custom domain
5. Add more features!
