# Deployment Guide — V.Two Ops

Deploy backend + frontend to free services in 15 minutes. This guide covers Railway (backend) and Vercel (frontend).

## Overview

- **Backend:** Node.js + Express API → Railway.app
- **Frontend:** React app → Vercel
- **Database:** SQLite (free, file-based) or PostgreSQL (optional)
- **Auto-deploy:** Push to GitHub → auto-deployed within 2 minutes

---

## Prerequisites

1. GitHub account with the `vtwo-ops` repository
2. Railway account (railway.app)
3. Vercel account (vercel.com)
4. Git configured locally

All accounts are free tier with generous limits.

---

## Part 1: Backend Deployment (Railway)

### Step 1: Create Railway Account

1. Go to [railway.app](https://railway.app)
2. Click "Start New Project"
3. Sign in with GitHub (recommended)
4. Authorize Railway to access your repositories

### Step 2: Deploy from GitHub

1. Click "Deploy from GitHub"
2. Search for and select `vtwo-ops` repository
3. Select the root directory (leave as-is)
4. Click "Create" or "Deploy"

Railway auto-detects Node.js and creates a deployment.

### Step 3: Set Environment Variables

1. Go to your Railway project dashboard
2. Click "Variables" in the left sidebar
3. Add the following variables:

```
NODE_ENV=production
PORT=3001
SESSION_SECRET=<generate-with-openssl>
ANTHROPIC_API_KEY=<optional-if-using-claude>
```

**Generate SESSION_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

4. Click "Deploy" to apply changes

### Step 4: Configure Database

Railway will use SQLite by default (configured in `.env.production`).

**SQLite (recommended for free tier):**
- File-based database
- Auto-created at `/app/prod.db`
- No configuration needed
- Persists on Railway's disk

**PostgreSQL (optional, if you want managed DB):**
1. In Railway, click "+ Create" → Add PostgreSQL
2. Copy the `DATABASE_URL` from Postgres plugin
3. Paste into your Node.js environment variables
4. Click "Deploy"

### Step 5: Get Your Backend URL

After deployment completes:
1. Click "Deployments" tab
2. Copy the URL (e.g., `https://vtwo-ops-production-xxxx.railway.app`)
3. Your API health endpoint: `https://your-url/api/health`

**Test it:**
```bash
curl https://your-backend-url/api/health
# Should return: {"status":"ok"}
```

---

## Part 2: Frontend Deployment (Vercel)

### Step 1: Create Vercel Account

1. Go to [vercel.com](https://vercel.com)
2. Click "Sign Up"
3. Choose "GitHub" (recommended)
4. Authorize Vercel to access your GitHub repositories

### Step 2: Import Project

1. Click "Add New..." → "Project"
2. Search for `vtwo-ops` repository
3. Click "Import"
4. In "Configure Project" screen:
   - **Framework Preset:** React (auto-detected)
   - **Root Directory:** `./app` (Vercel auto-detects this)
   - Click "Deploy"

Vercel builds and deploys automatically.

### Step 3: Update Frontend API Configuration

After backend is deployed:

1. Go to `/Users/oliver/OliverRepo/workspaces/work/projects/vtwo-ops/app/src/config.js`
2. Find the line:
   ```javascript
   const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001';
   ```
3. Update to your Railway backend URL:
   ```javascript
   const API_BASE_URL = 'https://your-backend-url.railway.app';
   ```
4. Commit and push:
   ```bash
   git add app/src/config.js
   git commit -m "chore: Update API_BASE_URL for production"
   git push origin main
   ```

Vercel will auto-redeploy.

### Step 4: Get Your Frontend URL

After deployment completes:
1. In Vercel dashboard, click your project
2. Copy the URL (e.g., `https://vtwo-ops.vercel.app`)
3. This is your live app URL

**Test it:**
```bash
curl https://your-frontend-url
# Should return the HTML homepage
```

---

## Part 3: Configure Backend for Frontend

Update CORS and session settings on Railway:

1. In Railway, go to Variables
2. Add:
   ```
   FRONTEND_URL=https://your-frontend-url.vercel.app
   ```
3. Click "Deploy"

The backend will now accept requests from your frontend.

---

## Environment Variables Reference

| Variable | Required | Example | Notes |
|----------|----------|---------|-------|
| `NODE_ENV` | Yes | `production` | Required for secure cookies |
| `PORT` | No | `3001` | Auto-set by Railway/Render |
| `DATABASE_URL` | No | `file:./prod.db` | SQLite (default) or PostgreSQL |
| `SESSION_SECRET` | Yes | `abc123...` | 32+ char random string |
| `FRONTEND_URL` | No | `https://...vercel.app` | For CORS configuration |
| `ANTHROPIC_API_KEY` | No | `sk-...` | Only if using Claude features |

---

## Verify Deployments

### Backend Health Check
```bash
curl https://your-backend-url/api/health
```
Expected response:
```json
{"status":"ok"}
```

### Frontend Loading
1. Open `https://your-frontend-url` in your browser
2. Check browser console (F12) for errors
3. Should see the V.Two Ops dashboard with sidebar navigation

### API Connection
1. Open the frontend
2. Go to any page (e.g., Directory, Hiring)
3. If data loads without errors, API is connected

---

## Troubleshooting

### Backend Deployment Fails

**Issue:** Build fails with "prisma db push" error

**Solution:**
1. Check Railway logs for specific error
2. Ensure `DATABASE_URL` is set correctly
3. If using PostgreSQL, verify connection string is valid
4. Click "Redeploy" to retry

### Frontend Won't Load API

**Issue:** Console shows CORS errors or "API unreachable"

**Solution:**
1. Verify backend `FRONTEND_URL` matches your Vercel URL exactly (including protocol)
2. Check `app/src/config.js` has correct `API_BASE_URL`
3. Test backend directly with curl
4. If still failing, redeploy both services

### Builds Are Slow

**Issue:** Deployment takes >5 minutes

**Reason:** Normal for first build. Subsequent pushes are faster.

**To speed up:**
- Don't commit `node_modules` folder
- Use `.gitignore` to exclude build artifacts

---

## Auto-Deployments

Both services auto-deploy when you push to GitHub:

```bash
# Edit code locally
nano server/routes/candidates.js

# Commit and push
git add .
git commit -m "feat: Add candidate filtering"
git push origin main

# Within 2 minutes:
# - Railway rebuilds backend
# - Vercel rebuilds frontend
# - Both live automatically
```

---

## Redeploy Manually

### Railway (Backend)
1. Go to [railway.app](https://railway.app)
2. Click your project
3. Click "Deployments"
4. Click "Redeploy" on latest deployment

### Vercel (Frontend)
1. Go to [vercel.com](https://vercel.com)
2. Click your project
3. Go to "Deployments" tab
4. Click "..." → "Redeploy"

---

## Database Backups

### SQLite (Default)
Railway automatically backs up your SQLite database. To download:

1. In Railway, click your project
2. Go to "Data" tab
3. Right-click the database file → Download

### PostgreSQL (If Used)
Railway handles automated backups. Access via:
1. Railway dashboard → PostgreSQL plugin
2. Click "Backups" tab

---

## Next Steps

1. **Share with team:** Give them your frontend URL
   - They can use it immediately (no setup needed)
   - They're users, not developers

2. **Monitor:** Check dashboards weekly (5 min)
   - Railway logs for backend health
   - Vercel for frontend build status

3. **Iterate:** Push code changes to auto-deploy
   - Edit features locally
   - Test locally first
   - Push to GitHub
   - Live in 2 minutes

---

## Cost

- **Railway:** Free tier with $5/month credit (covers most use cases)
- **Vercel:** Free tier (unlimited deployments, bandwidth)
- **Total:** $0-5/month for production hosting

Both services have paid tiers if you need more resources.

---

## Support

- **Railway Issues:** [railway.app/help](https://railway.app/help)
- **Vercel Issues:** [vercel.com/help](https://vercel.com/help)
- **Project Issues:** Check GitHub Actions logs for build errors
