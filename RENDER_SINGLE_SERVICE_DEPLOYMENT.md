# Render Single Service Deployment Guide

This guide helps you deploy both frontend and backend together as a single service on Render.

## 🚀 Quick Setup

### Step 1: Create PostgreSQL Database

1. In Render Dashboard, click **"New +"** → **"PostgreSQL"**
2. Configure:
   - **Name**: `villagevault-db`
   - **Database**: `villagevault`
   - **User**: `villagevault_user`
   - **Region**: Singapore (or your preferred region)
   - **Plan**: Free
3. Click **"Create Database"**
4. **Copy the Internal Database URL**

### Step 2: Create Web Service

1. In Render Dashboard, click **"New +"** → **"Web Service"**
2. Connect your GitHub repository: `Vijay-1807/villagevault`
3. Configure the service:

#### Basic Settings:
- **Name**: `villagevault`
- **Region**: Singapore (same as database)
- **Branch**: `main`
- **Root Directory**: *(Leave empty)*
- **Runtime**: Node
- **Instance Type**: Free

#### Build & Start Commands:

**Build Command:**
```bash
chmod +x build.sh && ./build.sh
```

**Or alternatively, use inline commands:**
```bash
npm install && cd frontend && npm install && npm run build && cd ../backend && npm install && npx prisma generate
```

**Start Command:**
```bash
cd backend && npm start
```

#### Environment Variables:

Add these environment variables:

```
# Server
NODE_ENV=production
PORT=5000

# Database
DATABASE_URL=<Internal Database URL from PostgreSQL service>

# JWT
JWT_SECRET=<Generate a strong random secret>
JWT_EXPIRES_IN=7d

# CORS - Set to your Render service URL after deployment
FRONTEND_URL=https://villagevault.onrender.com

# Firebase Configuration
FIREBASE_PROJECT_ID=villagevault-b9ac4
FIREBASE_PRIVATE_KEY_ID=<Your Firebase Private Key ID>
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQI...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=<Your Firebase Client Email>
FIREBASE_CLIENT_ID=<Your Firebase Client ID>

# Twilio Configuration
TWILIO_ACCOUNT_SID=<Your Twilio Account SID>
TWILIO_AUTH_TOKEN=<Your Twilio Auth Token>
TWILIO_PHONE_NUMBER=<Your Twilio Phone Number>
```

**Important Notes:**
- For `FIREBASE_PRIVATE_KEY`, replace actual newlines with `\n`
- After service is created, update `FRONTEND_URL` to your actual service URL
- Generate `JWT_SECRET` using: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`

### Step 3: Run Database Migrations

After the service is deployed:

1. Go to your service → **Shell** tab
2. Run:
   ```bash
   cd backend
   npx prisma migrate deploy
   ```

### Step 4: Update Environment Variables

1. After deployment, note your service URL (e.g., `villagevault.onrender.com`)
2. Go to **Environment** tab
3. Update `FRONTEND_URL` to: `https://villagevault.onrender.com`
4. Redeploy the service

## 📝 Render Configuration

### Using Render Dashboard:

**Settings Tab:**
- Name: `villagevault`
- Region: `Singapore`
- Branch: `main`
- Root Directory: *(empty)*
- Build Command: See above
- Start Command: `cd backend && npm start`

**Environment Tab:**
Add all environment variables listed above.

### Alternative: Using Inline Build Command

If `build.sh` doesn't work, use this in **Build Command**:

```bash
npm install && cd frontend && npm install && npm run build && cd ../backend && npm install && npx prisma generate
```

## 🔐 Environment Variables Details

### Generate JWT_SECRET
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Firebase Private Key Format
When pasting `FIREBASE_PRIVATE_KEY`:
- Replace all actual newlines with `\n`
- Keep quotes around entire value
- Example:
  ```
  FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"
  ```

## ✅ Post-Deployment Checklist

- [ ] PostgreSQL database created
- [ ] Web service deployed successfully
- [ ] Database migrations run (`npx prisma migrate deploy`)
- [ ] All environment variables set
- [ ] `FRONTEND_URL` updated to actual service URL
- [ ] Service is accessible via URL
- [ ] Frontend loads correctly
- [ ] API endpoints working (`/api/health` test)
- [ ] Test login/registration
- [ ] Socket.IO connections working (if applicable)

## 🐛 Troubleshooting

### Build Fails

**Issue**: `build.sh: Permission denied`
**Solution**: Make sure build command includes `chmod +x build.sh` or use inline commands

**Issue**: Frontend build fails
**Solution**: Check Node version (should be 18+), verify all dependencies in `frontend/package.json`

### Frontend Not Loading

**Issue**: 404 on routes
**Solution**: Ensure `NODE_ENV=production` is set and frontend dist folder exists

**Issue**: Blank page
**Solution**: Check browser console, verify `FRONTEND_URL` matches service URL

### Database Issues

**Issue**: Connection refused
**Solution**: Use Internal Database URL (not public), ensure same region

**Issue**: Prisma client not generated
**Solution**: Ensure `npx prisma generate` is in build command

### API Not Working

**Issue**: CORS errors
**Solution**: Verify `FRONTEND_URL` matches actual service URL exactly (with https://)

## 🔄 Deployment Flow

1. Push to `main` branch → Render auto-deploys
2. Build process:
   - Installs dependencies
   - Builds frontend to `frontend/dist`
   - Sets up backend with Prisma
3. Start process:
   - Backend server starts
   - Serves API at `/api/*`
   - Serves frontend at `/*` (non-API routes)
4. Access your app at: `https://villagevault.onrender.com`

## 📚 Additional Resources

- [Render Docs](https://render.com/docs)
- [Prisma Deployment](https://www.prisma.io/docs/guides/deployment)
- [Express Static Files](https://expressjs.com/en/starter/static-files.html)

