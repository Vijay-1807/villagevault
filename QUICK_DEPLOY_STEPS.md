# ⚡ Quick Deploy Steps to Render

## Yes, You Can Deploy Both Frontend & Backend at Once!

### 🚀 Method 1: One-Click Deploy (Using render.yaml)

**Fastest way - deploy everything in one go!**

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Go to Render Dashboard**
   - Visit: https://dashboard.render.com
   - Click **"New +"** → **"Blueprint"**

3. **Connect GitHub Repository**
   - Select your repository
   - Render will auto-detect `render.yaml`

4. **Click "Apply"**
   - This creates all services:
     - ✅ Database
     - ✅ Backend
     - ✅ Frontend

5. **Add Environment Variables** (in Render Dashboard)
   
   **Backend Service → Environment Tab:**
   ```
   FIREBASE_PROJECT_ID=your-firebase-project-id
   FIREBASE_PRIVATE_KEY_ID=your-key-id
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYourKeyHere\n-----END PRIVATE KEY-----\n"
   FIREBASE_CLIENT_EMAIL=your-client-email
   FIREBASE_CLIENT_ID=your-client-id
   TWILIO_ACCOUNT_SID=your-twilio-sid
   TWILIO_AUTH_TOKEN=your-twilio-token
   TWILIO_PHONE_NUMBER=your-twilio-number
   ```
   
   **Frontend Service → Environment Tab:**
   ```
   VITE_API_URL=https://villagevault-backend.onrender.com
   ```
   (Update with your actual backend URL after deployment)

6. **Run Database Migrations**
   - Go to Backend Service → **Shell** tab
   - Run: `npx prisma migrate deploy`

7. **Update URLs & Redeploy**
   - Copy frontend URL → Add to backend `FRONTEND_URL`
   - Copy backend URL → Add to frontend `VITE_API_URL`
   - Redeploy both services

---

### 🛠️ Method 2: Manual Step-by-Step Deploy

**More control over each service**

#### Step 1: Create Database
1. **New +** → **PostgreSQL**
2. Name: `villagevault-db`
3. Plan: Free
4. **Create Database**

#### Step 2: Create Backend
1. **New +** → **Web Service**
2. Connect GitHub repo
3. Settings:
   - Name: `villagevault-backend`
   - Root Directory: `backend`
   - Build: `npm install && npx prisma generate`
   - Start: `npm start`
4. Add Environment Variables:
   ```
   NODE_ENV=production
   PORT=5000
   DATABASE_URL=<From Database Service>
   JWT_SECRET=<Generate using: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))">
   JWT_EXPIRES_IN=7d
   FRONTEND_URL=<Update after frontend deploys>
   + Firebase & Twilio credentials
   ```
5. **Create Web Service**

#### Step 3: Create Frontend
1. **New +** → **Web Service** (or Static Site)
2. Connect same GitHub repo
3. Settings:
   - Name: `villagevault-frontend`
   - Root Directory: `frontend`
   - Build: `npm install && npm run build`
   - Start: `npx serve -s dist -l $PORT`
4. Add Environment Variable:
   ```
   VITE_API_URL=https://villagevault-backend.onrender.com
   ```
5. **Create Web Service**

#### Step 4: Link Services
1. Update `FRONTEND_URL` in backend
2. Update `VITE_API_URL` in frontend
3. Redeploy both

---

## 📝 Before You Deploy Checklist

- [ ] Code pushed to GitHub
- [ ] `render.yaml` is in root directory
- [ ] All environment variables ready
- [ ] Database credentials ready
- [ ] Firebase credentials ready
- [ ] Twilio credentials ready

---

## 🔗 After Deployment

**Your URLs will be:**
- Backend: `https://villagevault-backend.onrender.com`
- Frontend: `https://villagevault-frontend.onrender.com`

**Update these:**
- Frontend `VITE_API_URL` → Backend URL
- Backend `FRONTEND_URL` → Frontend URL

---

## 🆘 Need Help?

See full guide: `RENDER_DEPLOYMENT_GUIDE_COMPLETE.md`

**Common Issues:**
- Build fails? Check logs in Render Dashboard
- CORS errors? Update `FRONTEND_URL` in backend
- Database connection? Use Internal Database URL
- Environment variables not working? Redeploy service

---

## ✨ Quick Commands

**Generate JWT Secret:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

**Test locally first:**
```bash
# Backend
cd backend && npm install && npm start

# Frontend (new terminal)
cd frontend && npm install && npm run build && npm run preview
```

Good luck! 🚀

