# Image Upload Setup Guide

## Cloudinary Setup

1. **Create a Cloudinary Account**
   - Go to https://cloudinary.com/
   - Sign up for a free account
   - Get your credentials from the dashboard

2. **Install Dependencies**
   ```bash
   cd backend
   npm install cloudinary multer multer-storage-cloudinary
   ```

3. **Update `.env` file**
   ```env
   CLOUDINARY_CLOUD_NAME=your_cloud_name_here
   CLOUDINARY_API_KEY=your_api_key_here
   CLOUDINARY_API_SECRET=your_api_secret_here
   ```

## How It Works

### Backend
- **Multer** handles file uploads from the frontend
- **Cloudinary** stores images in the cloud
- Images are automatically optimized and resized
- The API returns the Cloudinary URL

### Frontend
- Restaurant uploads image via file input
- Image is sent as `FormData` to the backend
- Preview is shown using FileReader (local)
- After submission, Cloudinary URL is stored in database

## Testing

1. Start backend: `cd backend && npm run dev`
2. Start frontend: `cd frontend && npm start`
3. Login as Restaurant (demo or real account)
4. Go to Dashboard
5. Fill food form and upload an image
6. Submit - image will be uploaded to Cloudinary

## Alternative (Without Cloudinary)

If you don't want to use Cloudinary for the demo:
- The current implementation stores images as base64
- This works fine for demo/testing
- For production, always use cloud storage (Cloudinary, AWS S3, etc.)
