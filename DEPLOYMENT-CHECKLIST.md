# Deployment Checklist

**Objective:** Deploy V.Two Ops to production in 10 minutes

---

## Pre-Deployment (Local Testing - 2 minutes)

- [ ] Clone/pull latest code: `git pull origin main`
- [ ] Install backend deps: `npm ci`
- [ ] Install frontend deps: `cd app && npm ci`
- [ ] Test backend: `npm start` → Check `http://localhost:3001/api/health`
- [ ] Test frontend: `cd app && npm run dev` → Check `http://localhost:5173`
- [ ] Stop both servers (Ctrl+C)

---

## Phase 1: Deploy Backend to Railway (5 minutes)

### Setup Railway Account
- [ ] Go to [railway.app](https://railway.app)
- [ ] Click "Sign up" → Choose "GitHub"
- [ ] Authorize access to your GitHub account

### Create & Deploy Project
- [ ] Click "New Project" → "Deploy from GitHub"
- [ ] Select `vtwo-ops` repository
- [ ] Keep root directory as default
- [ ] Click "Deploy"
- [ ] Wait for build to complete (watch logs)

### Configure Environment
- [ ] Click "Variables" tab
- [ ] Add these environment variables:
  ```
  NODE_ENV=production
  SESSION_SECRET=[run: openssl rand -base64 32]
  FRONTEND_URL=[You'll set this after deploying frontend]
  ```
- [ ] Click "Redeploy" after adding variables

### Get API URL
- [ ] Go to "Settings" tab
- [ ] Copy your public URL (e.g., `https://your-api-xxx.railway.app`)
- [ ] Save this URL — you'll need it for frontend

### Verify Backend Works
- [ ] In terminal: `curl https://your-api-xxx.railway.app/api/health`
- [ ] Should respond: `{"status":"ok"}`

---

## Phase 2: Deploy Frontend to Vercel (2 minutes)

### Setup Vercel Account
- [ ] Go to [vercel.com](https://vercel.com)
- [ ] Click "Sign up" → Choose "GitHub"
- [ ] Authorize access to your GitHub account

### Create & Deploy Project
- [ ] Click "Add New..." → "Project"
- [ ] Select `vtwo-ops` repository
- [ ] Configure build:
  - **Root Directory:** `app`
  - **Build Command:** `npm run build` (auto-filled)
  - **Output Directory:** `dist` (auto-filled)
- [ ] Click "Deploy"
- [ ] Wait for build (1-2 minutes)

### Configure API URL
- [ ] Click "Settings" → "Environment Variables"
- [ ] Add variable:
  ```
  VITE_API_URL=[Your Railway API URL from Phase 1]
  ```
  Example: `https://your-api-xxx.railway.app`
- [ ] Click "Redeploy" or "Save and Deploy"
- [ ] Wait for build to complete

### Get Frontend URL
- [ ] Go to "Deployments" tab
- [ ] Click latest deployment (should be green ✓)
- [ ] Copy your frontend URL (e.g., `https://your-app.vercel.app`)
- [ ] Save this URL

---

## Phase 3: Reconnect Backend to Frontend (1 minute)

### Update Backend CORS
- [ ] Go back to [railway.app](https://railway.app)
- [ ] Click your project → "Variables"
- [ ] Update `FRONTEND_URL` to your Vercel URL:
  ```
  FRONTEND_URL=https://your-app.vercel.app
  ```
- [ ] Click "Redeploy"

---

## Verification (2 minutes)

### Test Backend
```bash
curl https://your-api-xxx.railway.app/api/health
# Should return: {"status":"ok"}
```

### Test Frontend
- [ ] Open `https://your-app.vercel.app` in browser
- [ ] Open DevTools (F12) → Console tab
- [ ] Look for any error messages
- [ ] Try using the app (make a request to API)
- [ ] Check Network tab to see API calls succeed

### Test CORS
- [ ] In browser console, paste:
  ```javascript
  fetch('https://your-api-xxx.railway.app/api/health')
    .then(r => r.json())
    .then(d => console.log('Success:', d))
    .catch(e => console.error('Error:', e))
  ```
- [ ] Should log: `Success: {status: "ok"}`
- [ ] If you see CORS error, check `FRONTEND_URL` in Railway dashboard

---

## Post-Deployment

### Document URLs
- [ ] Frontend URL: `https://your-app.vercel.app`
- [ ] Backend API: `https://your-api-xxx.railway.app`
- [ ] API Health: `https://your-api-xxx.railway.app/api/health`

### Share with Team
- [ ] Send frontend URL to team members
- [ ] Share this checklist for future reference

### Setup Monitoring (Optional)
- [ ] Bookmark Railway dashboard for backend monitoring
- [ ] Bookmark Vercel dashboard for frontend monitoring
- [ ] Set up email alerts (both services support this)

---

## Update Code (Future)

When you update code:

```bash
# Make changes
git add .
git commit -m "Your commit message"
git push origin main
```

Then:
- **Backend:** Railway auto-deploys (watch logs at railway.app)
- **Frontend:** Vercel auto-deploys (watch logs at vercel.app)

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Backend build fails | Check Railway logs for error, fix code, git push |
| Frontend build fails | Check Vercel logs, usually missing env var |
| CORS errors in browser | Check `FRONTEND_URL` in Railway dashboard matches your Vercel URL |
| API calls return 404 | Check `VITE_API_URL` in Vercel matches your Railway API URL |
| Blank page/white screen | Check browser console (F12) for errors |

---

## Quick Reference

| Service | Link | Action |
|---------|------|--------|
| Backend (Railway) | [railway.app](https://railway.app) | Manage API, view logs |
| Frontend (Vercel) | [vercel.app](https://vercel.app) | Manage app, view logs |
| Code (GitHub) | [github.com](https://github.com) | Push updates → auto-deploy |
| This Checklist | `DEPLOYMENT-CHECKLIST.md` | Reference guide |

---

## Detailed Guides

For more information:
- **Backend deployment:** See `docs/DEPLOY-BACKEND.md`
- **Frontend deployment:** See `docs/DEPLOY-FRONTEND.md`
- **Quick start:** See `docs/DEPLOYMENT-QUICK-START.md`
- **Maintenance:** See `docs/MAINTENANCE.md`

---

## Success!

When you see:
- ✅ Frontend loads at `https://your-app.vercel.app`
- ✅ API responds at `https://your-api-xxx.railway.app/api/health`
- ✅ No CORS errors in console
- ✅ App can make API calls and display data

**You're done!** Your app is live and ready to share.

---

**Estimated Total Time:** 10-15 minutes
**Costs:** Free tier for both Railway and Vercel
**Support:** See detailed guides above
