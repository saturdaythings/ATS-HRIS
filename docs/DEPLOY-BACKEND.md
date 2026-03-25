# Backend Deployment Guide

Deploy the V.Two Ops API to Railway or Render for free.

## Quick Start (5 minutes)

### Option 1: Deploy to Railway (Recommended)

Railway is the easiest option with free tier supporting up to 5GB storage and $5/month credit.

#### Steps:

1. **Sign up at [railway.app](https://railway.app)** (GitHub login recommended)

2. **Create a new project:**
   - Click "New Project" → "Deploy from GitHub"
   - Authorize and select your `vtwo-ops` repository
   - Select the root directory (not a subdirectory)

3. **Configure environment:**
   - Railway auto-detects Node.js
   - Add environment variables:
     ```
     NODE_ENV=production
     PORT=3001
     ANTHROPIC_API_KEY=your-key-here (optional)
     FRONTEND_URL=https://your-frontend-domain.com
     SESSION_SECRET=generate-random-string-here
     ```

4. **Database setup:**
   - Railway creates a PostgreSQL database by default
   - Update `DATABASE_URL` in Environment tab (already set by Railway)
   - Or configure SQLite with file:./dev.db for simpler deployment

5. **Deploy:**
   - Railway auto-deploys on git push
   - View logs: Railway Dashboard → Logs tab
   - Your API is live at: `https://your-project-random.up.railway.app`

6. **Verify:**
   ```bash
   curl https://your-project-random.up.railway.app/api/health
   ```

---

### Option 2: Deploy to Render

Render is another solid free option with $7/month free credits.

#### Steps:

1. **Sign up at [render.com](https://render.com)** (GitHub login)

2. **Create a Web Service:**
   - Dashboard → "New +" → "Web Service"
   - Connect GitHub repository
   - Select `vtwo-ops` repo

3. **Configure service:**
   - **Name:** vtwo-ops-api
   - **Environment:** Node
   - **Build command:** `npm ci && npm run build`
   - **Start command:** `npm start`
   - **Region:** US (or closest to you)
   - **Plan:** Free

4. **Add environment variables:**
   - NODE_ENV: `production`
   - PORT: `3001`
   - ANTHROPIC_API_KEY: (optional)
   - FRONTEND_URL: your frontend domain
   - SESSION_SECRET: random string
   - DATABASE_URL: (if using external DB, or omit for SQLite)

5. **Deploy:**
   - Click "Create Web Service"
   - Render deploys automatically
   - Watch logs in dashboard

6. **Get your URL:**
   - Shown in Service dashboard (e.g., `https://vtwo-ops-api.onrender.com`)

---

## Environment Variables Reference

| Variable | Required | Example | Notes |
|----------|----------|---------|-------|
| `NODE_ENV` | Yes | `production` | Set to production |
| `PORT` | No | `3001` | Auto-detected by Railway/Render |
| `DATABASE_URL` | Yes | `file:./dev.db` | SQLite for free tier. See DB options below. |
| `FRONTEND_URL` | Yes | `https://user.github.io/repo` | Your GitHub Pages or Vercel URL |
| `SESSION_SECRET` | Yes | Random string | Use `openssl rand -base64 32` to generate |
| `ANTHROPIC_API_KEY` | No | sk-... | Only if using Claude features |

---

## Database Options for Free Tier

### Option A: SQLite (Simplest)
```
DATABASE_URL="file:./dev.db"
```
- ✅ Free
- ✅ No setup
- ✅ Works on Railway/Render free tier
- ❌ File storage only (data lost if service restarts on free tier)

### Option B: Railway PostgreSQL
- Railway provides free PostgreSQL with free projects
- Connection string auto-set as `DATABASE_URL`
- ✅ Persistent storage
- ✅ Better for production

### Option C: Supabase (PostgreSQL)
```
DATABASE_URL="postgresql://user:pass@db.supabase.co/postgres"
```
- ✅ Free tier: 500MB database
- ✅ Persistent
- Need to sign up at [supabase.com](https://supabase.com)

---

## Test Locally Before Deploying

```bash
# 1. Install dependencies
npm ci

# 2. Set up environment
cp .env.example .env
# Edit .env with your values

# 3. Run server
npm start

# 4. Test API
curl http://localhost:3001/api/health

# 5. Test with frontend (see DEPLOY-FRONTEND.md)
```

---

## Troubleshooting

### "Cannot find module 'prisma'"
```bash
npm ci
npx prisma generate
npm start
```

### "EADDRINUSE: Port already in use"
- Change PORT in .env: `PORT=3002`
- Or kill process: `lsof -i :3001`

### "Database connection failed"
- Check `DATABASE_URL` format
- For SQLite: Ensure `/dev.db` directory exists
- For PostgreSQL: Verify connection string

### "CORS errors from frontend"
- Check `FRONTEND_URL` env variable matches your deployed frontend
- Verify server is running (check /api/health)
- Check browser console for exact error

### "Logs show "Render free tier killed this service""
- Free tier has memory limits (512MB)
- Consider upgrading to Render's paid plan ($7/month)
- Or use Railway (more generous free tier)

---

## Monitoring & Maintenance

### Check server status
```bash
curl https://your-api-url.app/api/health
```

### View logs
- **Railway:** Dashboard → Logs tab
- **Render:** Dashboard → Logs tab

### Update environment variables
- **Railway:** Settings → Environment → Edit
- **Render:** Environment → Edit Variables

### Redeploy
- **Railway:** Automatically on git push
- **Render:** Manually trigger or auto on git push (configure in settings)

---

## Scaling (Future)

When you outgrow free tier:

| Service | Free Tier | Paid | Monthly |
|---------|-----------|------|---------|
| Railway | $5 credit | Pay as you go | ~$5-20 |
| Render | Free | Starter | $7+ |
| Heroku | (discontinued) | Standard | $25+ |

---

## Next Steps

1. **Deploy backend** (this guide)
2. **Deploy frontend** (see DEPLOY-FRONTEND.md)
3. **Connect them** (set `FRONTEND_URL` and `VITE_API_URL`)
4. **Test in production** (verify API calls work)

---

## Support

For issues:
- Railway: [docs.railway.app](https://docs.railway.app)
- Render: [render.com/docs](https://render.com/docs)
- Node.js: [nodejs.org/docs](https://nodejs.org/docs)
