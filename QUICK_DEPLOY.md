# ⚡ Quick Deploy Guide

Fastest way to deploy your app to Render.

---

## 🚀 One-Minute Deployment

### Step 1: Push to GitHub

```bash
cd "C:\Users\Bonth\Downloads\GRP PROJ"
git add .
git commit -m "Deploy to Render"
git push origin main
```

### Step 2: Deploy on Render

1. Go to: **https://dashboard.render.com**
2. Click **"New +"** → **"Blueprint"**
3. Connect GitHub → Select your repo
4. Click **"Apply"** → Done!

### Step 3: Add Environment Variables

**Backend Service** → Environment tab:
```
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=your-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYourKey\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your-email
FIREBASE_CLIENT_ID=your-client-id
TWILIO_ACCOUNT_SID=your-sid
TWILIO_AUTH_TOKEN=your-token
TWILIO_PHONE_NUMBER=your-number
```

**Frontend Service** → Environment tab:
```
VITE_API_URL=https://villagevault-backend.onrender.com
```

### Step 4: Redeploy

- Backend: Manual Deploy → Deploy latest commit
- Frontend: Manual Deploy → Deploy latest commit

### Step 5: Test

- Backend: `https://your-backend.onrender.com/api/health`
- Frontend: `https://your-frontend.onrender.com`

---

## ✅ Done!

Your app is live! 🎉

See `DEPLOYMENT_STEP_BY_STEP.md` for detailed guide.

