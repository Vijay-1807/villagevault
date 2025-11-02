# 🚀 Complete Deployment Guide - Push & Deploy to Render

Step-by-step guide to deploy both Frontend and Backend to Render at the same time.

---

## 📋 Prerequisites Checklist

Before starting, make sure you have:

- [ ] GitHub account
- [ ] Code pushed to GitHub repository
- [ ] Render account (free tier works)
- [ ] Firebase project credentials ready
- [ ] Twilio credentials ready (if using SMS)

---

## 📝 Step 1: Prepare Your Code

### 1.1 Check Your Files

Make sure these files exist in your project:
- ✅ `render.yaml` (in root directory)
- ✅ `backend/` folder with your backend code
- ✅ `frontend/` folder with your frontend code

### 1.2 Review render.yaml

Your `render.yaml` should be configured for:
- Backend service
- Frontend service
- Firebase Firestore (no PostgreSQL needed)

---

## 📤 Step 2: Push Code to GitHub

### 2.1 Check Git Status

Open terminal in your project folder:

```bash
cd "C:\Users\Bonth\Downloads\GRP PROJ"
git status
```

### 2.2 Add All Files

```bash
git add .
```

### 2.3 Commit Changes

```bash
git commit -m "Ready for Render deployment - Frontend & Backend"
```

### 2.4 Push to GitHub

```bash
git push origin main
```

**Note**: If you haven't set up remote yet:
```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

---

## 🚀 Step 3: Deploy to Render (One-Click Method)

### 3.1 Go to Render Dashboard

1. Visit: **https://dashboard.render.com**
2. Sign in or create a free account

### 3.2 Create Blueprint (Deploy Both at Once)

1. Click **"New +"** button (top right)
2. Select **"Blueprint"** from dropdown

### 3.3 Connect GitHub Repository

1. Click **"Connect GitHub"** or **"Connect GitLab"**
2. Authorize Render to access your repositories
3. Select your repository from the list
4. Render will automatically detect `render.yaml`

### 3.4 Review Services

Render will show you the services it will create:
- ✅ **Backend Web Service** (`villagevault-backend`)
- ✅ **Frontend Web Service** (`villagevault-frontend`)

**Note**: No PostgreSQL service (using Firebase Firestore)

### 3.5 Apply Blueprint

1. Review the configuration
2. Click **"Apply"** button
3. Render starts deploying both services!

### 3.6 Monitor Deployment

You'll see:
- ⏳ **Building** - Installing dependencies
- ⏳ **Deploying** - Starting services
- ✅ **Live** - Services are running

**Expected Time**: 5-10 minutes for both services

---

## 🔐 Step 4: Add Environment Variables

After services are created, add your credentials:

### 4.1 Backend Service Environment Variables

1. Go to **Backend Service** → Click on `villagevault-backend`
2. Go to **Environment** tab
3. Click **"Add Environment Variable"** for each:

#### Required Variables:

```
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY_ID=your-firebase-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYourActualKeyHere\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your-firebase-client-email@project-id.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your-firebase-client-id
```

**Important for FIREBASE_PRIVATE_KEY**:
- Replace actual newlines (`\n`) with the string `\n`
- Keep quotes around entire value
- Example format:
  ```
  FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"
  ```

#### Twilio Variables (if using SMS):

```
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+1234567890
```

### 4.2 Frontend Service Environment Variables

1. Go to **Frontend Service** → Click on `villagevault-frontend`
2. Go to **Environment** tab
3. Wait for backend to deploy first, then add:

```
VITE_API_URL=https://villagevault-backend.onrender.com
```

**Note**: Replace `villagevault-backend.onrender.com` with your actual backend URL

### 4.3 Redeploy Services

After adding environment variables:

1. **Backend Service**:
   - Click **"Manual Deploy"** → **"Deploy latest commit"**
   - Wait for deployment to complete

2. **Frontend Service**:
   - Click **"Manual Deploy"** → **"Deploy latest commit"**
   - Wait for deployment to complete

---

## 🔗 Step 5: Link Services Together

### 5.1 Get Your URLs

After deployment completes:

1. **Backend URL**: 
   - Go to Backend Service → Copy URL
   - Example: `https://villagevault-backend.onrender.com`

2. **Frontend URL**: 
   - Go to Frontend Service → Copy URL
   - Example: `https://villagevault-frontend.onrender.com`

### 5.2 Update URLs

1. **Update Frontend Environment**:
   - Frontend Service → Environment tab
   - Update `VITE_API_URL` with backend URL
   - Redeploy frontend

2. **Update Backend Environment**:
   - Backend Service → Environment tab
   - Update `FRONTEND_URL` with frontend URL (should auto-link, but verify)
   - Redeploy backend

---

## ✅ Step 6: Verify Deployment

### 6.1 Test Backend

1. Visit your backend URL:
   ```
   https://villagevault-backend.onrender.com/api/health
   ```
2. Should return:
   ```json
   {
     "status": "OK",
     "timestamp": "...",
     "service": "VillageVault API"
   }
   ```

### 6.2 Test Frontend

1. Visit your frontend URL:
   ```
   https://villagevault-frontend.onrender.com
   ```
2. Should load your React app

### 6.3 Test Login/Registration

1. Try registering a new user
2. Try logging in
3. Check if API calls work

---

## 🔄 Step 7: Future Updates

### 7.1 Auto-Deploy Setup (Already Enabled)

Render automatically deploys when you push to `main` branch:

```bash
# Make changes to your code
git add .
git commit -m "Update feature"
git push origin main
```

Render will automatically:
- Detect the push
- Build both services
- Deploy updates

### 7.2 Manual Deploy

To manually trigger deployment:

1. Go to service in Render Dashboard
2. Click **"Manual Deploy"**
3. Select **"Deploy latest commit"**

---

## 🐛 Troubleshooting

### Problem: Build Fails

**Solution**:
1. Check build logs in Render Dashboard
2. Look for error messages
3. Common issues:
   - Missing dependencies in `package.json`
   - Node version mismatch
   - Environment variables missing

### Problem: Frontend Can't Connect to Backend

**Solution**:
1. Verify `VITE_API_URL` in frontend matches backend URL
2. Check CORS in backend (verify `FRONTEND_URL` matches frontend URL)
3. Ensure both URLs use `https://`
4. Redeploy both services after updating URLs

### Problem: Firebase Connection Fails

**Solution**:
1. Check `FIREBASE_PRIVATE_KEY` format (use `\n` for newlines)
2. Verify all Firebase credentials are correct
3. Check Firebase project is active
4. Review backend logs for specific errors

### Problem: Services Not Starting

**Solution**:
1. Check service logs in Render Dashboard
2. Look for startup errors
3. Verify all environment variables are set
4. Check Node version compatibility

### Problem: Environment Variables Not Working

**Solution**:
1. Variables must start with `VITE_` for frontend
2. Redeploy service after adding variables
3. Check variable names match exactly (case-sensitive)
4. Verify no extra spaces in values

---

## 📚 Quick Reference Commands

### Git Commands

```bash
# Check status
git status

# Add all files
git add .

# Commit changes
git commit -m "Your message"

# Push to GitHub
git push origin main

# View recent commits
git log --oneline

# Pull latest changes
git pull origin main
```

### Generate JWT Secret (if needed)

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## 🎯 Deployment Checklist

Use this checklist to ensure everything is ready:

- [ ] Code pushed to GitHub
- [ ] `render.yaml` is in root directory
- [ ] Blueprint created in Render
- [ ] Both services deployed successfully
- [ ] Firebase credentials added to backend
- [ ] Twilio credentials added to backend (if using)
- [ ] `VITE_API_URL` added to frontend
- [ ] Backend URL working (`/api/health`)
- [ ] Frontend URL loading
- [ ] Login/Registration working
- [ ] API calls working

---

## 🌐 Your Deployed URLs

After successful deployment, you'll have:

- **Backend API**: `https://villagevault-backend.onrender.com`
- **Frontend App**: `https://villagevault-frontend.onrender.com`

**Save these URLs** - you'll need them!

---

## 💡 Pro Tips

1. **Monitor Logs**: Check Render logs regularly for errors
2. **Test Locally First**: Always test changes locally before deploying
3. **Environment Variables**: Keep a backup of all environment variables
4. **Backup Credentials**: Store Firebase/Twilio credentials securely
5. **Use Git Tags**: Tag important releases in Git
6. **Monitor Costs**: Free tier is limited - monitor usage

---

## 📞 Need Help?

If you encounter issues:

1. **Check Render Logs**: Service → Logs tab
2. **Check Build Logs**: Service → Build Logs tab
3. **Review Error Messages**: Look for specific error messages
4. **Verify Configuration**: Double-check `render.yaml` syntax
5. **Test Locally**: Always test changes locally first

---

## 🎉 Congratulations!

You've successfully deployed both Frontend and Backend to Render!

Your application is now live and accessible to users.

---

**Next Steps**:
- Test all features
- Monitor performance
- Set up custom domains (optional)
- Configure backups (recommended for production)

Good luck! 🚀

