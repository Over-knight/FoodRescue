# Deploy Both Frontend & Backend to Vercel

## Why Vercel for Both?
- ✅ Faster than Render (no cold starts)
- ✅ Deploy both from same repo
- ✅ Automatic HTTPS
- ✅ Edge network (fast globally)
- ✅ Free tier is generous

---

## Step 1: Prepare Backend for Vercel

### Create `vercel.json` in backend folder

Create `backend/vercel.json`:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "src/server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "src/server.js"
    }
  ]
}
```

### Update `backend/src/server.js`

Make sure it exports the app:
```javascript
// At the end of server.js, change from:
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// To:
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
```

---

## Step 2: Deploy Backend to Vercel

1. Go to https://vercel.com
2. Sign up with GitHub
3. Click "Add New" → "Project"
4. Import your repository
5. Configure **Backend**:
   - **Project Name**: `foodrescue-backend`
   - **Framework Preset**: Other
   - **Root Directory**: `backend`
   - **Build Command**: (leave empty)
   - **Output Directory**: (leave empty)

6. Add Environment Variables:
   ```
   NODE_ENV=production
   MONGO_URI=your_mongodb_atlas_uri
   JWT_SECRET=your_secret_key
   JWT_EXPIRE=30d
   CLOUDINARY_CLOUD_NAME=your_name
   CLOUDINARY_API_KEY=your_key
   CLOUDINARY_API_SECRET=your_secret
   ```

7. Click "Deploy"
8. Copy backend URL: `https://foodrescue-backend.vercel.app`

---

## Step 3: Deploy Frontend to Vercel

1. In Vercel dashboard, click "Add New" → "Project"
2. Import same repository again
3. Configure **Frontend**:
   - **Project Name**: `foodrescue-frontend`
   - **Framework Preset**: Create React App
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`

4. Add Environment Variables:
   ```
   REACT_APP_API_URL=https://foodrescue-backend.vercel.app/api
   ```

5. Click "Deploy"
6. Get frontend URL: `https://foodrescue-frontend.vercel.app`

---

## Step 4: Setup MongoDB Atlas

1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create free cluster (M0)
4. Create database user
5. Whitelist all IPs: `0.0.0.0/0`
6. Get connection string
7. Add to backend environment variables in Vercel

---

## Testing

### Test Backend
```bash
curl https://foodrescue-backend.vercel.app
# Should return: {"message":"FoodRescue API is running"}
```

### Test Frontend
1. Visit `https://foodrescue-frontend.vercel.app`
2. Try signup/login
3. Check browser console for API calls

---

## Important: CORS Configuration

Your backend already has CORS enabled, but make sure it's configured properly in `server.js`:

```javascript
const cors = require('cors');

// Allow all origins (for development)
app.use(cors());

// OR for production, allow only your frontend:
app.use(cors({
  origin: 'https://foodrescue-frontend.vercel.app',
  credentials: true
}));
```

---

## Automatic Deployments

Once set up, every push to GitHub will:
- Auto-deploy backend if `backend/` changes
- Auto-deploy frontend if `frontend/` changes

---

## Custom Domains (Optional)

Both deployments can have custom domains:
1. Buy domain (Namecheap, GoDaddy)
2. In Vercel, go to project → Settings → Domains
3. Add your domain
4. Update DNS records

Example:
- Backend: `api.foodrescue.com`
- Frontend: `foodrescue.com`

---

## Troubleshooting

### Backend 500 Error
- Check Vercel logs
- Verify MongoDB connection string
- Check environment variables

### Frontend Can't Connect
- Verify `REACT_APP_API_URL` is correct
- Check CORS configuration
- Check browser console

### Serverless Function Timeout
- Vercel has 10s timeout on free tier
- Optimize slow database queries
- Add indexes to MongoDB

---

## Vercel vs Render Comparison

| Feature | Vercel | Render |
|---------|--------|--------|
| Cold Start | None | 15-30s |
| Deploy Speed | 30s | 5-10min |
| Global CDN | Yes | Limited |
| Free Tier | 100GB bandwidth | 750 hours |
| Best For | Full-stack apps | Long-running services |

**Winner for FoodRescue: Vercel** ✅

---

## Next Steps

1. ✅ Deploy backend to Vercel
2. ✅ Deploy frontend to Vercel  
3. ✅ Setup MongoDB Atlas
4. ✅ Test the app
5. 🎉 Share your live URL!
