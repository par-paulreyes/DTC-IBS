# Complete Vercel Deployment Setup

## Frontend Deployment (Vercel)

### 1. Frontend Configuration ✅
The frontend is already configured for Vercel deployment with:
- ✅ `vercel.json` configuration file
- ✅ Next.js framework detection
- ✅ Environment variable support (`NEXT_PUBLIC_API_URL`)
- ✅ Build scripts configured

### 2. Deploy Frontend to Vercel

1. **Push your code to GitHub/GitLab**
   ```bash
   git add .
   git commit -m "Setup for Vercel deployment"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign in and click "New Project"
   - Import your Git repository
   - Set the **Root Directory** to `frontend`

3. **Configure Environment Variables**
   In Vercel project settings, add:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-domain.com
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait for build completion
   - Your frontend will be live at `https://your-app.vercel.app`

## Backend Deployment Options

### Option 1: Deploy Backend to Vercel (Recommended)

1. **Create API Routes**
   Create `frontend/src/app/api/` directory and move backend logic there:
   ```bash
   mkdir -p frontend/src/app/api
   ```

2. **Configure Vercel for Full-Stack**
   Update `frontend/vercel.json`:
   ```json
   {
     "buildCommand": "npm run build",
     "outputDirectory": ".next",
     "framework": "nextjs",
     "installCommand": "npm install",
     "devCommand": "npm run dev",
     "functions": {
       "app/api/**/*.js": {
         "runtime": "nodejs18.x"
       }
     }
   }
   ```

### Option 2: Deploy Backend Separately

Deploy your backend to:
- **Railway**: Easy Node.js deployment
- **Render**: Free tier available
- **Heroku**: Traditional choice
- **DigitalOcean App Platform**: Scalable option

## Environment Variables Setup

### Frontend (Vercel)
```
NEXT_PUBLIC_API_URL=https://your-backend-domain.com
```

### Backend (if deployed separately)
```
DATABASE_URL=your_database_connection_string
JWT_SECRET=your_jwt_secret
EMAIL_SERVICE_API_KEY=your_email_service_key
```

## CORS Configuration

The backend already has CORS enabled. If deploying separately, ensure your backend allows requests from your Vercel domain:

```javascript
// In backend/app.js (already configured)
app.use(cors({
  origin: ['https://your-app.vercel.app', 'http://localhost:3000'],
  credentials: true
}));
```

## Database Setup

### Option 1: Use Vercel Postgres
1. Add Vercel Postgres to your project
2. Update environment variables with the provided connection string

### Option 2: External Database
- **PlanetScale**: MySQL-compatible
- **Supabase**: PostgreSQL with real-time features
- **MongoDB Atlas**: NoSQL option

## Deployment Checklist

### Frontend ✅
- [x] `vercel.json` configured
- [x] Environment variables documented
- [x] Build scripts ready
- [x] API calls use environment variables

### Backend
- [ ] Choose deployment platform
- [ ] Configure database connection
- [ ] Set up environment variables
- [ ] Configure CORS for Vercel domain
- [ ] Test API endpoints

### Database
- [ ] Choose database provider
- [ ] Set up connection string
- [ ] Run migrations/setup scripts
- [ ] Test connectivity

## Testing Deployment

1. **Test Frontend**
   - Verify all pages load
   - Test authentication flow
   - Check API connections

2. **Test Backend**
   - Verify all API endpoints work
   - Test database connections
   - Check CORS configuration

3. **Test Integration**
   - Full user registration/login flow
   - Item borrowing process
   - Admin functionality

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check Node.js version compatibility
   - Verify all dependencies are installed
   - Review build logs for errors

2. **API Connection Issues**
   - Verify `NEXT_PUBLIC_API_URL` is correct
   - Check CORS configuration
   - Ensure backend is accessible

3. **Environment Variables**
   - Variables must be set in Vercel dashboard
   - Redeploy after changing variables
   - Use `NEXT_PUBLIC_` prefix for client-side access

## Next Steps

1. Deploy frontend to Vercel
2. Choose and deploy backend platform
3. Configure database
4. Set up environment variables
5. Test complete application
6. Configure custom domain (optional)

For detailed frontend deployment instructions, see `frontend/DEPLOYMENT.md`. 