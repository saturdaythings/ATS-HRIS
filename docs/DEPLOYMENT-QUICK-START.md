# Complete Deployment Quick Start

Get your V.Two Ops app live in **10 minutes** with backend on Railway and frontend on Vercel.

---

## Architecture

```
┌─────────────────────────────────────┐
│   Frontend (React + Vite)           │
│   ├─ GitHub Pages / Vercel          │
│   └─ Communicates via VITE_API_URL  │
└──────────────┬──────────────────────┘
               │ HTTPS /api/*
┌──────────────▼──────────────────────┐
│   Backend (Express.js)              │
│   ├─ Railway / Render               │
│   └─ 25+ API routes                 │
└─────────────────────────────────────┘
```

---

## Phase 1: Deploy Backend (5 minutes)

### Quick Setup:

1. **Choose a hosting service:**
   - **Railway** (recommended) — [railway.app](https://railway.app)
   - **Render** — [render.com](https://render.com)

2. **Sign up with GitHub**

3. **Create new project → Deploy from GitHub**
   - Select `vtwo-ops` repository
   - Keep root directory as project root

4. **Add environment variables:**
   ```
   NODE_ENV=production
   FRONTEND_URL=https://your-frontend-domain.com (set after step 2)
   SESSION_SECRET=generate-random-string
   ```

5. **Deploy**
   - Railway/Render auto-deploys
   - Copy your API URL (e.g., `https://your-api.railway.app`)
   - Test: `curl https://your-api.railway.app/api/health`

**→ More details: See [DEPLOY-BACKEND.md](./DEPLOY-BACKEND.md)**

---

## Phase 2: Deploy Frontend (2 minutes)

### Quick Setup:

1. **Choose a hosting service:**
   - **Vercel** (easiest, recommended) — [vercel.com](https://vercel.com)
   - **GitHub Pages** — [pages.github.com](https://pages.github.com)

2. **Sign up with GitHub**

3. **Import project:**
   - Select `vtwo-ops` repository
   - **Root Directory:** `app` (where vite.config.js is)
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

4. **Add environment variable:**
   - `VITE_API_URL`: Your API URL from Phase 1
   - Example: `https://your-api.railway.app`

5. **Deploy**
   - Vercel/GitHub Pages auto-deploys
   - Copy your frontend URL (e.g., `https://your-app.vercel.app`)

**→ More details: See [DEPLOY-FRONTEND.md](./DEPLOY-FRONTEND.md)**

---

## Phase 3: Connect Backend & Frontend (2 minutes)

### Update Backend CORS:

1. **Go to Railway/Render dashboard**

2. **Add environment variable:**
   ```
   FRONTEND_URL=https://your-frontend-domain.vercel.app
   ```

3. **Redeploy backend**
   - Railway: Auto-deploys on env change
   - Render: Click "Redeploy"

### Test Connection:

```bash
# Open your frontend URL in browser
https://your-app.vercel.app

# Open DevTools Console
# Should see no CORS errors
# API calls should work
```

---

## Local Development Setup

### First Time:

```bash
cd /path/to/vtwo-ops

# Backend setup
cp .env.example .env
npm ci
npx prisma db push

# Frontend setup
cd app
cp .env.example .env.local
npm ci
```

### Run locally:

```bash
# Terminal 1: Backend
npm start
# → http://localhost:3001/api/health

# Terminal 2: Frontend (from app/ directory)
npm run dev
# → http://localhost:5173
```

---

## Environment Variables Reference

### Backend (.env)

```bash
# REQUIRED
NODE_ENV=production
FRONTEND_URL=https://your-frontend-domain.com
SESSION_SECRET=your-random-secret

# OPTIONAL
ANTHROPIC_API_KEY=sk-...
DATABASE_URL=file:./dev.db
PORT=3001
```

### Frontend (app/.env.local)

```bash
# OPTIONAL (auto-detected in production)
VITE_API_URL=https://your-api-domain.com
```

---

## File Structure

```
vtwo-ops/
├── server/                    # Express API (25 routes)
│   ├── index.js              # Main server
│   ├── routes/               # API endpoints
│   ├── services/             # Business logic
│   └── middleware/           # Auth, error handling
├── app/                      # React frontend (Vite)
│   ├── src/
│   │   ├── App.jsx
│   │   ├── config.js         # API configuration (NEW)
│   │   └── components/
│   ├── vite.config.js        # Build config
│   └── package.json
├── prisma/                   # Database schema
├── docs/
│   ├── DEPLOY-BACKEND.md     # Backend deployment
│   ├── DEPLOY-FRONTEND.md    # Frontend deployment
│   └── DEPLOYMENT-QUICK-START.md (this file)
└── package.json              # Root package.json
```

---

## Troubleshooting

### Backend Issues

| Error | Solution |
|-------|----------|
| "Cannot find module" | `npm ci && npx prisma generate` |
| "Port already in use" | Change `PORT` env var or kill process |
| "Database connection failed" | Check `DATABASE_URL` format |
| "CORS errors" | Set `FRONTEND_URL` env variable |

### Frontend Issues

| Error | Solution |
|-------|----------|
| "Build failed" | `cd app && npm ci && npm run build` |
| "API calls fail" | Check `VITE_API_URL` matches backend |
| "Blank page" | Check browser console for errors |
| "Env var not working" | Restart build/deployment |

---

## Monitoring & Updates

### Backend health:
```bash
curl https://your-api-domain.com/api/health
```

### Update code:
```bash
git push origin main
# - Railway auto-deploys
# - Vercel auto-deploys
# - (GitHub Pages needs Actions enabled)
```

### Update configuration:
- **Railway:** Settings → Environment
- **Vercel:** Settings → Environment Variables
- **Render:** Environment → Edit

---

## Cost Estimate (Monthly)

| Service | Free Tier | Pay-as-you-go | Notes |
|---------|-----------|---------------|-------|
| Railway (API) | $5 credit | $0-20 | Good for most apps |
| Vercel (Frontend) | Unlimited | $0 | Generous free tier |
| Database (SQLite) | Free | Free | Included in Railway/Render |
| **Total** | **~$0** | **~$5-20** | Start free, scale cheaply |

---

## Security Checklist

- [ ] `SESSION_SECRET` is unique and random (generate with `openssl rand -base64 32`)
- [ ] `FRONTEND_URL` is set to your actual frontend domain
- [ ] Database credentials are in `.env` (not in git)
- [ ] API keys (ANTHROPIC_API_KEY) are in secrets, not code
- [ ] HTTPS is enabled (automatic with Railway/Vercel)

---

## Next Steps

1. **Deploy backend** → [DEPLOY-BACKEND.md](./DEPLOY-BACKEND.md)
2. **Deploy frontend** → [DEPLOY-FRONTEND.md](./DEPLOY-FRONTEND.md)
3. **Share your app** with your team
4. **Monitor** via Railway/Vercel dashboards

---

## Support

- Deployment: See specific guides above
- Code issues: Check `/server` and `/app` READMEs
- General help:
  - Railway: [docs.railway.app](https://docs.railway.app)
  - Vercel: [vercel.com/docs](https://vercel.com/docs)
  - Node.js: [nodejs.org/docs](https://nodejs.org/docs)

---

## One-Person Maintenance Guide

### Daily
- No action needed (auto-deploy on git push)

### Weekly
- Check Railway/Vercel dashboards for errors
- Review API health: `/api/health` endpoint

### Monthly
- Review environment variables
- Check database size (if using managed DB)
- Update dependencies: `npm outdated`

### As needed
- Redeploy: `git push` or manual redeploy button
- Scale up: Change hosting plan if needed
- Debug: Check logs in Railway/Vercel dashboards

---

**Status: Ready to deploy! Start with Phase 1 (Backend).**
