# Vercel Deployment Guide

## Prerequisites
- A Vercel account
- Your backend API deployed and accessible
- Git repository with your frontend code

## Deployment Steps

### 1. Connect to Vercel
1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your Git repository
4. Select the `frontend` directory as the root directory

### 2. Configure Environment Variables
In your Vercel project settings, add the following environment variable:

```
NEXT_PUBLIC_API_URL=https://your-backend-domain.com
```

Replace `https://your-backend-domain.com` with your actual backend API URL.

### 3. Build Settings
Vercel will automatically detect this is a Next.js project and use the following settings:
- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

### 4. Deploy
1. Click "Deploy" in Vercel
2. Wait for the build to complete
3. Your app will be available at the provided Vercel URL

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `https://your-backend-api.com` |

## Important Notes

- Make sure your backend API is deployed and accessible from the internet
- The backend should have CORS configured to allow requests from your Vercel domain
- All API calls in the frontend use `NEXT_PUBLIC_API_URL` environment variable
- The `NEXT_PUBLIC_` prefix makes the variable available in the browser

## Troubleshooting

### Build Errors
- Ensure all dependencies are properly listed in `package.json`
- Check that the Node.js version is compatible (Vercel uses Node.js 18+ by default)

### API Connection Issues
- Verify the `NEXT_PUBLIC_API_URL` is correct
- Check that your backend API is running and accessible
- Ensure CORS is properly configured on your backend

### Environment Variables
- Environment variables must be set in Vercel project settings
- Variables with `NEXT_PUBLIC_` prefix are exposed to the browser
- Redeploy after changing environment variables 