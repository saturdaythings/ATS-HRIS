# V.Two Ops Full Implementation Plan (Phases 1-9)

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` to execute this plan. Spawn fresh agents per phase, coordinate with Ruflo swarms for parallel execution. Each phase produces deployable, testable software.

**Goal:** Build a complete internal ATS + onboarding/offboarding + device inventory platform matching Rippling's UX patterns.

**Architecture:** Express.js REST API (Node.js 20+) with Prisma ORM (SQLite), React + Vite frontend with TailwindCSS, session-based auth, role-based access (admin/viewer), configurable dropdown system via ConfigList.

**Tech Stack:** Node.js + Express, Prisma ORM, SQLite (dev, Postgres-swappable), React 18 + Vite, TailwindCSS, Jest (testing), bcrypt (password hashing), express-session (auth), supertest (API testing).

---

## Implementation Roadmap (9 Phases)

| Phase | Focus | Status |
|-------|-------|--------|
| 1 | Schema ✅, API skeleton, React shell | READY |
| 2 | Auth, Settings (Users + Lists) | PLANNED |
| 3 | Candidates ATS (list, filters, detail, resume, duplicate detection) | PLANNED |
| 4 | Hiring pipeline (stage progression, offers, promote-to-hired) | PLANNED |
| 5 | Track template management (CRUD, task templates, due offsets) | PLANNED |
| 6 | Onboarding/offboarding runs (task tracking, progress, due dates) | PLANNED |
| 7 | Employee directory, device inventory, device assignments | PLANNED |
| 8 | Dashboard (count cards, stale candidates, interviews, tasks, feed) | PLANNED |
| 9 | Reports, CSV export, global search, polish, production readiness | PLANNED |

---

# PHASE 1: Foundation & API Skeleton ✅ (Schema Complete)

**Goals:**
- Verify Prisma schema applies cleanly ✅
- Create Express API skeleton with all route files
- Create React app shell with sidebar navigation, routing, layout
- Seed database with ConfigList defaults (candidate_source, seniority, etc.)
- Verify build/dev pipeline works

**Status:** Schema migrated. API skeleton and React shell needed.

---

## Phase 1 Tasks

### Task 1.1: Express API Skeleton (Routes)

**Files:**
- Create: `server/routes/auth.js` (placeholder POST /login, /logout, /session)
- Create: `server/routes/settings.js` (GET/POST /lists, /users — placeholder)
- Create: `server/routes/candidates.js` (GET/POST/PATCH/DELETE /candidates — placeholder)
- Create: `server/routes/employees.js` (GET /employees — placeholder)
- Create: `server/routes/interviews.js` (GET/POST/PATCH /interviews — placeholder)
- Create: `server/routes/offers.js` (GET/POST /offers — placeholder)
- Create: `server/routes/devices.js` (GET /devices — placeholder)
- Create: `server/routes/onboarding.js` (GET /onboarding-runs — placeholder)
- Create: `server/routes/dashboard.js` (GET /dashboard/metrics — placeholder)
- Modify: `server/index.js` — Mount all routes, add CORS, session middleware

**Implementation:**

Each route file is minimal — returns `{ message: "Phase X" }` with correct HTTP methods. Example:

```javascript
// server/routes/candidates.js
import express from 'express';
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ message: 'GET /api/candidates', phase: 1 });
});

router.post('/', (req, res) => {
  res.status(201).json({ message: 'POST /api/candidates', phase: 1 });
});

router.patch('/:id', (req, res) => {
  res.json({ message: 'PATCH /api/candidates/:id', phase: 1 });
});

router.delete('/:id', (req, res) => {
  res.status(204).send();
});

export default router;
```

Update `server/index.js` to mount all routes:
```javascript
import candidatesRouter from './routes/candidates.js';
import employeesRouter from './routes/employees.js';
// ... all imports

app.use('/api/candidates', candidatesRouter);
app.use('/api/employees', employeesRouter);
// ... all mounts

app.listen(3001, () => {
  console.log('Server running on port 3001');
});
```

- [ ] **Step 1: Create all route files (8 routes, each ~30 lines)**

See examples above. Each returns placeholder message.

- [ ] **Step 2: Update server/index.js to mount routes**

Add imports and `app.use()` statements.

- [ ] **Step 3: Verify API responds**

```bash
npm run dev &  # Start backend
curl http://localhost:3001/api/candidates
# Expected: {"message": "GET /api/candidates", "phase": 1}
```

- [ ] **Step 4: Commit**

```bash
git add server/routes/*.js server/index.js
git commit -m "feat: phase 1 API skeleton with all route files"
```

---

### Task 1.2: React App Shell (Layout, Navigation, Routing)

**Files:**
- Create: `app/src/layouts/MainLayout.jsx` (sidebar + top bar + main area)
- Create: `app/src/components/Sidebar.jsx` (navigation menu)
- Create: `app/src/components/TopBar.jsx` (global search placeholder, user menu)
- Create: `app/src/pages/Dashboard.jsx` (landing page)
- Modify: `app/src/App.jsx` — Set up React Router with all pages

**Implementation:**

**MainLayout.jsx** — Fixed sidebar (200px), top bar (60px), main area fills rest:

```javascript
import React from 'react';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';

export default function MainLayout({ children }) {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main area */}
      <div className="flex-1 flex flex-col">
        <TopBar />
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
```

**Sidebar.jsx** — Navigation links for all sections:

```javascript
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const menuItems = [
  { path: '/', label: 'Dashboard', icon: 'Home' },
  { path: '/candidates', label: 'Candidates', icon: 'Users' },
  { path: '/employees', label: 'Employees', icon: 'Users' },
  { path: '/onboarding', label: 'Onboarding', icon: 'CheckCircle' },
  { path: '/devices', label: 'Devices', icon: 'Package' },
  { path: '/tracks', label: 'Tracks', icon: 'Template' },
  { path: '/reports', label: 'Reports', icon: 'BarChart' },
  { path: '/settings', label: 'Settings', icon: 'Settings' },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="w-64 bg-white border-r border-gray-200 p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-8">V.Two Ops</h2>
      <nav className="space-y-2">
        {menuItems.map(item => (
          <Link
            key={item.path}
            to={item.path}
            className={`block px-4 py-2 rounded ${
              location.pathname === item.path
                ? 'bg-purple-100 text-purple-900'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
```

**App.jsx** — Router setup:

```javascript
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import Candidates from './pages/Candidates';
import Employees from './pages/Employees';
import Onboarding from './pages/Onboarding';
import Devices from './pages/Devices';
import Tracks from './pages/Tracks';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

export default function App() {
  return (
    <BrowserRouter>
      <MainLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/candidates" element={<Candidates />} />
          <Route path="/employees" element={<Employees />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/devices" element={<Devices />} />
          <Route path="/tracks" element={<Tracks />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </MainLayout>
    </BrowserRouter>
  );
}
```

Create placeholder pages (each ~20 lines):
- `app/src/pages/Dashboard.jsx` — `<h1>Dashboard</h1>`
- `app/src/pages/Candidates.jsx` — `<h1>Candidates</h1>`
- `app/src/pages/Employees.jsx` — `<h1>Employees</h1>`
- (etc. for all pages)

- [ ] **Step 1: Create MainLayout.jsx, Sidebar.jsx, TopBar.jsx**

See code above.

- [ ] **Step 2: Create placeholder page components (8 pages)**

Each page: `<div><h1>{Page Name}</h1></div>`

- [ ] **Step 3: Update App.jsx with React Router**

See code above.

- [ ] **Step 4: Verify app loads**

```bash
npm run app:dev
# Navigate to http://localhost:5173
# Expected: V.Two Ops sidebar with navigation, Dashboard page loads
```

- [ ] **Step 5: Commit**

```bash
git add app/src/layouts/ app/src/components/Sidebar.jsx app/src/components/TopBar.jsx app/src/pages/ app/src/App.jsx
git commit -m "feat: phase 1 react app shell with sidebar, top bar, routing"
```

---

### Task 1.3: Seed ConfigList Defaults

**Files:**
- Create: `prisma/seed.js` — Seed ConfigList items
- Modify: `package.json` — Add `db:seed` script

**Implementation:**

```javascript
// prisma/seed.js
import { db } from '../server/db.js';

async function seed() {
  console.log('Seeding ConfigLists...');

  // Create lists
  const sourceList = await db.configList.create({
    data: { name: 'candidate_source', description: 'Where candidates come from' },
  });

  const seniorityList = await db.configList.create({
    data: { name: 'seniority', description: 'Seniority level' },
  });

  const skillTagsList = await db.configList.create({
    data: { name: 'skill_tags', description: 'Skills/tags' },
  });

  const rejectionReasonList = await db.configList.create({
    data: { name: 'rejection_reason', description: 'Why candidate was rejected' },
  });

  const interviewFormatList = await db.configList.create({
    data: { name: 'interview_format', description: 'Interview format' },
  });

  // Add items to candidate_source
  await db.configListItem.createMany({
    data: [
      { listId: sourceList.id, label: 'LinkedIn', value: 'linkedin', order: 1 },
      { listId: sourceList.id, label: 'Referral', value: 'referral', order: 2 },
      { listId: sourceList.id, label: 'Job Board', value: 'job_board', order: 3 },
      { listId: sourceList.id, label: 'Direct', value: 'direct', order: 4 },
    ],
  });

  // Add items to seniority
  await db.configListItem.createMany({
    data: [
      { listId: seniorityList.id, label: 'Junior', value: 'junior', order: 1 },
      { listId: seniorityList.id, label: 'Mid', value: 'mid', order: 2 },
      { listId: seniorityList.id, label: 'Senior', value: 'senior', order: 3 },
      { listId: seniorityList.id, label: 'Lead', value: 'lead', order: 4 },
    ],
  });

  // Add items to interview_format
  await db.configListItem.createMany({
    data: [
      { listId: interviewFormatList.id, label: 'Phone', value: 'phone', order: 1 },
      { listId: interviewFormatList.id, label: 'Video', value: 'video', order: 2 },
      { listId: interviewFormatList.id, label: 'Onsite', value: 'onsite', order: 3 },
    ],
  });

  console.log('✅ Seed complete');
}

seed();
```

Update `package.json`:
```json
{
  "scripts": {
    "db:seed": "node prisma/seed.js"
  }
}
```

- [ ] **Step 1: Create prisma/seed.js**

See code above.

- [ ] **Step 2: Update package.json**

Add `db:seed` script.

- [ ] **Step 3: Run seed**

```bash
npm run db:seed
# Expected: ✅ Seed complete
```

- [ ] **Step 4: Verify in database**

```bash
npx prisma studio
# Navigate to ConfigList table, verify lists and items exist
```

- [ ] **Step 5: Commit**

```bash
git add prisma/seed.js package.json
git commit -m "feat: phase 1 seed configlist defaults"
```

---

### Task 1.4: Verify Build & Dev Pipeline

**Files:**
- Modify: `server/index.js` — Add health check endpoint
- Modify: `app/vite.config.js` — Verify proxy to API

**Implementation:**

Add health check to `server/index.js`:
```javascript
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});
```

Verify `app/vite.config.js` has proxy:
```javascript
export default defineConfig({
  server: {
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
});
```

- [ ] **Step 1: Add health check endpoint**

```bash
curl http://localhost:3001/api/health
# Expected: {"status":"ok","timestamp":"2026-03-24T..."}
```

- [ ] **Step 2: Verify frontend → API proxy**

In browser DevTools, make API call from frontend, verify request goes to localhost:3001.

- [ ] **Step 3: Commit**

```bash
git add server/index.js app/vite.config.js
git commit -m "feat: phase 1 health check and verify dev pipeline"
```

---

# PHASE 2: Auth & Settings

**Goals:**
- Session-based auth (login, logout, session check)
- Password hashing (bcrypt)
- Settings > Users (admin invites users, manage roles)
- Settings > Lists (CRUD ConfigList items)
- Role-based query filtering (admin vs. viewer)

**Status:** Planned. Depends on Phase 1 ✅

---

## Phase 2 Overview

### Task 2.1: Session & Auth Middleware
- Login POST /api/auth/login (email, password)
- Logout POST /api/auth/logout
- Session check GET /api/auth/session
- Middleware: requireAuth, requireAdmin
- Seed initial admin user (email: admin@example.com, password: changeme)

### Task 2.2: Settings > Users
- GET /api/settings/users (admin only)
- POST /api/settings/users/invite (admin only)
- PATCH /api/settings/users/:id/role (admin only)
- DELETE /api/settings/users/:id (admin only, not self)
- UI: User list, invite form, role dropdown

### Task 2.3: Settings > Lists
- GET /api/settings/lists (all users)
- GET /api/settings/lists/:id/items (all users)
- POST /api/settings/lists/:id/items (admin only)
- PATCH /api/settings/lists/:id/items/:itemId (admin only)
- DELETE /api/settings/lists/:id/items/:itemId (admin only)
- UI: Lists on left, items on right, drag-to-reorder, add/edit/delete

### Task 2.4: RBAC Middleware
- Query-level filtering: viewers see limited data
- Response filtering: don't expose sensitive fields to viewers
- Endpoint protection: admin-only endpoints reject viewers

---

# PHASE 3: Candidates ATS

**Goals:**
- Candidate list with filtering (stage, status, source, seniority, client, tags, date range)
- Sorting by any column
- Create/edit candidate form
- Candidate detail panel (right slide-in)
- Resume management (list, upload, set active, view)
- Duplicate detection (same email)
- Interview logging (schedule, mark completed, add feedback)
- Skill tag management (multi-select)

**Status:** Planned. Depends on Phase 2.

---

## Phase 3 Overview

### Task 3.1: Candidates API
- GET /api/candidates (with filters & sorting)
- POST /api/candidates (create, with duplicate check)
- GET /api/candidates/:id (detail with resumes, interviews, offers)
- PATCH /api/candidates/:id (update)
- DELETE /api/candidates/:id (soft delete by marking rejected)

### Task 3.2: Resumes API
- POST /api/candidates/:id/resumes (upload, returns fileUrl)
- GET /api/candidates/:id/resumes (list versions)
- PATCH /api/candidates/:id/resumes/:resumeId (set active)
- DELETE /api/candidates/:id/resumes/:resumeId (delete version)

### Task 3.3: Candidate Detail UI
- Candidate list page (table with filters, sorting)
- Click row → slide-in detail panel
- Tabs: Overview, Resume, Interviews, Skills
- Edit form in Overview tab
- Resume list + upload in Resume tab
- Interview history in Interviews tab
- Skill tags multi-select in Skills tab

### Task 3.4: Duplicate Detection
- On candidate create, check for email match
- Show modal: "Possible duplicate found. View? Merge? Proceed?"
- Merge workflow: copy notes, resumes, interviews to existing

---

# PHASE 4: Hiring Pipeline

**Goals:**
- Stage progression (applied → screening → interview → offer → hired/rejected)
- Offer creation & status tracking
- Promote-to-employee workflow (create Employee, apply tracks, select track instances)
- Rejection workflow (set status=rejected, select reason)

**Status:** Planned. Depends on Phase 3.

---

## Phase 4 Overview

### Task 4.1: Stage Progression
- PATCH /api/candidates/:id (update stage)
- Update latestStageChangeAt timestamp
- Validation: only move forward (or to rejected)

### Task 4.2: Offer Management
- POST /api/offers (create offer for candidate)
- PATCH /api/offers/:id (update status, compensation, dates)
- GET /api/candidates/:id/offers (list offers for candidate)
- Offer detail view in candidate detail panel

### Task 4.3: Promote-to-Employee Flow
- Button: "Promote to Employee" in candidate detail
- Modal workflow:
  1. Confirm details (name, email, title, department, start date)
  2. Auto-apply company tracks
  3. Suggest role + client tracks
  4. User selects which tracks to apply
  5. Create Employee, OnboardingRun per track, TaskInstances
  6. Show success: "Employee created, 3 onboarding runs created"

### Task 4.4: Rejection Workflow
- Button: "Reject" in candidate detail
- Modal: select rejection reason from ConfigList
- PATCH /api/candidates/:id (status=rejected, rejectionReasonId)
- Confirmation modal

---

# PHASE 5: Track Template Management

**Goals:**
- Track template CRUD (company, role, client types)
- Auto-apply logic for company tracks
- Task template CRUD with due day offsets
- Reorder tasks (drag-to-reorder)
- Preview onboarding timeline

**Status:** Planned. Depends on Phase 4.

---

## Phase 5 Overview

### Task 5.1: Track Template API
- GET /api/tracks
- POST /api/tracks (create company/role/client track)
- PATCH /api/tracks/:id (update name, description, autoApply)
- DELETE /api/tracks/:id (soft delete)

### Task 5.2: Task Template API
- POST /api/tracks/:trackId/tasks (create task template)
- PATCH /api/tracks/:trackId/tasks/:taskId (update name, dueDaysOffset, ownerRole, order)
- DELETE /api/tracks/:trackId/tasks/:taskId
- GET /api/tracks/:trackId/tasks (list with order)

### Task 5.3: Track Management UI
- List of tracks (with type badge: company/role/client)
- Click track → edit panel with track details + task list
- Task list: drag-to-reorder, add button, edit modal per task
- Task modal: name, description, ownerRole dropdown, dueDaysOffset (can be negative), order
- Delete confirmation

### Task 5.4: Preview Timeline
- Show timeline: -14 (pre-onboarding), Day 0, Day 1, Week 1, 30-day, 90-day
- Place tasks on timeline based on dueDaysOffset
- Color-code by ownerRole (ops, pm, hiring_manager, etc.)

---

# PHASE 6: Onboarding/Offboarding Runs

**Goals:**
- Onboarding run list (in_progress, completed, pending)
- Task list per run with status toggles
- Progress percentage
- Due date highlighting (overdue, due soon, on track)
- Bulk task completion (mark multiple as done)

**Status:** Planned. Depends on Phase 5.

---

## Phase 6 Overview

### Task 6.1: Onboarding Run API
- GET /api/employees/:employeeId/onboarding-runs
- GET /api/onboarding-runs/:runId (with tasks)
- PATCH /api/onboarding-runs/:runId (update status)
- GET /api/dashboard/pending-tasks (tasks due next 7 days)

### Task 6.2: Task Instance API
- PATCH /api/onboarding-runs/:runId/tasks/:taskId (update status, completed_at, notes)
- Mark as: pending, in_progress, complete, skipped

### Task 6.3: Onboarding Run UI
- Onboarding page: list of employees with active runs
- Click employee → show run with task list
- Task row: [checkbox] Task Name | Owner | Due Date | Status dropdown
- Progress bar: X% complete
- Bulk actions: Mark all as complete, print checklist

### Task 6.4: Offboarding
- Similar flow but type=offboarding
- Offboarding runs created when Employee.status → offboarded
- Task list (device return, access removal, etc.)

---

# PHASE 7: Employee Directory & Device Inventory

**Goals:**
- Employee table (list, filters by department/status, sort by name/start date)
- Employee detail panel
- Onboarding progress in detail panel
- Device inventory table
- Device assignment workflow
- Return device workflow with condition tracking

**Status:** Planned. Depends on Phase 6.

---

## Phase 7 Overview

### Task 7.1: Employee API
- GET /api/employees (with filters & sort)
- GET /api/employees/:id (detail with devices, onboarding status)
- PATCH /api/employees/:id (update title, department, status)
- Soft delete (mark as offboarded)

### Task 7.2: Employee Directory UI
- Table: Name | Email | Title | Department | Start Date | Status | Actions
- Filters: Department, Status (active/offboarded)
- Click row → detail panel with tabs: Overview, Onboarding, Devices

### Task 7.3: Device Inventory API
- GET /api/devices (with filters: type, status, condition)
- POST /api/devices (create new device)
- PATCH /api/devices/:id (update condition, status, notes)

### Task 7.4: Device Assignment API
- POST /api/devices/:id/assign (assign to employee)
- PATCH /api/devices/:id/return (mark returned, capture condition)
- GET /api/devices/:id/history (assignment history)
- GET /api/employees/:id/devices (current assignments + history)

### Task 7.5: Device Management UI
- Inventory page: Device table with filters, sort
- Add device button → form (serial, type, make, model, condition, warranty)
- Click device → detail panel: current assignment + history, return button
- Assign device: modal with employee dropdown, due date (optional)
- Return device: modal with condition dropdown, notes

---

# PHASE 8: Dashboard

**Goals:**
- Count cards (active candidates, interviews this week, onboardings in progress, unassigned devices)
- Stale candidates widget (14+ days, no activity)
- Upcoming interviews widget (next 7 days)
- Pending tasks widget (due next 7 days, grouped by employee)
- Recent activity feed (last 20 events)

**Status:** Planned. Depends on Phase 7.

---

## Phase 8 Overview

### Task 8.1: Dashboard Metrics API
- GET /api/dashboard/metrics (return all count data)
- GET /api/dashboard/stale-candidates (candidates inactive 14+ days)
- GET /api/dashboard/upcoming-interviews (next 7 days)
- GET /api/dashboard/pending-tasks (due next 7 days)
- GET /api/dashboard/activity-feed (last 20 events)

### Task 8.2: Activity Log Model & API
- Upsert Activity record on key events: candidate created/hired, stage change, interview scheduled, task completed, device assigned
- GET /api/activities (with filtering)

### Task 8.3: Dashboard UI
- Count cards (4 cards: candidates, interviews, onboardings, devices)
- Stale candidates widget: table of candidates, days stale, link to detail
- Upcoming interviews widget: table of interviews, candidate name, interviewer, date
- Pending tasks widget: grouped by employee, task name, due date, status toggle
- Activity feed: timeline of events with icons

---

# PHASE 9: Reports, Export, Search, Polish

**Goals:**
- Candidate pipeline report (funnel chart)
- CSV export (candidates, employees, devices, onboarding status)
- Global search (candidates, employees, devices by name/email/serial)
- Performance optimization (query caching, index verification)
- UI polish (animations, responsive, accessibility)
- Production checklist (error handling, logging, monitoring)

**Status:** Planned. Depends on Phase 8.

---

## Phase 9 Overview

### Task 9.1: Reports API
- GET /api/reports/pipeline (candidate counts by stage)
- GET /api/reports/onboarding-status (completion % by track type)
- GET /api/reports/device-utilization (assigned vs. available)

### Task 9.2: CSV Export API
- GET /api/export/candidates?fields=name,email,stage,status,clientId
- GET /api/export/employees?fields=name,email,title,department,startDate
- GET /api/export/devices?fields=serial,type,status,assignedTo

### Task 9.3: Global Search
- GET /api/search?q=query (searches candidates, employees, devices)
- Returns: [{ type: 'candidate', id, name, highlight }, ...]
- Link to detail on select

### Task 9.4: UI Polish
- Animations: fade in/out, slide panels, button hover states
- Responsive: mobile/tablet support (sidebar collapses, stacked layout)
- Accessibility: WCAG AA (color contrast, keyboard navigation, ARIA labels)
- Loading states: spinners, skeletons for data tables
- Error states: error banners with retry buttons

### Task 9.5: Production Checklist
- Error boundary component
- Logging middleware (request/response logging)
- Rate limiting (prevent brute force on auth endpoints)
- CORS configuration (restrict to allowed origins)
- Database backups (setup schedule)
- Monitoring (uptime checks, error tracking)

---

# Implementation Strategy

## Execution Model

Use `superpowers:subagent-driven-development` with Ruflo coordination:

1. **Per-phase sprints:** Complete one phase at a time
2. **Parallel task groups:** Within a phase, spawn 2-3 agents per task group
3. **Two-stage review:** After each task, spec compliance review + code quality review
4. **Frequency:** Commit after every working feature, 3-5 commits per task

## Code Organization

```
server/
  index.js
  db.js
  middleware/
    auth.js
    rbac.js
    errorHandler.js
  routes/
    auth.js
    candidates.js
    employees.js
    devices.js
    onboarding.js
    interviews.js
    offers.js
    tracks.js
    settings.js
    dashboard.js
    reports.js
    search.js
    export.js
  services/
    candidateService.js
    employeeService.js
    deviceService.js
    onboardingService.js
    interviewService.js
    trackService.js
    settingsService.js
    activityService.js
  tests/
    (unit + integration tests per service)

app/src/
  pages/
    Dashboard.jsx
    Candidates.jsx
    Employees.jsx
    Devices.jsx
    Onboarding.jsx
    Tracks.jsx
    Reports.jsx
    Settings.jsx
  components/
    panels/
      CandidateDetailPanel.jsx
      EmployeeDetailPanel.jsx
      DeviceDetailPanel.jsx
      TrackDetailPanel.jsx
    modals/
      CreateCandidateModal.jsx
      PromoteToEmployeeModal.jsx
      CreateTrackModal.jsx
      AssignDeviceModal.jsx
    tables/
      CandidateTable.jsx
      EmployeeTable.jsx
      DeviceTable.jsx
    common/
      FilterBar.jsx
      SearchBox.jsx
      DataTable.jsx
      Card.jsx
      Button.jsx
  hooks/
    useCandidates.js
    useEmployees.js
    useDevices.js
    useOnboarding.js
    useInterview.js
    useOffer.js
    useTracks.js
  layouts/
    MainLayout.jsx
  services/
    api.js (axios instance + request interceptors)
  styles/
    globals.css
    tailwind.config.js

prisma/
  schema.prisma (✅ DONE)
  seed.js (✅ DONE)
  migrations/ (auto-generated)
```

## Testing Strategy

- **Unit tests:** Service layer (Jest)
- **Integration tests:** API routes (supertest)
- **Component tests:** React components (React Testing Library)
- **Target coverage:** 80% minimum per phase

## Deployment Sequence

1. Phase 1-2: Deploy to staging (local)
2. Phase 3-4: Deploy to production (migration script for ConfigLists)
3. Phase 5-9: Continuous deployment (zero-downtime schema changes)

---

# Execution Checklist

- [ ] Approve this plan
- [ ] Phase 1: API skeleton + React shell + seed ✅
- [ ] Phase 2: Auth + Settings (Users + Lists)
- [ ] Phase 3: Candidates ATS (list, filters, detail, resume, duplicate detection, interviews)
- [ ] Phase 4: Pipeline (stage progression, offers, promote-to-employee)
- [ ] Phase 5: Track templates (CRUD, tasks, timeline preview)
- [ ] Phase 6: Onboarding/offboarding runs (task tracking, progress)
- [ ] Phase 7: Employee directory + device inventory (assignment, return)
- [ ] Phase 8: Dashboard (metrics, stale alerts, activity feed)
- [ ] Phase 9: Reports + search + export + polish + production readiness

**Next:** Execute Phase 2 with subagent-driven-development.
