# Deployment, QA, Phase 6 — Complete Path to Production

> **For agentic workers:** Use superpowers:subagent-driven-development to execute in parallel.

**Goal:** Run QA tests, code quality review, plan Phase 6, and deploy to production.

**Phases:**
- **Phase C:** Integration tests (manual + automated)
- **Phase D:** Code quality review (linting + architecture)
- **Phase A:** Phase 6 planning (detail panels + Onboarding flows)
- **Phase B:** Production deployment (Docker + hosting)

---

## Phase C: Integration Tests & Manual QA (1-2 hours)

### Task C1: Manual Testing Checklist

**Test all 16 pages manually:**

Run:
```bash
npm run dev  # Terminal 1: API server
npm run app:dev  # Terminal 2: Frontend
```

Then test these pages in browser at `http://localhost:5173`:

**Core Pages (Must Work):**
- [ ] Dashboard — Loads, shows 4 stat cards
- [ ] Directory — Shows employee list (may be empty)
- [ ] Hiring — Shows Kanban board with candidate columns
- [ ] Inventory — Shows device table (may be empty)

**People Pages (New/Fixed):**
- [ ] Onboarding — Shows template dropdown + employee selector
- [ ] Offboarding — Shows employee selector + empty state
- [ ] Search — Type search, see results (or empty state)

**Device Pages (New/Fixed):**
- [ ] Assignments — Shows assignment table + Return buttons
- [ ] Tracks — Shows track list or empty state message

**Admin Pages (New APIs):**
- [ ] Admin Settings — Form loads, shows fields, can save
- [ ] Templates — Shows template list, can create/edit
- [ ] Feature Requests — Shows requests + filtering
- [ ] Health — Shows system metrics
- [ ] Custom Fields — Shows field list

**Other Pages:**
- [ ] Reports — Shows stats + export buttons
- [ ] Settings — Shows current configuration
- [ ] Workspace Settings — Loads without errors

**Error Handling:**
- [ ] Missing data → Empty state (not crash)
- [ ] Loading state → Shows "Loading..."
- [ ] Network error → Shows error + retry button

**Success Criteria:**
- All 16 pages load without console errors
- Navigation works (sidebar links)
- Forms respond to input
- Data displays correctly where available

### Task C2: Automated Test Validation

Run:
```bash
npm test 2>&1
```

Should output:
```
PASS  app/src/__tests__/hooks/useAssignments.test.js (XXs)
PASS  app/src/__tests__/pages/Assignments.test.js (XXs)
PASS  server/tests/routes/onboarding.test.js (XXs)

Test Suites: X passed, X total
Tests: 60 passed, 60 total
```

Acceptable: Some pre-existing failures OK (unrelated to Phase 5-6 work)

---

## Phase D: Code Quality Review (1-2 hours)

### Task D1: Automated Linting

Run:
```bash
cd app && npm run lint 2>&1 || echo "No linter configured"
```

Fix any errors found. Warnings acceptable.

### Task D2: Architecture Review

Check these files for quality:

**Frontend Architecture:**
- [ ] `app/src/main.jsx` — Routing clean, all imports present
- [ ] `app/src/hooks/useAssignments.js` — Hook follows pattern
- [ ] `app/src/pages/devices/Assignments.jsx` — Component structure sound
- [ ] `app/src/pages/Search.jsx` — Self-contained, no external deps
- [ ] `app/src/pages/Tracks.jsx` — Proper error handling

**Backend Architecture:**
- [ ] `server/routes/onboarding.js` — Templates endpoint clean
- [ ] `server/index.js` — All 25 routes mounted correctly
- [ ] `server/routes/admin/settings.js` — Validation logic present

**Quality Checklist:**
- [ ] No unused imports
- [ ] No console.log() left in production code
- [ ] Consistent error handling (try/catch or .catch())
- [ ] Loading states present where needed
- [ ] Components properly memoized (useCallback where appropriate)

### Task D3: Performance Check

```bash
npm run build 2>&1 | grep "gzip"
```

Should see:
```
✓ 98 modules transformed
dist/assets/index-XXX.js   XXX kB │ gzip: 94.29 kB
dist/assets/index-XXX.css  XXX kB │ gzip: 9.57 kB
```

Bundle size acceptable (<100KB JS gzip)

---

## Phase A: Plan Phase 6 — Detail Panels & Onboarding Complete (2 hours)

### Task A1: Design Detail Panel Interactions

**Currently:** Detail panels exist but may not be fully wired.

**Needed for Phase 6:**
1. Click on list row → Detail panel opens with full data
2. Edit button → Inline edit mode
3. Delete button → Confirmation dialog
4. Save/Cancel → Proper state updates + API calls

**Files to Review:**
- `app/src/components/panels/CandidateDetailPanel.jsx`
- `app/src/components/panels/EmployeeDetailPanel.jsx`
- `app/src/components/panels/DeviceDetailPanel.jsx`

**Scope:** Wire up all modal/panel interactions to use proper API calls

### Task A2: Complete Onboarding/Offboarding Flows

**Currently:** Template selection works, checklist endpoints missing.

**Phase 6 Additions:**
1. Assign template to employee → Create checklist
2. Display checklist items with progress
3. Mark items complete → Update API
4. Show progress bar
5. Completion notifications

**New Endpoints Needed:**
- `POST /api/onboarding/checklists` — Assign template
- `GET /api/onboarding/checklists/:id` — Get checklist
- `PATCH /api/onboarding/checklists/:id/items/:itemId` — Mark complete
- `GET /api/onboarding/checklists/:id/progress` — Get progress

### Task A3: Modal Interactions

**Review & Wire:**
- `AddCandidateModal` — Create candidate
- `PromoteModal` — Promote candidate to employee
- `OffboardModal` — Trigger offboarding
- `AssignDeviceModal` — Assign device
- `ReturnDeviceModal` — Return device

**Each modal should:**
- Validate input
- Call correct API
- Show success/error message
- Update parent state
- Close on success

---

## Phase B: Production Deployment (2-3 hours)

### Task B1: Environment Setup

Create `.env.production`:
```
DATABASE_URL=file:./prod.db
NODE_ENV=production
PORT=3001
SESSION_SECRET=<generate-secure-string>
```

### Task B2: Docker Setup

Create `Dockerfile`:
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma

# Install dependencies
RUN npm ci --production && npm run db:push

# Copy app
COPY . .

# Build frontend
RUN npm run build

# Expose ports
EXPOSE 3001 5173

# Start server
CMD ["npm", "start"]
```

### Task B3: Deployment Options

**Option 1: Railway.app (Recommended)**
- Connect GitHub repo
- Auto-deploy on push to main
- Free tier available
- Built-in database option

**Option 2: Vercel + Render**
- Vercel: Frontend (static build)
- Render: Backend API
- Requires more config

**Option 3: Docker Hub + Heroku**
- Build Docker image
- Push to Docker Hub
- Deploy to Heroku or similar

### Task B4: Production Checklist

Before deploying:
- [ ] Environment variables set
- [ ] Database initialized
- [ ] Build passes: `npm run build`
- [ ] No console errors in browser
- [ ] API responds to requests
- [ ] All 16 pages load
- [ ] SSL/HTTPS enabled
- [ ] Monitoring set up (optional)

---

## Execution Order

1. **Phase C (Parallel):** Manual QA + Automated tests (1-2h)
2. **Phase D (Sequential):** Code quality review (1-2h)
3. **Phase A (Parallel):** Phase 6 planning (2h)
4. **Phase B (Sequential):** Deployment setup (2-3h)

**Total Time:** 6-9 hours (parallelizable to 4-5h)

---

## Success Criteria

✅ Phase C: All 16 pages pass manual QA, 60 tests passing
✅ Phase D: Code quality acceptable, no critical issues
✅ Phase A: Phase 6 plan documented, scope clear
✅ Phase B: App deployed to production URL

---

## Notes

- Keep database backups before production deployment
- Monitor logs for errors post-deployment
- Set up alerts for critical errors
- Plan Phase 6 parallel with Phase B for faster timeline
