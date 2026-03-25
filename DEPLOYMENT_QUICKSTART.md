# Deployment Quick Start — 15 Minutes

Deploy V.Two Ops to production in 3 simple steps. Free tier covers everything.

---

## Step 1: Deploy Backend to Railway (5 min)

### 1.1 Create Account
- Go to [railway.app](https://railway.app)
- Click "Start New Project"
- Sign in with GitHub
- Authorize Railway to access your repos

### 1.2 Deploy from GitHub
1. Click "Deploy from GitHub"
2. Search for and select `vtwo-ops` repository
3. Click "Create" or "Deploy"

Railway auto-detects Node.js and starts building.

### 1.3 Set Environment Variables
1. Go to your Railway project dashboard
2. Click "Variables" in left sidebar
3. Add these variables:

```
NODE_ENV=production
PORT=3001
SESSION_SECRET=<generate-random-string>
```

**Generate SESSION_SECRET** (run in terminal):
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Paste the output into the SESSION_SECRET field.

4. Click "Deploy"

### 1.4 Get Your Backend URL
1. Click "Deployments" tab
2. Copy the URL (e.g., `https://vtwo-ops-production-xxxx.railway.app`)

**Test it:**
```bash
curl https://your-url/api/health
# Should return: {"status":"ok"}
```

**Save this URL for Step 3.**

---

## Step 2: Deploy Frontend to Vercel (5 min)

### 2.1 Create Account
- Go to [vercel.com](https://vercel.com)
- Click "Sign Up"
- Choose "GitHub"
- Authorize Vercel to access your repos

### 2.2 Import Project
1. Click "Add New..." → "Project"
2. Search for `vtwo-ops`
3. Click "Import"
4. In "Configure Project" screen:
   - Framework: React (auto-detected)
   - Root Directory: `./app` (Vercel auto-detects)
   - Click "Deploy"

Vercel builds and deploys automatically.

### 2.3 Get Your Frontend URL
After deployment completes:
1. In Vercel dashboard, click your project
2. Copy the URL (e.g., `https://vtwo-ops.vercel.app`)

**Test it:**
```bash
curl https://your-frontend-url
# Should return HTML (the app homepage)
```

**Save this URL for Step 3.**

---

## Step 3: Connect Frontend to Backend (5 min)

### 3.1 Update Frontend Config
1. Open `/Users/oliver/OliverRepo/workspaces/work/projects/vtwo-ops/app/src/config.js`
2. Find this line:
   ```javascript
   const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001';
   ```
3. Replace with your Railway URL:
   ```javascript
   const API_BASE_URL = 'https://your-backend-url.railway.app';
   ```
   (Use the URL from Step 1.4)

### 3.2 Push to GitHub
```bash
cd /Users/oliver/OliverRepo/workspaces/work/projects/vtwo-ops
git add app/src/config.js
git commit -m "chore: Update API_BASE_URL for production"
git push origin main
```

Vercel auto-redeploys within 2 minutes.

### 3.3 Update Backend CORS (Optional but Recommended)
1. Go to Railway dashboard
2. Click Variables
3. Add:
   ```
   FRONTEND_URL=https://your-frontend-url.vercel.app
   ```
   (Use the URL from Step 2.3)
4. Click "Deploy"

Backend now accepts requests from your frontend.

---

## Final Verification

### 1. Test Backend
```bash
curl https://your-backend-url/api/health
# Response: {"status":"ok"}
```

### 2. Test Frontend
Open `https://your-frontend-url` in your browser
- Should load the V.Two Ops dashboard
- Should see sidebar, top bar, pages
- No errors in browser console (F12)

### 3. Test API Connection
1. Open frontend in browser
2. Go to any page (Dashboard, Directory, Hiring)
3. If data loads without errors: ✓ Success!
4. If errors: Check browser console (F12) for CORS or network errors

---

## You're Done!

Your V.Two Ops system is now live:

- **Frontend:** https://your-frontend-url.vercel.app
- **Backend:** https://your-backend-url.railway.app
- **Auto-deploy:** Every git push updates production within 2 minutes

---

## Next Steps

### Share with Team
Give non-technical users the frontend URL. They can:
- Create candidates
- Manage employees
- Track devices
- View reports

They don't need to know about the backend or code.

### Manage in Production
See [Maintenance Guide](docs/MAINTENANCE_GUIDE.md) for:
- Weekly health checks (5 min)
- Monthly updates (15 min)
- Adding new features
- Troubleshooting

### Learn the System
See [Architecture](docs/ARCHITECTURE.md) for:
- System design
- Data models
- File structure
- How features work

---

## Troubleshooting

### Backend Deployment Failed
1. Click the failed deployment in Railway
2. Go to "Build" tab
3. Scroll to bottom and find error message
4. Common fixes:
   - Missing environment variable → Add to Railway Variables
   - `prisma db push` error → Usually self-healing on next push
   - Build timeout → Redeploy (click "Redeploy" button)

### Frontend Build Failed
1. Click failed deployment in Vercel
2. Scroll to find build error
3. Common fixes:
   - Syntax error in code → Fix locally, git push
   - Missing module → Run `npm install` locally, commit, push
   - Build timeout → Uncommon, redeploy if stuck

### Frontend Can't Reach API
1. Open browser console (F12)
2. Look for network errors
3. Check API_BASE_URL in `app/src/config.js` matches your Railway URL exactly
4. If changed, commit and push
5. Wait 2 minutes for Vercel to rebuild

### Still Stuck?
1. Check [Maintenance Guide - Troubleshooting](docs/MAINTENANCE_GUIDE.md#troubleshooting)
2. Railway status: https://railway.app/status
3. Vercel status: https://www.vercelstatus.com
4. Check logs in dashboard

---

## Cost

- **Railway:** Free tier with $5/month credit (covers most use cases)
- **Vercel:** Free tier (unlimited deployments, bandwidth)
- **Total:** $0-5/month for production hosting

Both services have paid tiers if you need more resources, but free tier is fine for small teams.

---

## Summary

✓ Backend deployed to Railway
✓ Frontend deployed to Vercel
✓ Connected frontend to backend
✓ Live and ready to use
✓ Auto-deploys on git push

**Time:** 15 minutes
**Cost:** Free
**Maintenance:** 5 min/week

You now have a production system ready for your team.
