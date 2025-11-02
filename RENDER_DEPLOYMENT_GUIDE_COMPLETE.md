# 🚀 Complete Render Deployment Guide for VillageVault

This guide will help you deploy both **Frontend** and **Backend** to Render simultaneously.

## ✅ Yes, You Can Deploy Both at Once!

You can deploy both frontend and backend to Render in two ways:
1. **Using `render.yaml` (Infrastructure as Code)** - Deploy everything at once ⚡
2. **Manual Setup** - Deploy services one by one

---

## 📋 Method 1: Deploy Both Using `render.yaml` (Recommended)

This is the easiest way - deploy everything with a single click!

### Step 1: Prepare Your Repository

1. Make sure your code is pushed to GitHub
2. Ensure `render.yaml` is in the root directory
3. Commit all changes to `main` branch

### Step 2: Deploy to Render

1. **Go to Render Dashboard**: https://dashboard.render.com
2. Click **"New +"** → **"Blueprint"**
3. **Connect your GitHub repository**
4. Render will automatically detect `render.yaml`
5. Click **"Apply"** - This will create:
   - ✅ PostgreSQL Database
   - ✅ Backend Web Service
   - ✅ Frontend Web Service

### Step 3: Add Manual Environment Variables

After deployment, go to each service and add these manually:

#### Backend Service Environment Variables:
```
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=your-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYourKeyHere\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your-client-email
FIREBASE_CLIENT_ID=your-client-id
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=your-twilio-number
```

**Important**: 
- For `FIREBASE_PRIVATE_KEY`, replace actual newlines with `\n`
- Wrap the entire value in quotes

#### Frontend Service Environment Variables:
```
VITE_API_URL=https://villagevault-backend.onrender.com
```
(Replace with your actual backend URL after deployment)

### Step 4: Run Database Migrations

1. Go to **Backend Service** → **Shell** tab
2. Run:
   ```bash
   npx prisma migrate deploy
   ```

### Step 5: Update URLs

After both services are deployed:

1. **Copy Frontend URL** (e.g., `https://villagevault-frontend.onrender.com`)
2. Go to **Backend Service** → **Environment** → Update `FRONTEND_URL`
3. **Copy Backend URL** (e.g., `https://villagevault-backend.onrender.com`)
4. Go to **Frontend Service** → **Environment** → Update `VITE_API_URL`
5. **Redeploy both services** for changes to take effect

---

## 📋 Method 2: Manual Deployment (Step by Step)

If you prefer to set up services manually:

### Step 1: Create PostgreSQL Database

1. Click **"New +"** → **"PostgreSQL"**
2. Configure:
   - **Name**: `villagevault-db`
   - **Database**: `villagevault`
   - **User**: `villagevault_user`
   - **Region**: Singapore (or your preferred)
   - **Plan**: Free
3. Click **"Create Database"**
4. **Copy the Internal Database URL** (starts with `postgresql://`)

### Step 2: Create Backend Web Service

1. Click **"New +"** → **"Web Service"**
2. **Connect your GitHub repository**
3. Configure:
   - **Name**: `villagevault-backend`
   - **Region**: Same as database
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
   JWT_SECRET=<Generate using: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))">
   JWT_EXPIRES_IN=7d
   FRONTEND_URL=<We'll update this after frontend deploys>
   
   # Firebase (add these)
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_PRIVATE_KEY_ID=your-key-id
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYourKey\n-----END PRIVATE KEY-----\n"
   FIREBASE_CLIENT_EMAIL=your-client-email
   FIREBASE_CLIENT_ID=your-client-id
   
   # Twilio (add these)
   TWILIO_ACCOUNT_SID=your-twilio-sid
   TWILIO_AUTH_TOKEN=your-twilio-token
   TWILIO_PHONE_NUMBER=your-twilio-number
   ```

5. Click **"Create Web Service"**

6. **Run Migrations**:
   - Go to **Shell** tab
   - Run: `npx prisma migrate deploy`

### Step 3: Create Frontend Web Service

**Option A: Static Site (Recommended for React/Vite)**

1. Click **"New +"** → **"Static Site"**
2. **Connect your GitHub repository**
3. Configure:
   - **Name**: `villagevault-frontend`
   - **Region**: Same as backend
   - **Branch**: `main`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
   - **Instance Type**: Free

4. **Add Environment Variables**:
   ```
   VITE_API_URL=https://villagevault-backend.onrender.com
   ```
   (Update with your actual backend URL)

5. Click **"Create Static Site"**

**Option B: Web Service (If Static Site doesn't work)**

1. Click **"New +"** → **"Web Service"**
2. Configure same as above, but:
   - **Start Command**: `npx serve -s dist -l 3000`
   - Make sure to install `serve`: Add to `package.json` devDependencies:
     ```json
     "serve": "^14.2.1"
     ```

### Step 4: Link Services Together

After both are deployed:

1. **Copy Backend URL**: `https://villagevault-backend.onrender.com`
2. Go to **Frontend** → **Environment** → Update `VITE_API_URL`

3. **Copy Frontend URL**: `https://villagevault-frontend.onrender.com`
4. Go to **Backend** → **Environment** → Update `FRONTEND_URL`

5. **Redeploy both services**:
   - Backend: Click **"Manual Deploy"** → **"Deploy latest commit"**
   - Frontend: Click **"Manual Deploy"** → **"Deploy latest commit"**

---

## 🔧 Quick Setup Commands

### Generate JWT Secret
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Test Locally Before Deploying

**Backend**:
```bash
cd backend
npm install
npx prisma generate
npm start
```

**Frontend**:
```bash
cd frontend
npm install
npm run build
npm run preview
```

---

## ✅ Post-Deployment Checklist

- [ ] PostgreSQL database created and running
- [ ] Backend service deployed and running
- [ ] Database migrations run successfully
- [ ] Frontend service deployed and running
- [ ] `FRONTEND_URL` set in backend environment
- [ ] `VITE_API_URL` set in frontend environment
- [ ] All Firebase credentials added to backend
- [ ] All Twilio credentials added to backend
- [ ] Both services redeployed after URL updates
- [ ] Test login/registration works
- [ ] Test API endpoints work
- [ ] Test Socket.IO connections (real-time features)

---

## 🌐 Your Deployed URLs

After successful deployment:
- **Backend API**: `https://villagevault-backend.onrender.com`
- **Frontend App**: `https://villagevault-frontend.onrender.com`
- **Database**: Internal connection only (via `DATABASE_URL`)

---

## 🐛 Common Issues & Solutions

### Issue: Backend Build Fails
**Solution**: 
- Check `DATABASE_URL` is correct
- Ensure Prisma is installed: `npm install @prisma/client prisma`
- Run `npx prisma generate` in build command

### Issue: Frontend Can't Connect to Backend
**Solution**:
- Verify `VITE_API_URL` in frontend matches backend URL exactly
- Check CORS in backend allows frontend URL
- Ensure both URLs use `https://`

### Issue: Database Connection Fails
**Solution**:
- Use **Internal Database URL** (not public URL)
- Format: `postgresql://user:pass@hostname:5432/database`
- Ensure database and backend are in same region

### Issue: CORS Errors
**Solution**:
- Backend `FRONTEND_URL` must match frontend URL exactly
- Include `https://` protocol
- Redeploy backend after updating `FRONTEND_URL`

### Issue: 404 on Frontend Routes
**Solution**:
- For Static Site: Add redirect rule: `/* → /index.html`
- For Web Service: Ensure `startCommand` serves static files correctly

### Issue: Environment Variables Not Working
**Solution**:
- Variables starting with `VITE_` must be set in frontend
- Redeploy service after adding environment variables
- Check variable names match exactly (case-sensitive)

---

## 🔄 Auto-Deploy Setup

Render automatically deploys when you push to `main` branch.

**To disable auto-deploy**:
1. Go to service → **Settings**
2. Toggle **"Auto-Deploy"** off

**To deploy specific branch**:
1. Go to service → **Settings**
2. Change **"Branch"** to your desired branch

---

## 📝 Environment Variables Reference

### Backend Required Variables:
```
NODE_ENV=production
PORT=5000
DATABASE_URL=<From PostgreSQL service>
JWT_SECRET=<Generated secret>
JWT_EXPIRES_IN=7d
FRONTEND_URL=<Your frontend URL>
```

### Backend Optional Variables:
```
FIREBASE_PROJECT_ID=<Your Firebase Project ID>
FIREBASE_PRIVATE_KEY_ID=<Your Firebase Private Key ID>
FIREBASE_PRIVATE_KEY=<Your Firebase Private Key with \n>
FIREBASE_CLIENT_EMAIL=<Your Firebase Client Email>
FIREBASE_CLIENT_ID=<Your Firebase Client ID>
TWILIO_ACCOUNT_SID=<Your Twilio Account SID>
TWILIO_AUTH_TOKEN=<Your Twilio Auth Token>
TWILIO_PHONE_NUMBER=<Your Twilio Phone Number>
```

### Frontend Required Variables:
```
VITE_API_URL=<Your backend URL>
```

---

## 🎯 Deployment Flow Diagram

```
1. Push code to GitHub
        ↓
2. Render detects changes
        ↓
3. Builds both services
        ↓
4. Deploys Database → Backend → Frontend
        ↓
5. Update URLs in each service
        ↓
6. Redeploy to apply changes
        ↓
7. ✅ Everything working!
```

---

## 💡 Pro Tips

1. **Use Internal Database URL**: Always use the internal connection string for better performance
2. **Same Region**: Keep database, backend, and frontend in the same region
3. **Monitor Logs**: Check Render logs if something goes wrong
4. **Test After Deployment**: Always test your endpoints after deployment
5. **Environment Variables**: Double-check all variables are set correctly
6. **Database Migrations**: Always run migrations after first deployment

---

## 📚 Additional Resources

- [Render Documentation](https://render.com/docs)
- [Prisma Deployment](https://www.prisma.io/docs/guides/deployment)
- [Vite Production Build](https://vitejs.dev/guide/build.html)
- [Render Environment Variables](https://render.com/docs/environment-variables)

---

## 🆘 Need Help?

If you encounter issues:
1. Check Render service logs
2. Verify all environment variables
3. Ensure database is running
4. Check CORS configuration
5. Verify URLs are correct

Good luck with your deployment! 🚀

