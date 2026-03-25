# One-Person Maintenance Guide

Manage both production services (backend + frontend) from a single dashboard.

---

## Daily (2 minutes)

✅ **Automated** — No action needed

- Code pushed to `main` branch auto-deploys
- Frontend auto-builds on Vercel
- Backend auto-deploys on Railway

---

## Weekly (5 minutes)

### Check health:
```bash
# Terminal or browser
curl https://your-api.railway.app/api/health

# Expected response:
# { "status": "ok" }
```

### Check dashboards:
1. **[Railway Dashboard](https://railway.app)** — Backend status
   - Click project → Logs tab
   - Look for errors (red text)
   - Check memory/CPU usage

2. **[Vercel Dashboard](https://vercel.app)** — Frontend status
   - Click project → Deployments tab
   - Check last deployment (should be green ✓)
   - Look for build errors

---

## Monthly (10 minutes)

### Update environment variables (if needed):

**Backend (Railway):**
1. Go to [railway.app](https://railway.app) → Your Project
2. Click Settings → Variables
3. Update any values (e.g., API keys, URLs)
4. Click "Trigger Deploy"

**Frontend (Vercel):**
1. Go to [vercel.app](https://vercel.app) → Your Project
2. Click Settings → Environment Variables
3. Update values
4. Redeploy: Click Deployments → Latest → Redeploy

### Check logs:
- **Railway:** Dashboard → Logs (check for errors)
- **Vercel:** Dashboard → Deployments → Click deployment → Logs

### Review dependencies (optional):
```bash
npm outdated
npm update
git commit -m "chore: update dependencies"
git push origin main
```

---

## When Things Break

### Backend (API) is down

1. **Check Railway dashboard:**
   - Go to [railway.app](https://railway.app)
   - Click project → Logs tab
   - Look for red errors
   - Check memory usage (if >512MB, upgrade plan)

2. **Redeploy manually:**
   - Railway → Deployments → Click "Redeploy" button
   - Or: `git push origin main` (force redeploy)

3. **Check environment variables:**
   - Settings → Variables
   - Ensure all required vars are set
   - Redeploy

4. **Check database:**
   - If SQLite: File might be corrupted
   - If PostgreSQL: Check connection string
   - Run: `npx prisma migrate deploy`

### Frontend (Website) is down

1. **Check Vercel dashboard:**
   - Go to [vercel.app](https://vercel.app)
   - Click project → Deployments
   - Check if last deploy failed (red ✗)
   - Click failed deployment → Logs tab

2. **View build error:**
   - Logs show build command that failed
   - Common: `npm ci` or `npm run build` errors

3. **Redeploy:**
   - Click Deployments → Latest → Redeploy button
   - Or: `git push origin main`

4. **Check environment variable:**
   - Settings → Environment Variables
   - Ensure `VITE_API_URL` is set
   - Redeploy

### CORS errors (can't connect to API)

1. **Check backend `FRONTEND_URL`:**
   ```bash
   # In Railway dashboard → Variables
   # Should match your actual frontend URL
   FRONTEND_URL=https://your-app.vercel.app
   ```

2. **Redeploy backend:**
   - Railway → Deployments → Redeploy

3. **Test:**
   ```bash
   # Open browser DevTools → Network tab
   # Make an API call
   # Check response headers for "Access-Control-Allow-Origin"
   ```

---

## Emergency: Full Reset

If everything is broken and you need to start fresh:

```bash
# 1. Local reset
rm -f dev.db                 # Delete local database
npm ci                       # Fresh dependencies
npx prisma db push         # Rebuild database
npm start                  # Test locally

# 2. Backend reset
# Railway Dashboard → Settings → Delete Project
# Recreate project (same as initial deployment)

# 3. Frontend reset
# Vercel Dashboard → Settings → Delete Project
# Recreate project (same as initial deployment)
```

---

## Performance Monitoring

### Check API response time:
```bash
# Should take <100ms
time curl https://your-api.railway.app/api/health
```

### Check frontend load time:
1. Open your app in browser
2. DevTools → Network tab
3. Look at "DOMContentLoaded" (should be <2s)

### Database size:
- **SQLite:** Check file size: `ls -lh dev.db`
- **PostgreSQL:** Railway shows in Dashboard

---

## Scaling When You Outgrow Free Tier

### Railway free tier limits:
- Memory: 512MB (includes database)
- Storage: 5GB
- CPU: Shared

**When to upgrade:**
- App crashes with "Out of memory"
- Database > 4GB
- High traffic (>1000 requests/min)

### Upgrade Railway:
1. Dashboard → Settings → Plan
2. Choose "Starter" ($5/month) or pay-as-you-go
3. Auto-scales with usage

### Upgrade Vercel:
- Vercel free tier is generous (unlimited)
- Only upgrade for custom domains/analytics

---

## Backup Strategy

### Database backup:

**SQLite (file-based):**
```bash
# Download dev.db from Railway
# Or set up automated backups
```

**PostgreSQL:**
- Railway automatically backs up
- Restore from Railway dashboard if needed

### Code backup:
- GitHub is your backup (all code is there)
- Push regularly: `git push origin main`

---

## Security Checklist

### Weekly:
- [ ] Check no API errors in logs (could indicate attacks)
- [ ] Verify environment variables haven't changed

### Monthly:
- [ ] Rotate `SESSION_SECRET` if needed
- [ ] Update API keys if exposed

### Never:
- [ ] Commit `.env` file or secrets to GitHub
- [ ] Share Railway/Vercel links publicly
- [ ] Use weak SESSION_SECRET

---

## Quick Reference: Command Cheat Sheet

```bash
# Local development
npm start                    # Run backend
cd app && npm run dev       # Run frontend

# Database
npx prisma db push         # Apply schema changes
npx prisma migrate deploy  # Run migrations
npx prisma studio          # View database GUI

# Testing
npm test                   # Run backend tests
cd app && npm test        # Run frontend tests

# Deployment
git push origin main      # Auto-deploy both services
```

---

## Support Resources

| Issue | Resource |
|-------|----------|
| Railway down/slow | [docs.railway.app](https://docs.railway.app) |
| Vercel errors | [vercel.com/docs](https://vercel.com/docs) |
| API endpoint not working | Check server logs in Railway |
| Frontend build failing | Check Vercel logs → Build failures |
| Database issues | Prisma docs: [prisma.io](https://prisma.io) |
| Node.js issues | [nodejs.org/docs](https://nodejs.org/docs) |

---

## Contact/Escalation

- **Critical issue?** Check Railway/Vercel status pages
- **Code bug?** Look in logs first, then check code
- **Need help?** Ask in repo issues or contact team

---

**Last Updated:** 2026-03-24

**Status:** ✅ One person can handle this (2 services, auto-deploy, minimal monitoring)
