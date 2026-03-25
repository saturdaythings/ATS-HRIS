# V.Two Ops - Deployment Documentation

Complete guide for deploying and maintaining V.Two Ops on free tiers.

---

## Start Here

**First time deploying?** Start with [DEPLOYMENT-CHECKLIST.md](../DEPLOYMENT-CHECKLIST.md) for a step-by-step walkthrough.

**Want the quick overview?** See [DEPLOYMENT-QUICK-START.md](./DEPLOYMENT-QUICK-START.md).

---

## Documentation Structure

### Deployment Guides

| Document | Purpose | Time | Audience |
|----------|---------|------|----------|
| [DEPLOYMENT-CHECKLIST.md](../DEPLOYMENT-CHECKLIST.md) | Step-by-step checklist to deploy everything | 10 min | First-time deployers |
| [DEPLOYMENT-QUICK-START.md](./DEPLOYMENT-QUICK-START.md) | Architecture overview and 3-phase deployment | 10 min | New users |
| [DEPLOY-BACKEND.md](./DEPLOY-BACKEND.md) | Complete backend deployment guide | 5 min | Backend setup |
| [DEPLOY-FRONTEND.md](./DEPLOY-FRONTEND.md) | Complete frontend deployment guide | 2 min | Frontend setup |

### Operations & Maintenance

| Document | Purpose | Time | Audience |
|----------|---------|------|----------|
| [MAINTENANCE.md](./MAINTENANCE.md) | One-person operations guide | 2-10 min | Ongoing operations |
| [DEPLOYMENT-PREPARATION-REPORT.md](./DEPLOYMENT-PREPARATION-REPORT.md) | What was prepared and why | 5 min | Technical review |

---

## The Deployment Process

```
┌─────────────────────────────────────────────────────────────┐
│                  10-Minute Deployment Flow                  │
└─────────────────────────────────────────────────────────────┘

Step 1: Deploy Backend (5 min)
├─ Sign up at railway.app
├─ Connect GitHub repository
├─ Set environment variables
└─ Get API URL

Step 2: Deploy Frontend (2 min)
├─ Sign up at vercel.com
├─ Connect GitHub repository
├─ Set VITE_API_URL to backend URL
└─ Get frontend URL

Step 3: Connect Services (1 min)
├─ Set FRONTEND_URL in backend
└─ Verify everything works

Result: Both services live and connected!
```

---

## Key Files Changed/Created

### Backend Preparation
```
server/index.js              ← Updated CORS configuration
package.json                 ← Added start script
.env.example                 ← Documented all variables
```

### Frontend Preparation
```
app/src/config.js            ← NEW: API configuration utility
app/.env.example             ← NEW: Frontend env template
app/vite.config.js           ← Updated for env support
app/.gitignore               ← Already configured
frontend/.gitignore          ← NEW: For static files
```

### Documentation Created
```
docs/DEPLOY-BACKEND.md                     ← Backend guide
docs/DEPLOY-FRONTEND.md                    ← Frontend guide
docs/DEPLOYMENT-QUICK-START.md             ← 10-min overview
docs/DEPLOYMENT-PREPARATION-REPORT.md      ← What was done
docs/MAINTENANCE.md                        ← Ops guide
.github/workflows/deploy-frontend.yml      ← Auto-deploy workflow
DEPLOYMENT-CHECKLIST.md                    ← Step-by-step checklist
```

---

## Architecture

```
┌──────────────────────────────┐
│   Frontend (React + Vite)    │
│   https://your-app.vercel.app│
└──────────────┬───────────────┘
               │
               │ HTTPS /api/*
               │ VITE_API_URL env var
               │
┌──────────────▼───────────────┐
│  Backend (Express + Prisma)  │
│  https://your-api.railway.app│
│                              │
│  ✓ 25+ routes              │
│  ✓ Prisma database         │
│  ✓ CORS configured         │
│  ✓ Environment-aware       │
└──────────────────────────────┘
```

---

## What's Ready

### Backend ✅
- [x] `npm start` command ready
- [x] CORS configured for production
- [x] Environment variables documented
- [x] Railway/Render compatible
- [x] Dockerfile prepared

### Frontend ✅
- [x] `npm run build` ready
- [x] API configuration system (config.js)
- [x] Environment variables support
- [x] Vercel/GitHub Pages compatible
- [x] GitHub Actions workflow ready

### Documentation ✅
- [x] Deployment guides (backend + frontend)
- [x] Quick start guide
- [x] Maintenance guide
- [x] Troubleshooting steps
- [x] Checklist for first deployment

### Monitoring ✅
- [x] Railroad dashboard (backend logs)
- [x] Vercel dashboard (frontend logs)
- [x] Health check endpoint
- [x] One-person maintenance guide

---

## Costs

| Service | Free Tier | Monthly Cost | Best For |
|---------|-----------|--------------|----------|
| Railway (API) | $5 credit | ~$0-5 | Backend |
| Vercel (Frontend) | Unlimited | $0 | Frontend |
| Database | Included | $0-5 | Data storage |
| **Total** | **~$5** | **$0-10** | Startup |

**No credit card required to start** — Both Railway and Vercel offer free tiers with GitHub login.

---

## Environment Variables Reference

### Backend (.env)
```bash
NODE_ENV=production
FRONTEND_URL=https://your-frontend.vercel.app
SESSION_SECRET=random-string-from-openssl
ANTHROPIC_API_KEY=sk-... (optional)
DATABASE_URL=file:./dev.db
PORT=3001
```

### Frontend (app/.env.local)
```bash
VITE_API_URL=https://your-api.railway.app
```

---

## Quick Commands

```bash
# Local development
npm start                    # Backend on localhost:3001
cd app && npm run dev       # Frontend on localhost:5173

# Building for production
cd app && npm run build     # Creates app/dist/
npm run build:all          # Build + database migrations

# Database
npx prisma db push         # Apply schema changes
npx prisma studio          # Open database GUI
npx prisma migrate deploy  # Run migrations

# Testing
npm test                   # Backend tests
cd app && npm test        # Frontend tests
```

---

## Troubleshooting

### "Backend won't start"
```bash
npm ci
npx prisma generate
npm start
```

### "Frontend won't build"
```bash
cd app
npm ci
npm run build
```

### "CORS errors"
- Check `FRONTEND_URL` in backend environment
- Verify backend has `CORS` middleware enabled
- Redeploy backend after changing env var

### "API calls return 404"
- Check `VITE_API_URL` in frontend environment
- Verify backend API is running
- Check browser DevTools Network tab for actual URL being called

### "Can't deploy to Railway/Vercel"
- Ensure GitHub repository is public (or enable private repo access)
- Check that you've authorized the app
- Verify repository structure is correct

---

## Next Steps

1. **Choose your deployment method:**
   - Quick: See [DEPLOYMENT-CHECKLIST.md](../DEPLOYMENT-CHECKLIST.md)
   - Detailed: See [DEPLOY-BACKEND.md](./DEPLOY-BACKEND.md) + [DEPLOY-FRONTEND.md](./DEPLOY-FRONTEND.md)

2. **Deploy backend** to Railway (5 minutes)
   - Follow [DEPLOY-BACKEND.md](./DEPLOY-BACKEND.md)
   - Copy your API URL

3. **Deploy frontend** to Vercel (2 minutes)
   - Follow [DEPLOY-FRONTEND.md](./DEPLOY-FRONTEND.md)
   - Set `VITE_API_URL` to your backend URL

4. **Connect & verify** (1 minute)
   - Set `FRONTEND_URL` in backend
   - Open frontend URL and test

5. **Share with your team**
   - Give them the frontend URL
   - They can start using immediately

---

## Support

| Issue | Resource |
|-------|----------|
| Railway problems | [docs.railway.app](https://docs.railway.app) |
| Vercel problems | [vercel.com/docs](https://vercel.com/docs) |
| Node.js issues | [nodejs.org/docs](https://nodejs.org/docs) |
| Database issues | [prisma.io/docs](https://prisma.io/docs) |
| React issues | [react.dev](https://react.dev) |
| Express issues | [expressjs.com](https://expressjs.com) |

---

## File Organization

```
vtwo-ops/
├── server/                      # Express API (25 routes)
│   ├── routes/
│   ├── services/
│   ├── middleware/
│   └── index.js                 # ← Updated CORS config
├── app/                         # React frontend
│   ├── src/
│   │   ├── config.js            # ← NEW: API configuration
│   │   ├── App.jsx
│   │   └── components/
│   ├── vite.config.js           # ← Updated env support
│   ├── .env.example             # ← NEW
│   ├── .gitignore               # ← Configured
│   └── package.json
├── frontend/                    # Static files directory
│   ├── .gitignore               # ← NEW
│   └── (for future use)
├── prisma/                      # Database schema
├── docs/                        # Documentation (NEW)
│   ├── DEPLOY-BACKEND.md        # ← NEW: 5-minute guide
│   ├── DEPLOY-FRONTEND.md       # ← NEW: 2-minute guide
│   ├── DEPLOYMENT-QUICK-START.md # ← NEW: Overview
│   ├── DEPLOYMENT-PREPARATION-REPORT.md # ← NEW
│   ├── MAINTENANCE.md           # ← NEW: Ops guide
│   └── README.md                # ← This file
├── .github/
│   └── workflows/
│       └── deploy-frontend.yml  # ← NEW: Auto-deploy
├── .env.example                 # ← Updated
├── .env.production              # Already exists
├── package.json                 # ← Updated start script
├── Dockerfile                   # Already ready
├── DEPLOYMENT-CHECKLIST.md      # ← NEW: Step-by-step
└── README.md                    # Project README
```

---

## Success Criteria

Your deployment is successful when:

- ✅ Frontend loads at `https://your-app.vercel.app`
- ✅ Backend responds to `https://your-api.railway.app/api/health`
- ✅ No CORS errors in browser console
- ✅ Frontend can make API calls and display data
- ✅ Pushing to `main` branch auto-deploys both services

---

## One-Person Operations

Managing both services takes minimal time:

| Frequency | Task | Time |
|-----------|------|------|
| Daily | Nothing! Auto-deploy handles updates | 0 min |
| Weekly | Check dashboards for errors | 5 min |
| Monthly | Update dependencies (optional) | 10 min |
| As needed | Check logs if something breaks | 5-10 min |

**Total monthly time:** ~30 minutes (mostly optional)

---

## Questions?

- **How do I deploy?** → See [DEPLOYMENT-CHECKLIST.md](../DEPLOYMENT-CHECKLIST.md)
- **What if something breaks?** → See [MAINTENANCE.md](./MAINTENANCE.md)
- **Can I use GitHub Pages instead?** → Yes, see [DEPLOY-FRONTEND.md](./DEPLOY-FRONTEND.md)
- **Can I use Render instead of Railway?** → Yes, see [DEPLOY-BACKEND.md](./DEPLOY-BACKEND.md)
- **How much does this cost?** → See "Costs" section above

---

**Ready to deploy?** Start with [DEPLOYMENT-CHECKLIST.md](../DEPLOYMENT-CHECKLIST.md) — it'll guide you through everything!
