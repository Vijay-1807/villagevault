# 🔄 Infermedica API - Platform vs Engine API Guide

## Current Implementation

**Status**: Using **Engine API (v3)**  
**Base URL**: `https://api.infermedica.com/v3`

## API Comparison

### Platform API (Recommended for VillageVault)

**Pros:**
- ✅ **Stateful** - Remembers previous interactions
- ✅ **Easier Implementation** - Less backend code required
- ✅ **Recommended for Triage** - Perfect for symptom checking
- ✅ **Built-in Analytics** - Access to Infermedica Analytics
- ✅ **Medical Device Certified** - Class IIa Medical Device in EU
- ✅ **Simplified End Flow** - Infermedica handles interview completion

**Cons:**
- ⚠️ Less flexible - Structured workflow
- ⚠️ Less customizable - Follow Infermedica's flow

**Use Case**: Best for simple symptom checkers and triage systems

### Engine API (Currently Used)

**Pros:**
- ✅ **More Flexible** - Full control over interview process
- ✅ **Stateless** - Better for privacy concerns
- ✅ **Highly Configurable** - Custom workflows

**Cons:**
- ❌ **More Complex** - Requires more backend logic
- ❌ **No Built-in Analytics** - Must implement your own
- ❌ **More Development Effort** - Requires medical knowledge
- ❌ **Stateless** - Must manage state yourself

**Use Case**: Best for highly customized medical solutions

## Recommendation

For **VillageVault**, we recommend **Platform API** because:

1. **Simpler Implementation** - Less code, easier maintenance
2. **Better for Rural Healthcare** - Structured triage is perfect for limited medical access
3. **Built-in Analytics** - Track health check usage patterns
4. **Medical Device Certified** - Meets regulatory requirements

## Migration Steps (Optional)

If you want to switch to Platform API:

### Step 1: Update Environment Variable

```env
# In backend/.env
INFERMEDICA_API_KEY="your-app-id:your-app-key"
INFERMEDICA_API_TYPE="platform"  # Add this
```

### Step 2: Update Health Service

Change base URL:
```javascript
// From:
this.baseUrl = 'https://api.infermedica.com/v3'

// To:
this.baseUrl = 'https://api.infermedica.com/platform/v2'
```

### Step 3: Update API Endpoints

Platform API uses different endpoints:
- Interview start: `POST /interviews`
- Interview questions: `GET /interviews/{interview_id}/question`
- Submit answer: `POST /interviews/{interview_id}/answer`
- Get recommendations: `GET /interviews/{interview_id}/recommendation`

### Step 4: Update Frontend

Platform API requires stateful flow:
- Store `interview_id` in session
- Follow question-by-question flow
- Handle recommendation at end

## Current Implementation Status

✅ **Working with Engine API (v3)**
- Symptom search
- Symptom analysis
- Triage recommendations
- Fallback system for offline use

## Recommendation for VillageVault

**Keep Current Implementation** for now because:

1. ✅ Already working with fallbacks
2. ✅ Flexible for future enhancements
3. ✅ Stateless is good for privacy
4. ✅ Less dependencies on API structure

**Consider Platform API** if:
- You want simpler maintenance
- You need built-in analytics
- You want medical device certification
- You prefer stateful interviews

## Getting API Keys

1. Visit: https://developer.infermedica.com/
2. Sign up for an account
3. Create an application
4. Get your **App-Id** and **App-Key**
5. Add to `backend/.env`:
   ```
   INFERMEDICA_API_KEY="your-app-id:your-app-key"
   ```

## API Documentation Links

- **Platform API**: https://developer.infermedica.com/docs/platform-api
- **Engine API**: https://developer.infermedica.com/docs/engine-api
- **Comparison**: https://developer.infermedica.com/docs/platform-api-vs-engine-api

---

**Current Status**: Engine API (v3) with full fallback support  
**Recommendation**: Keep current implementation unless you need Platform API features

