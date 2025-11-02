# Render Deployment Guide for VillageVault

This guide will help you deploy VillageVault on Render with separate services for backend, frontend, and database.

## 📋 Prerequisites

1. GitHub repository connected to Render
2. Firebase project credentials
3. Twilio account credentials (for SMS)
4. Render account (free tier works)

## 🚀 Deployment Steps

### Step 1: Create PostgreSQL Database

1. In Render Dashboard, click **"New +"** → **"PostgreSQL"**
2. Configure:
   - **Name**: `villagevault-db`
   - **Database**: `villagevault`
   - **User**: `villagevault_user`
   - **Region**: Singapore (or your preferred region)
   - **Plan**: Free
3. Click **"Create Database"**
4. **Copy the Internal Database URL** (you'll need this for backend)

### Step 2: Create Backend Web Service

1. In Render Dashboard, click **"New +"** → **"Web Service"**
2. Connect your GitHub repository (`Vijay-1807/villagevault`)
3. Configure:
   - **Name**: `villagevault-backend`
   - **Region**: Singapore (same as database)
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: Node
   - **Build Command**: `npm install && npx prisma generate`
   - **Start Command**: `npm start`
   - **Instance Type**: Free

4. **Add Environment Variables**:
   ```
   NODE_ENV=production
   PORT=5000
   DATABASE_URL=<Internal Database URL from Step 1>
   JWT_SECRET=<Generate a strong random secret>
   JWT_EXPIRES_IN=7d
   FRONTEND_URL=<Will be added after frontend deploys>
   
   # Firebase Configuration
   FIREBASE_PROJECT_ID=villagevault-b9ac4
   FIREBASE_PRIVATE_KEY_ID=<Your Firebase Private Key ID>
   FIREBASE_PRIVATE_KEY=<Your Firebase Private Key (with \n for newlines)>
   FIREBASE_CLIENT_EMAIL=<Your Firebase Client Email>
   FIREBASE_CLIENT_ID=<Your Firebase Client ID>
   
   # Twilio Configuration
   TWILIO_ACCOUNT_SID=<Your Twilio Account SID>
   TWILIO_AUTH_TOKEN=<Your Twilio Auth Token>
   TWILIO_PHONE_NUMBER=<Your Twilio Phone Number>
   ```

   **Important Notes**:
   - For `FIREBASE_PRIVATE_KEY`, replace actual newlines with `\n` (e.g., `"-----BEGIN PRIVATE KEY-----\nMIIEvQI...\n-----END PRIVATE KEY-----\n"`)
   - `FRONTEND_URL` - Leave empty for now, add after frontend service is created

5. Click **"Create Web Service"**

6. **Run Database Migrations**:
   - Once the service is running, go to the backend service
   - Click on **"Shell"** tab
   - Run:
     ```bash
     npx prisma migrate deploy
     ```

### Step 3: Update Backend FRONTEND_URL

1. After backend is deployed, note its URL (e.g., `villagevault-backend.onrender.com`)
2. Go to backend service → **Environment** tab
3. Update `FRONTEND_URL` to your frontend service URL (we'll create this next)
4. For now, you can set it to a placeholder and update after frontend deploys

### Step 4: Create Frontend Web Service

1. In Render Dashboard, click **"New +"** → **"Static Site"** (or **"Web Service"** with Static Site)
2. Connect your GitHub repository
3. Configure:
   - **Name**: `villagevault-frontend`
   - **Region**: Singapore (same as backend)
   - **Branch**: `main`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
   - **Instance Type**: Free

4. **Add Environment Variables**:
   ```
   VITE_API_URL=https://villagevault-backend.onrender.com
   ```
   (Replace with your actual backend URL)

5. Click **"Create Static Site"**

### Step 5: Update CORS and URLs

1. After frontend is deployed, copy its URL (e.g., `villagevault-frontend.onrender.com`)
2. Go to backend service → **Environment** tab
3. Update `FRONTEND_URL` to: `https://villagevault-frontend.onrender.com`
4. **Redeploy the backend** for CORS changes to take effect

## 🔧 Manual Configuration (Alternative)

If you prefer not to use the `render.yaml` blueprint:

### Backend Service Configuration

**Settings**:
- Root Directory: `backend`
- Build Command: `npm install && npx prisma generate`
- Start Command: `npm start`

**Environment Variables**:
```
NODE_ENV=production
PORT=5000
DATABASE_URL=<From PostgreSQL service>
JWT_SECRET=<Generate strong secret>
JWT_EXPIRES_IN=7d
FRONTEND_URL=<Your frontend URL>
FIREBASE_PROJECT_ID=...
FIREBASE_PRIVATE_KEY_ID=...
FIREBASE_PRIVATE_KEY=...
FIREBASE_CLIENT_EMAIL=...
FIREBASE_CLIENT_ID=...
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=...
```

### Frontend Service Configuration

**Settings**:
- Root Directory: `frontend`
- Build Command: `npm install && npm run build`
- Publish Directory: `dist`

**Environment Variables**:
```
VITE_API_URL=https://your-backend-url.onrender.com
```

## 🔐 Environment Variables Setup

### Generate JWT_SECRET
Use this command to generate a secure JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Firebase Private Key Format
When adding `FIREBASE_PRIVATE_KEY` to Render:
- Replace actual newlines with `\n`
- Keep the quotes around the entire value
- Example:
  ```
  FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQ...\n-----END PRIVATE KEY-----\n"
  ```

## 📝 Database Migration

After deployment, run migrations:

1. Go to backend service → **Shell** tab
2. Run:
   ```bash
   npx prisma migrate deploy
   ```

Or set up as a one-off job:
- **Type**: Shell
- **Command**: `cd backend && npx prisma migrate deploy`
- **Environment**: Same as backend service

## ✅ Post-Deployment Checklist

- [ ] PostgreSQL database created and connected
- [ ] Backend service deployed and running
- [ ] Database migrations run successfully
- [ ] Frontend service deployed and running
- [ ] `FRONTEND_URL` updated in backend environment
- [ ] `VITE_API_URL` updated in frontend environment
- [ ] CORS configured correctly
- [ ] All environment variables set
- [ ] Test login/registration
- [ ] Test API endpoints
- [ ] Verify Socket.IO connections (if using real-time features)

## 🐛 Troubleshooting

### Backend Issues

**Build fails with Prisma errors**:
- Ensure `npx prisma generate` is in build command
- Check `DATABASE_URL` is correct

**Database connection fails**:
- Use Internal Database URL (not public URL)
- Ensure database is in same region as backend

**CORS errors**:
- Verify `FRONTEND_URL` in backend matches frontend URL exactly
- Include `https://` protocol

### Frontend Issues

**Build fails**:
- Check Node version (should be 18+)
- Verify all dependencies in `package.json`

**API calls fail**:
- Verify `VITE_API_URL` matches backend URL
- Check CORS configuration in backend
- Ensure backend is running

**404 errors on routes**:
- Add redirect rules in Render static site settings:
  ```
  Rewrite rule: /* → /index.html
  ```

## 🔄 Continuous Deployment

Render automatically deploys when you push to the `main` branch. To disable:
1. Go to service → **Settings**
2. Disable **"Auto-Deploy"**

## 📚 Additional Resources

- [Render Documentation](https://render.com/docs)
- [Prisma Deployment Guide](https://www.prisma.io/docs/guides/deployment)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)

## 🎯 Quick Reference URLs

After deployment, you'll have:
- Backend API: `https://villagevault-backend.onrender.com`
- Frontend App: `https://villagevault-frontend.onrender.com`
- Database: Internal connection only

Update your frontend's `VITE_API_URL` to point to your backend URL!

