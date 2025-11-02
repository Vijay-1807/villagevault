# Quick Render Deployment - Single Service

## 🎯 Fill These Fields in Render Dashboard:

### Basic Settings:
- **Name**: `villagevault`
- **Region**: `Singapore`
- **Branch**: `main`
- **Root Directory**: *(Leave empty - deploy from root)*
- **Build Command**: 
  ```bash
  npm install && cd frontend && npm install && npm run build && cd ../backend && npm install && npx prisma generate
  ```
- **Start Command**: 
  ```bash
  cd backend && npm start
  ```
- **Instance Type**: Free

### Environment Variables (Add these in Environment tab):

```
NODE_ENV=production
PORT=5000
DATABASE_URL=<From your PostgreSQL service - Internal URL>
JWT_SECRET=<Generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))">
JWT_EXPIRES_IN=7d
FRONTEND_URL=<Update after deployment with your service URL>

FIREBASE_PROJECT_ID=villagevault-b9ac4
FIREBASE_PRIVATE_KEY_ID=<Your Firebase Private Key ID>
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQI...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=<Your Firebase Client Email>
FIREBASE_CLIENT_ID=<Your Firebase Client ID>

TWILIO_ACCOUNT_SID=<Your Twilio Account SID>
TWILIO_AUTH_TOKEN=<Your Twilio Auth Token>
TWILIO_PHONE_NUMBER=<Your Twilio Phone Number>
```

## 📝 Steps:

1. **Create PostgreSQL Database first**
   - Name: `villagevault-db`
   - Copy Internal Database URL

2. **Create Web Service**
   - Use settings above
   - Add all environment variables

3. **After first deployment:**
   - Go to Shell tab
   - Run: `cd backend && npx prisma migrate deploy`
   - Update `FRONTEND_URL` with your actual service URL (e.g., `https://villagevault.onrender.com`)
   - Redeploy

4. **Done!** Access your app at: `https://villagevault.onrender.com`

## ⚠️ Important Notes:

- **FIREBASE_PRIVATE_KEY**: Replace all newlines with `\n` and wrap in quotes
- **DATABASE_URL**: Use Internal Database URL (not public URL)
- **FRONTEND_URL**: Update after first deployment with your actual service URL
- Make sure `NODE_ENV=production` is set for frontend serving to work

## 🐛 If Build Fails:

Try this alternative build command:
```bash
chmod +x build.sh && ./build.sh
```

Or break it down:
```bash
npm install
cd frontend && npm install && npm run build
cd ../backend && npm install && npx prisma generate
```

