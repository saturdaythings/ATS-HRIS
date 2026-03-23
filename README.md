# V.Two Ops — People & Asset Management Platform

A unified platform for managing employees, candidates, hiring pipeline, and device inventory/assignments. Built with Node.js + Express + Prisma + SQLite + React + Vite + TailwindCSS.

## Phase 1: Scaffold ✓

- ✓ Prisma schema with all data models (Candidate, Employee, Device, Assignment, Activity, etc.)
- ✓ Express API with placeholder routes (no implementation yet)
- ✓ React app with sidebar navigation and page shells
- ✓ TailwindCSS styling foundation
- ✓ Prisma database ready to initialize

## Quick Start

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

This creates the SQLite database (`dev.db`) with all tables from the Prisma schema.

### 3. Run the Project

**Terminal 1 - Server:**
```bash
npm run dev
```
Server runs on `http://localhost:3001`

**Terminal 2 - React app:**
```bash
npm run app:dev
```
App runs on `http://localhost:5173`

### 4. Verify Setup

- API health check: `curl http://localhost:3001/api/health`
- App shell: Open `http://localhost:5173` in your browser

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

## Next Steps (Phase 2 onwards)

**Phase 2 - People Core:**
- Implement candidate CRUD (sourcing, stage tracking)
- Implement employee CRUD
- Add candidate → employee promotion flow

**Phase 3 - Device Core:**
- Implement device inventory CRUD
- Implement assignment flow
- Add unassigned pool view

**Phase 4 - Onboarding & Offboarding:**
- Create checklist templates
- Trigger device assignment on hire
- Trigger device recovery on offboard

**Phase 5 - Dashboard & Polish:**
- Activity feed with real data
- Global search
- CSV export
- Session-based login
- Detail slide panel functionality

## Notes

- **No authentication in Phase 1** — Add session-based login in Phase 5
- **File attachments (Phase 2+)** — Use URL fields pointing to Google Drive/Dropbox
- **Email notifications (Later)** — Out of scope for Phase 1
- **Database** — SQLite for dev, Postgres can be swapped via `.env` (Prisma config change)

---

**Built with:** Node.js 18+ · Express 4 · Prisma 5 · SQLite · React 18 · Vite 5 · TailwindCSS 3
