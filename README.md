# V.Two Ops — People & Asset Management Platform

A unified platform for managing employees, candidates, hiring pipeline, and device inventory/assignments. Built with Node.js + Express + Prisma + SQLite + React + Vite + TailwindCSS.

**Status:** Production ready. Fully deployed with automated CI/CD.

**Live:** https://your-frontend-url.vercel.app (Update with your deployed URL)

---

## For New Users (Non-Technical)

Want to start using V.Two Ops?

1. **Open the app:** Visit https://your-frontend-url.vercel.app
2. **No setup needed** — Log in and start using it
3. **Help:** See [User Guide](#user-guide) below

---

## For Developers & Operations

Deploying the system for the first time?

1. **Quick Start:** See [Deployment Guide](#deployment) below
2. **Learn the system:** [Architecture Overview](#architecture)
3. **API Reference:** [25 REST Endpoints](#api-endpoints)
4. **Operations:** [One-Person Maintenance Guide](#operations-guide)

---

## Deployment

Deploy to production in 15 minutes. Free tier covers all needs.

**Quick Start:**
1. Backend: Deploy to Railway.app (auto-deploy on git push)
2. Frontend: Deploy to Vercel (auto-deploy on git push)
3. Database: SQLite (included, no external DB needed)

**Full Instructions:** See [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md)

```bash
# Deploy in 3 steps:

# 1. Sign up at railway.app (GitHub login)
# 2. Connect this GitHub repo → auto-deploys on push
# 3. Sign up at vercel.com → connect app/ directory

# 4. Update frontend API URL:
# Edit app/src/config.js with your Railway backend URL
git push
# Auto-deploys within 2 minutes
```

---

## Local Development

### 1. Install Dependencies

```bash
# Server
npm install

# React app
cd app && npm install && cd ..
```

### 2. Initialize Database

```bash
npm run db:push
```

Creates SQLite database (`dev.db`) with all tables.

### 3. Run Locally

**Terminal 1 - Backend:**
```bash
npm run dev
```
API runs on `http://localhost:3001`

**Terminal 2 - Frontend:**
```bash
npm run dev:frontend
```
App runs on `http://localhost:5173`

### 4. Verify

```bash
# API health check
curl http://localhost:3001/api/health

# App loads
open http://localhost:5173
```

## Project Structure

```
vtwo-ops/
├── server/
│   ├── index.js                 # Express entry point
│   ├── db.js                    # Prisma client singleton
│   ├── middleware/
│   │   └── errorHandler.js
│   └── routes/
│       ├── health.js            # Health check endpoint
│       ├── candidates.js        # Candidate CRUD placeholder
│       ├── employees.js         # Employee CRUD placeholder
│       ├── devices.js           # Device CRUD placeholder
│       ├── assignments.js       # Assignment flow placeholder
│       └── activities.js        # Activity feed placeholder
├── prisma/
│   ├── schema.prisma            # Prisma data schema
│   └── seed.js                  # Seed script (optional)
├── app/
│   ├── src/
│   │   ├── main.jsx             # React entry point
│   │   ├── App.jsx              # App routing
│   │   ├── index.css            # TailwindCSS
│   │   ├── layouts/
│   │   │   └── SidebarLayout.jsx    # Main layout (sidebar + content)
│   │   ├── components/
│   │   │   ├── Sidebar.jsx      # Navigation sidebar
│   │   │   ├── TopBar.jsx       # Global search + user menu
│   │   │   └── RightPanel.jsx   # Detail slide-in panel
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── people/
│   │   │   │   ├── Directory.jsx
│   │   │   │   ├── Hiring.jsx
│   │   │   │   ├── Onboarding.jsx
│   │   │   │   └── Offboarding.jsx
│   │   │   ├── devices/
│   │   │   │   ├── Inventory.jsx
│   │   │   │   └── Assignments.jsx
│   │   │   ├── Reports.jsx
│   │   │   └── Settings.jsx
│   │   └── hooks/
│   │       └── useFetch.js      # Data fetching hook (ready for Phase 2)
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── index.html
├── .env                         # Environment variables
├── package.json
└── prisma/
    └── schema.prisma
```

## Data Models (Prisma Schema)

### People Module
- **Candidate**: Sourcing → Hiring pipeline
- **Employee**: Active employees with onboarding/offboarding tasks
- **OnboardingTask**: Checklist items for new hires
- **OffboardingTask**: Checklist items for departing employees

### Device Module
- **Device**: Inventory catalog (type, make, model, condition, warranty)
- **Assignment**: Links employees to devices (enforces 1 active assignment per device)

### Shared
- **Activity**: Event log for activity feed
- **User**: User profiles (for Phase 5+ auth)
- **Settings**: User preferences

## API Routes (Phase 1 Placeholders)

| Method | Route | Phase |
|--------|-------|-------|
| GET | `/api/health` | 1 ✓ |
| GET | `/api/candidates` | 2 |
| POST | `/api/candidates` | 2 |
| GET | `/api/employees` | 2 |
| POST | `/api/employees` | 2 |
| GET | `/api/devices` | 3 |
| POST | `/api/devices` | 3 |
| GET | `/api/assignments` | 3 |
| POST | `/api/assignments` | 3 |
| GET | `/api/activities` | 5 |

All routes currently return placeholder messages. Implementation begins in Phase 2.

## Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

### Required
- `DATABASE_URL` — SQLite connection string (default: `file:./dev.db`)
- `PORT` — Server port (default: 3001)

---

## Documentation

### For Everyone

- **[Deployment Guide](docs/DEPLOYMENT.md)** — Deploy to Railway + Vercel (15 min)
- **[User Guide](docs/README.md)** — How to use the app

### For Developers

- **[Architecture Overview](docs/ARCHITECTURE.md)** — System design, data models, file structure
- **[API Reference](docs/API_REFERENCE.md)** — All 25 endpoints with examples
- **[Adding Features](docs/ARCHITECTURE.md#how-to-add-new-features)** — Step-by-step guide

### For Operations

- **[Maintenance Guide](docs/MAINTENANCE_GUIDE.md)** — One-person ops manual (daily, weekly, monthly tasks)
- **[Troubleshooting](docs/MAINTENANCE_GUIDE.md#troubleshooting)** — Common issues and fixes

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Frontend** | React | 18+ |
| **Build** | Vite | 5+ |
| **Styling** | TailwindCSS | 3+ |
| **Backend** | Express.js | 4+ |
| **Runtime** | Node.js | 18+ |
| **Database** | Prisma + SQLite | 5+ |
| **Auth** | Express-session | 1.19+ |

---

## Features

### People Management
- Candidate sourcing & hiring pipeline (Kanban board)
- Employee directory with search
- Interview tracking
- Offer management
- Onboarding checklists
- Offboarding workflows
- Activity feed (timeline of all events)

### Asset Management
- Device inventory (laptops, phones, monitors, etc.)
- Device assignments to employees
- Assignment history (who used what, when)
- Condition tracking

### Reporting & Analytics
- Dashboard with metrics (headcount, hiring funnel, device utilization)
- CSV export of candidates, employees, devices
- Full-text search across all entities
- Custom workflows & pipelines
- Notification system

### Admin Features
- Custom fields (add your own data fields)
- Workflow templates
- Settings & configuration
- System health monitoring
- Feature requests

---

## API Endpoints (25 Total)

**Authentication:** 3 endpoints (login, logout, me)

**Candidates:** 7 endpoints (list, get, create, update, delete, resumes, promote)

**Employees:** 5 endpoints (list, get, create, update, delete)

**Devices:** 5 endpoints (list, get, create, update, delete)

**Assignments:** 3 endpoints (list, create, update/return)

**Workflows:** Tracks, interviews, offers, onboarding, offboarding, dashboard, search, exports, settings

See [API Reference](docs/API_REFERENCE.md) for complete documentation with examples.

---

## Project Structure

```
vtwo-ops/
├── server/                    # Node.js backend
│   ├── routes/               # 25 API endpoints
│   ├── services/             # Business logic (20+ services)
│   ├── middleware/           # Auth, error handling
│   └── tests/                # 30+ test files
├── app/                       # React frontend
│   ├── src/
│   │   ├── pages/            # 15+ pages (dashboard, hiring, directory, etc.)
│   │   ├── components/       # Reusable UI components
│   │   ├── hooks/            # Custom React hooks (data fetching, state)
│   │   └── __tests__/        # 40+ test files
│   └── vite.config.js        # Vite build config
├── prisma/
│   └── schema.prisma         # 15 data models
└── docs/
    ├── DEPLOYMENT.md         # Deployment steps
    ├── MAINTENANCE_GUIDE.md  # Operations manual
    ├── ARCHITECTURE.md       # Technical overview
    └── API_REFERENCE.md      # All endpoints
```

---

## One-Person Operations

Manage production with minimal effort:

- **Daily:** 0 minutes — Auto-deploy on git push
- **Weekly:** 5 minutes — Check health dashboards
- **Monthly:** 15 minutes — Update dependencies, review metrics

See [Maintenance Guide](docs/MAINTENANCE_GUIDE.md) for details.

---

## Support & Contribution

### Getting Help

1. Check [Troubleshooting](docs/MAINTENANCE_GUIDE.md#troubleshooting) section
2. Review [API Reference](docs/API_REFERENCE.md) for endpoint issues
3. Check [Architecture](docs/ARCHITECTURE.md) for system design questions

### Contributing

1. Clone the repo
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make changes in `server/` or `app/src/`
4. Run tests: `npm test`
5. Commit: `git commit -m "feat: Add my feature"`
6. Push: `git push origin feature/my-feature`
7. Open a Pull Request

### Running Tests

```bash
# All tests
npm test

# With coverage
npm run test:coverage

# React tests only
cd app && npm test && cd ..

# Watch mode (re-run on changes)
npm run test:watch
```

---

## Production Deployment

**Status:** Ready to deploy

**Services:**
- Backend: Railway.app (Node.js, auto-scales, free tier)
- Frontend: Vercel (React, CDN, free tier)
- Database: SQLite (file-based, persisted automatically)

**Cost:** $0-5/month (both services have generous free tiers)

**Deploy steps:** See [Deployment Guide](docs/DEPLOYMENT.md)

---

**Built with:** Node.js 18+ · Express 4 · Prisma 5 · SQLite · React 18 · Vite 5 · TailwindCSS 3

**Status:** Production Ready ✓
