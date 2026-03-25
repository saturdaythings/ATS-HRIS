# One-Person Maintenance Guide — V.Two Ops

Complete guide for managing the production V.Two Ops system solo. Designed for minimal daily effort with maximum uptime.

---

## At a Glance

| Task | Frequency | Time | What to Do |
|------|-----------|------|-----------|
| Check health | Weekly | 2 min | Click two dashboards, scan for errors |
| Update code | As needed | 5-10 min | Edit locally, commit, push to GitHub |
| Backup database | Weekly | 1 min | Click button on Railway dashboard |
| Scale resources | Monthly | 2 min | Review CPU/memory usage, upgrade if needed |
| Security patch | Monthly | 5 min | Update npm packages and redeploy |

**Daily:** Nothing required. Auto-deploys handle everything.

---

## Daily Tasks (0 minutes)

### Automated Processes
Your system is configured for 100% automation:

- ✅ **Code → Live:** Push to GitHub, auto-deploys within 2 min
- ✅ **Health monitoring:** Railway logs errors automatically
- ✅ **Database persistence:** SQLite saved automatically
- ✅ **SSL certificates:** Renewed automatically

**Your action:** None. Come back when you need to change code.

---

## Weekly Tasks (5 minutes)

### 1. Check Backend Health

**When:** Every Monday or after major changes

**How:**

**Option A: Terminal (fastest)**
```bash
curl https://your-backend-url/api/health
# Expected: {"status":"ok"}
```

**Option B: Dashboard**
1. Open [railway.app](https://railway.app)
2. Click your `vtwo-ops` project
3. Go to "Logs" tab
4. Scroll to latest entries
5. Look for red/orange error messages
6. If found, click error line for details

**What to look for:**
- Database connection errors
- CORS failures
- Memory warnings
- API timeouts

**If all green:** You're good. Check again next week.

**If errors found:** See troubleshooting section below.

### 2. Check Frontend Status

**When:** Same time as backend check

**How:**

**Option A: Manual test**
1. Open `https://your-frontend-url` in browser
2. Go to any page (Dashboard, Directory, Hiring)
3. Verify data loads without errors
4. Check browser console (F12) for red messages

**Option B: Dashboard**
1. Open [vercel.com](https://vercel.com)
2. Click your `vtwo-ops` project
3. Go to "Deployments" tab
4. Top deployment should have green checkmark
5. Click it to see build log (should show "Production" in green)

**If deployment failed:** See troubleshooting section.

### 3. Database Backup

**When:** Every Friday (2 min task)

**How:**

1. Open [railway.app](https://railway.app)
2. Click your project
3. Click your database (green cylinder icon, labeled "vtwo-ops")
4. Go to "Data" tab
5. Right-click the database file
6. Click "Download" (optional but recommended)

**Where:** Downloaded to your Downloads folder

**Retention:** Railway keeps 7-day automatic backups. You don't need to do this, but it's good peace of mind.

---

## Monthly Tasks (15 minutes)

### 1. Security: Update Dependencies

**When:** First of each month

**How:**

```bash
cd /Users/oliver/OliverRepo/workspaces/work/projects/vtwo-ops

# Check for updates
npm outdated

# Update to latest safe versions
npm update

# Update app dependencies
cd app && npm update && cd ..

# Commit and push
git add package*.json app/package*.json
git commit -m "chore: Update dependencies for security"
git push origin main

# Wait 2 minutes for auto-deploy
```

Both services redeploy automatically.

### 2. Review Resource Usage

**When:** Monthly (same day as security update)

**How:**

**Backend (Railway):**
1. Open [railway.app](https://railway.app)
2. Click your project → "Metrics" tab
3. Check last 30 days:
   - **CPU:** Should be <50% average
   - **Memory:** Should be <200MB
   - **Storage:** Should be <500MB (if using SQLite)

**If any are maxed out:**
1. Click "Settings" → "Plan"
2. Upgrade to next tier
3. Railway auto-scales (no downtime)

**Frontend (Vercel):**
1. Open [vercel.com](https://vercel.com)
2. Click project → "Analytics" tab
3. Check:
   - **Response time:** Should be <100ms
   - **Errors:** Should be <1%
4. Vercel scales automatically; no action needed

### 3. Review Error Logs

**When:** Monthly (same day as updates)

**How:**

**Backend errors:**
1. Railway dashboard → Logs tab
2. Set filter to "Last 30 days"
3. Look for red/orange messages
4. If errors are present, check "Troubleshooting" section below

**Frontend errors:**
1. Vercel dashboard → "Functions" tab
2. Review function logs for failures
3. If builds are failing, check GitHub Actions

---

## Adding Features (As Needed)

### Local Development Workflow

```bash
# 1. Create feature branch
cd /Users/oliver/OliverRepo/workspaces/work/projects/vtwo-ops
git checkout -b feature/your-feature-name

# 2. Edit code (server/ and/or app/src/)
# Example: Add new API endpoint
nano server/routes/candidates.js

# 3. Test locally
npm run dev              # Terminal 1: Backend on :3001
npm run dev:frontend    # Terminal 2: Frontend on :5173

# 4. Check browser at http://localhost:5173
# Verify your changes work

# 5. Commit
git add .
git commit -m "feat: Add new candidate filtering"

# 6. Push
git push origin feature/your-feature-name

# 7. Create Pull Request on GitHub (optional but recommended)
# Or just merge directly:
git checkout main
git merge feature/your-feature-name
git push origin main

# 8. Wait 2 minutes for production deploy
```

Within 2 minutes:
- Backend rebuilds on Railway
- Frontend rebuilds on Vercel
- Live at `https://your-frontend-url`

### Making API Changes

**If you add a new endpoint:**

1. Add route in `server/routes/` (e.g., `server/routes/newFeature.js`)
2. Import in `server/index.js`:
   ```javascript
   import newFeatureRouter from './routes/newFeature.js';
   app.use('/api/newfeature', newFeatureRouter);
   ```
3. Test locally on `http://localhost:3001/api/newfeature`
4. Commit, push, and auto-deploy

**If you change database schema:**

1. Edit `prisma/schema.prisma`
2. Run locally:
   ```bash
   npm run db:push
   ```
3. Verify locally, then commit and push
4. Railway auto-runs `prisma db push` on deploy

### Making Frontend Changes

**If you add a new page:**

1. Create file: `app/src/pages/MyNewPage.jsx`
2. Add route in `app/src/App.jsx`:
   ```javascript
   import MyNewPage from './pages/MyNewPage';

   <Route path="/mynewpage" element={<MyNewPage />} />
   ```
3. Test at `http://localhost:5173/mynewpage`
4. Commit, push, and auto-deploy

**If you update styles:**
- Edit `app/src/index.css` or component `<style>` blocks
- Tailwind CSS is already configured
- Test locally, commit, push

---

## Troubleshooting

### Backend Deployment Failed

**Symptom:** Railway shows red X on latest deployment

**Diagnosis:**
1. Click the failed deployment
2. Go to "Build" tab
3. Scroll to the bottom and find the error message

**Common causes and fixes:**

**Error: "prisma db push failed"**
- Cause: Database schema error
- Fix:
  1. Check `prisma/schema.prisma` for syntax errors
  2. Test locally: `npm run db:push`
  3. Fix error, commit, push
  4. Railway will auto-retry on next push

**Error: "Cannot find module 'X'"**
- Cause: Missing package
- Fix:
  1. Install locally: `npm install X`
  2. Check `package.json` was updated
  3. Commit, push
  4. Railway auto-retries

**Error: "Port already in use" or timeout**
- Cause: Previous deployment still running
- Fix:
  1. In Railway, click "Settings"
  2. Click "Redeploy"
  3. Wait for deployment to complete
  4. Check logs again

### Frontend Build Failed

**Symptom:** Vercel shows failed deployment

**Diagnosis:**
1. Click "Deployments" tab
2. Click the failed deployment
3. Scroll down to see error

**Common causes and fixes:**

**Error: "ESLint error" or "JSX syntax error"**
- Cause: Code has syntax errors
- Fix:
  1. Fix error locally (editor should show it in red)
  2. Commit, push
  3. Vercel auto-retries

**Error: "Build took too long"**
- Cause: Large dependencies
- Fix:
  1. Check for unused packages in `package.json`
  2. Remove unused ones: `npm uninstall X`
  3. Commit, push
  4. Vercel auto-retries

### API Calls Not Working

**Symptom:** Frontend loads but shows "Cannot reach API" errors

**Diagnosis:**
1. Open browser console (F12)
2. Check network tab
3. Look at failed requests to `your-backend-url/api/...`
4. Check error status and message

**Common causes and fixes:**

**CORS error:**
- Cause: Backend not allowing frontend domain
- Fix:
  1. In Railway, check `FRONTEND_URL` variable matches your Vercel URL exactly
  2. Redeploy if changed
  3. Wait 2 minutes, try again

**502 Bad Gateway:**
- Cause: Backend is down or crashing
- Fix:
  1. Check Railway backend logs
  2. Look for errors (see "Backend Deployment Failed" above)
  3. Redeploy backend

**Timeout (no response):**
- Cause: Backend is slow or unresponsive
- Fix:
  1. Check Railway metrics for CPU/memory spikes
  2. If maxed out, upgrade plan
  3. Check database query performance (look at logs for slow queries)

### Database Issues

**Symptom:** "Database connection refused" or "Cannot create table"

**Diagnosis:**
1. SSH into Railway (or check logs)
2. Verify `DATABASE_URL` environment variable is set
3. Check if using SQLite or PostgreSQL

**For SQLite:**
- File should be at `/app/prod.db`
- Check Railway has write permission to `/app/`
- If missing, running any endpoint will recreate it

**For PostgreSQL:**
- Verify `DATABASE_URL` is correct
- Test connection: `psql <DATABASE_URL>`
- If using external DB, verify IP is whitelisted

**Fix:**
1. Check `DATABASE_URL` in Railway Variables
2. If SQLite, no action needed (auto-creates on demand)
3. If PostgreSQL, verify connection string
4. Redeploy if changed

---

## Scaling & Performance

### When to Upgrade Railway Plan

**Free tier supports:**
- Up to 5 GB storage
- Shared CPU (slow but free)
- Monthly ~$5 credit (usually free)

**Upgrade to paid when:**
- CPU consistently >80%
- Memory consistently >300MB
- Storage >4GB
- Response times >2 seconds

**How to upgrade:**
1. Go to Railway dashboard → Settings
2. Click "Plan"
3. Choose paid tier ($5-20/month depending on needs)
4. Billing starts immediately
5. No downtime during upgrade

### When to Upgrade Vercel Plan

Vercel free tier is very generous:
- Unlimited deployments
- Unlimited bandwidth
- 100GB monthly

**You probably won't need to upgrade.** But if you do:
1. Go to Vercel dashboard → Settings
2. Click "Billing"
3. Choose Pro or Enterprise
4. Auto-billed monthly

---

## Monitoring & Alerts

### Set Up Email Alerts (Optional)

**Railway Alerts:**
1. Dashboard → Settings → Alerts
2. Add email address
3. Choose which events trigger (e.g., deployment failure)

**Vercel Alerts:**
1. Dashboard → Settings → Notifications
2. Enable "Deployment Failures"
3. Choose email

### Manual Health Check Shortcut

Save this as a bash script to check everything:

```bash
#!/bin/bash
# health-check.sh

echo "Backend health:"
curl -s https://your-backend-url/api/health | jq .

echo "Frontend accessibility:"
curl -s -I https://your-frontend-url | head -n 1

echo "Railway status:"
echo "Visit: https://railway.app"

echo "Vercel status:"
echo "Visit: https://vercel.com"
```

Run weekly: `bash health-check.sh`

---

## Sharing with Team

### For Users (Non-Technical)

1. **Give them the frontend URL** (e.g., `https://vtwo-ops.vercel.app`)
2. **That's it.** No setup needed.
3. They can:
   - Create candidates
   - Manage employees
   - Track devices
   - View reports

They never interact with the backend or code.

### For Developers (Who Need to Contribute)

1. **GitHub repo URL:** `https://github.com/your-org/vtwo-ops`
2. **Instructions:** Send them `README.md` and `docs/DEPLOYMENT.md`
3. **They can:**
   - Clone repo
   - `npm install && cd app && npm install && cd ..`
   - `npm run dev` + `npm run dev:frontend`
   - Make changes and submit PRs

---

## Disaster Recovery

### If Everything Goes Wrong

**Nuclear option: Full redeploy**

```bash
# 1. Push clean code
cd /Users/oliver/OliverRepo/workspaces/work/projects/vtwo-ops
git status  # Check everything is committed

# 2. Redeploy backend
# In Railway dashboard: Click "Redeploy" on latest

# 3. Redeploy frontend
# In Vercel dashboard: Click "Redeploy" on latest

# 4. Wait 5 minutes
# Both services should be live again
```

**If database is corrupted:**

1. **For SQLite:**
   - Delete `prod.db` file (or Railway will do this on redeploy)
   - Run `npm run db:push` during next deploy
   - Database recreates with fresh schema
   - Data is lost (use backups if available)

2. **For PostgreSQL:**
   - Use Railway's backup feature to restore
   - Go to PostgreSQL plugin → Backups tab
   - Choose a recent backup and restore
   - Data returns to that point in time

**If code is broken:**
1. Git has your full history
2. `git revert <commit-id>` to go back
3. Push
4. Auto-deploys the previous working version

---

## Maintenance Checklist

Copy and print this:

```
WEEKLY CHECKLIST (Monday)
[ ] Check backend health: curl https://your-backend-url/api/health
[ ] Check frontend loads: Open https://your-frontend-url
[ ] Check logs for errors: Railway & Vercel dashboards
[ ] Backup database: Railway → Database → Download

MONTHLY CHECKLIST (1st of month)
[ ] Update dependencies: npm update && npm audit
[ ] Commit security updates: git push
[ ] Review resource usage: CPU, memory, storage
[ ] Check error logs from last month
[ ] Note any scaling needs

AS-NEEDED
[ ] Add features: Edit code locally, push, auto-deploy
[ ] Update environment variables: Railway/Vercel dashboards
[ ] Database schema changes: Edit prisma/schema.prisma, push
[ ] Scale up if needed: Railway plan upgrade
```

---

## Key Contacts & Resources

| Topic | Link |
|-------|------|
| Railway Status | https://railway.app/status |
| Vercel Status | https://www.vercelstatus.com |
| Railway Support | https://railway.app/help |
| Vercel Support | https://vercel.com/help |
| Node.js Docs | https://nodejs.org/docs |
| Express Docs | https://expressjs.com |
| React Docs | https://react.dev |
| Prisma Docs | https://www.prisma.io/docs |

---

## Summary

**You are the ops team. Here's your job:**

- **Daily:** Nothing. System auto-deploys.
- **Weekly:** Check two dashboards (5 min). Scan for red.
- **Monthly:** Update packages, backup DB (15 min).
- **As-needed:** Add features via git push.

Everything else is automated. You have a system that runs itself.

Welcome to production ops for a solo engineer.
