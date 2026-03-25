# System Architecture — V.Two Ops

Complete technical overview of the V.Two Ops platform. For developers and architects.

---

## System Overview

V.Two Ops is a **unified people & asset management platform** built on a classic three-tier architecture:

```
┌─────────────────────────────────────┐
│       Frontend (React + Vite)       │
│   Browser-based Single Page App     │
│    (Deployed to Vercel.com)         │
└──────────────┬──────────────────────┘
               │ HTTPS API calls
               ↓
┌─────────────────────────────────────┐
│   Backend (Express.js + Node.js)    │
│    25 REST API endpoints            │
│    (Deployed to Railway.app)        │
└──────────────┬──────────────────────┘
               │ Queries & writes
               ↓
┌─────────────────────────────────────┐
│   Database (Prisma + SQLite)        │
│   15 data models                    │
│   File-based, persisted on disk     │
└─────────────────────────────────────┘
```

---

## Technology Stack

### Frontend
- **Framework:** React 18 with Vite 5 (build tool)
- **Styling:** TailwindCSS 3 + custom CSS
- **State:** React Context API + hooks (useState, useEffect)
- **HTTP:** Fetch API (native JavaScript)
- **Routing:** Client-side SPA routing
- **Package Manager:** npm
- **Deployment:** Vercel (auto on git push)

### Backend
- **Runtime:** Node.js 18+
- **Framework:** Express.js 4
- **ORM:** Prisma 5 (database abstraction)
- **Authentication:** Express-session (stateful cookies)
- **File Upload:** Multer 2
- **AI Integration:** Anthropic Claude SDK (optional)
- **CORS:** Enabled for production domains
- **Deployment:** Railway (auto on git push)

### Database
- **Engine:** SQLite 3 (file-based, zero setup)
- **Connection:** Prisma Client
- **Migrations:** Prisma db push (auto-applied on deploy)
- **Backup:** Railway automated snapshots
- **Data Models:** 15 tables (see below)

---

## Data Models (15 Tables)

### People Module

**Candidate**
- Tracks job applicants from sourcing through hiring
- Fields: name, email, phone, position, stage (prospect/applied/interviewing/offered/hired), resume, notes
- Relationships: Linked to interviews and offers

**Employee**
- Active staff members
- Fields: name, email, phone, department, role, hire date, status, manager, onboarding progress
- Relationships: Linked to devices, onboarding tasks, offboarding tasks

**OnboardingTask**
- Checklist items for new hires
- Fields: employee ID, task, category, due date, completed at
- Status tracking: Pending, In Progress, Completed

**OffboardingTask**
- Checklist items for departing employees
- Fields: employee ID, task, category, due date, completed at, device recovery, access revocation

### Device Module

**Device**
- Inventory of equipment
- Fields: name, type (laptop/phone/monitor/etc), make, model, serial, condition, purchase date, warranty expiration, location, assigned employee
- Status tracking: Available, Assigned, In Repair, Retired

**Assignment**
- Links employees to devices
- Constraint: Max 1 active assignment per device
- Fields: employee ID, device ID, assignment date, return date, condition on return

### Support Modules

**Interview**
- Job interview records
- Fields: candidate ID, type (phone/in-person/panel), date, interviewer, notes, rating, next steps

**Offer**
- Job offer tracking
- Fields: candidate ID, position, salary, benefits, offer date, accepted date, start date, status

**Activity**
- Event log for activity feeds
- Fields: type (hire/promote/device-assign/etc), actor, subject, description, timestamp
- Used to display timeline of system events

**Notification**
- System alerts for users
- Fields: recipient, type (task-due/offer-pending/device-needed), read status, timestamp

**Track**
- Custom workflows/pipelines (optional)
- Fields: name, stages, order, icon, color
- Example: Hiring Track (Prospect → Applied → Interviewing → Offered → Hired)

**TrackTemplate**
- Reusable workflow templates
- Fields: name, default stages, description

**CustomField**
- User-defined data fields
- Fields: entity type, field name, field type (text/number/date/select), options

### System Modules

**User**
- User profiles (for future auth)
- Fields: email, password hash, role, preferences, last login
- Currently: System-wide for settings

**Settings**
- Application configuration
- Fields: key (database_backup_enabled, etc), value, category

---

## API Reference (25 Endpoints)

### Health & Diagnostics
```
GET /api/health                    → { status: "ok", timestamp, version }
GET /api/admin/health              → Detailed system metrics
```

### Authentication & Sessions
```
POST /api/auth/login               → Login with email/password
POST /api/auth/logout              → Clear session
GET /api/auth/me                   → Current user profile
```

### Candidates
```
GET /api/candidates                → List all candidates (paginated)
GET /api/candidates/:id            → Single candidate details
POST /api/candidates               → Create new candidate
PUT /api/candidates/:id            → Update candidate
DELETE /api/candidates/:id         → Delete candidate
GET /api/candidates/:id/resumes    → Candidate resumes
POST /api/candidates/:id/promote   → Promote to employee
```

### Employees
```
GET /api/employees                 → List all employees (paginated)
GET /api/employees/:id             → Single employee details
POST /api/employees                → Create new employee
PUT /api/employees/:id             → Update employee
DELETE /api/employees/:id          → Soft delete (offboard)
GET /api/employees/:id/devices     → Devices assigned to employee
```

### Devices & Assignments
```
GET /api/devices                   → List devices by status
GET /api/devices/:id               → Device details
POST /api/devices                  → Add device to inventory
PUT /api/devices/:id               → Update device
DELETE /api/devices/:id            → Remove device
GET /api/assignments               → All device assignments
POST /api/assignments              → Assign device to employee
PUT /api/assignments/:id           → Update assignment (return device)
```

### Workflows
```
GET /api/tracks                    → List all workflows
POST /api/tracks                   → Create new workflow
GET /api/track-templates           → Template library
POST /api/config-lists             → Custom option lists
```

### Onboarding & Offboarding
```
GET /api/onboarding/:employeeId    → Checklist for new hire
POST /api/onboarding/:employeeId   → Add task
PUT /api/onboarding/:taskId        → Mark task complete
GET /api/offboarding/:employeeId   → Checklist for departing employee
```

### Reports & Analytics
```
GET /api/dashboard                 → Dashboard metrics (count, charts)
POST /api/exports                  → CSV export of candidates/employees/devices
GET /api/activities                → Activity feed (recent events)
GET /api/search                    → Full-text search across all entities
GET /api/notifications             → User notifications
```

### Admin & Settings
```
GET /api/settings                  → Application settings
PUT /api/settings                  → Update settings
GET /api/admin/custom-fields       → Custom field definitions
POST /api/admin/custom-fields      → Create custom field
PUT /api/admin/feature-requests    → Submit feature request
```

### AI Features
```
POST /api/claude                   → Send message to Claude AI
GET /api/claude/suggestions        → AI-powered suggestions
```

---

## Directory Structure

```
vtwo-ops/
├── server/                         # Node.js backend (Express)
│   ├── index.js                    # Entry point, middleware config, route setup
│   ├── db.js                       # Prisma client singleton
│   ├── middleware/
│   │   ├── errorHandler.js         # Global error handling
│   │   ├── auth.js                 # Session validation middleware
│   │   └── upload.js               # File upload handling (multer)
│   ├── routes/                     # API endpoint handlers (25 files)
│   │   ├── health.js               # /api/health
│   │   ├── auth.js                 # /api/auth/*
│   │   ├── candidates.js           # /api/candidates/*
│   │   ├── employees.js            # /api/employees/*
│   │   ├── devices.js              # /api/devices/*
│   │   ├── assignments.js          # /api/assignments/*
│   │   ├── interviews.js           # /api/interviews/*
│   │   ├── offers.js               # /api/offers/*
│   │   ├── onboarding.js           # /api/onboarding/*
│   │   ├── offboarding.js          # /api/offboarding/*
│   │   ├── tracks.js               # /api/tracks/*
│   │   ├── dashboard.js            # /api/dashboard
│   │   ├── notifications.js        # /api/notifications/*
│   │   ├── search.js               # /api/search
│   │   ├── exports.js              # /api/exports
│   │   ├── settings.js             # /api/settings/*
│   │   ├── claude.js               # /api/claude/* (AI features)
│   │   ├── admin/
│   │   │   ├── customFields.js     # /api/admin/custom-fields/*
│   │   │   ├── templates.js        # /api/admin/templates/*
│   │   │   ├── settings.js         # /api/admin/settings/*
│   │   │   ├── health.js           # /api/admin/health
│   │   │   └── featureRequests.js  # /api/admin/feature-requests/*
│   │   └── assistant.js            # /api/assistant/*
│   ├── services/                   # Business logic layer (20+ files)
│   │   ├── candidateService.js     # Candidate CRUD & promotion logic
│   │   ├── employeeService.js      # Employee CRUD
│   │   ├── deviceService.js        # Device CRUD
│   │   ├── assignmentService.js    # Device assignment logic
│   │   ├── onboardingService.js    # Onboarding workflow
│   │   ├── offerService.js         # Offer management
│   │   ├── exportService.js        # CSV export generation
│   │   ├── searchService.js        # Full-text search
│   │   ├── dashboardService.js     # Metrics & analytics
│   │   ├── notificationService.js  # Notification logic
│   │   ├── claudeService.js        # Claude AI integration
│   │   └── ... (8 more)
│   └── tests/                      # Test suite (30+ test files)
│       ├── routes/                 # Route tests
│       ├── services/               # Service tests
│       └── middleware/             # Middleware tests
│
├── app/                            # React frontend (Vite)
│   ├── src/
│   │   ├── main.jsx                # React entry point
│   │   ├── App.jsx                 # Root component, routing
│   │   ├── index.css               # TailwindCSS imports
│   │   ├── config.js               # API_BASE_URL configuration
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx       # Home page with metrics
│   │   │   ├── Directory.jsx       # Employee directory
│   │   │   ├── Hiring.jsx          # Candidate Kanban board
│   │   │   ├── Interviews.jsx      # Interview tracker
│   │   │   ├── Offers.jsx          # Offer management
│   │   │   ├── Onboarding.jsx      # New hire checklist
│   │   │   ├── Offboarding.jsx     # Departing employee checklist
│   │   │   ├── Inventory.jsx       # Device inventory
│   │   │   ├── Assignments.jsx     # Device assignments
│   │   │   ├── Tracks.jsx          # Custom workflows
│   │   │   ├── Reports.jsx         # Analytics & reports
│   │   │   ├── Settings.jsx        # User & app settings
│   │   │   └── admin/
│   │   │       ├── CustomFields.jsx      # Field builder
│   │   │       ├── Templates.jsx        # Workflow templates
│   │   │       ├── FeatureRequests.jsx  # Feedback form
│   │   │       ├── Settings.jsx         # Admin settings
│   │   │       └── Health.jsx           # System health
│   │   ├── components/
│   │   │   ├── Sidebar.jsx         # Navigation menu
│   │   │   ├── TopBar.jsx          # Search bar, user menu
│   │   │   ├── RightPanel.jsx      # Detail slide panel
│   │   │   ├── KanbanBoard.jsx     # Hiring pipeline
│   │   │   ├── ActivityFeed.jsx    # Timeline of events
│   │   │   ├── NotificationDropdown.jsx  # Alerts
│   │   │   ├── ClaudeChat.jsx      # AI assistant chat
│   │   │   ├── TimelineStep.jsx    # Onboarding/offboarding steps
│   │   │   ├── common/             # Reusable components
│   │   │   │   ├── Badge.jsx
│   │   │   │   ├── Timeline.jsx
│   │   │   │   └── ProgressBar.jsx
│   │   │   ├── admin/
│   │   │   │   └── FieldBuilder.jsx     # Custom field editor
│   │   │   ├── forms/
│   │   │   │   └── ResumeUploadForm.jsx # File upload
│   │   │   └── panels/
│   │   │       ├── CandidateDetailPanel.jsx
│   │   │       ├── EmployeeDetailPanel.jsx
│   │   │       └── DeviceDetailPanel.jsx
│   │   ├── hooks/                  # Custom React hooks
│   │   │   ├── useFetch.js         # Generic data fetching
│   │   │   ├── useCandidates.js    # Candidates CRUD
│   │   │   ├── useEmployees.js     # Employees CRUD
│   │   │   ├── useDevices.js       # Devices CRUD
│   │   │   ├── useOnboarding.js    # Onboarding workflow
│   │   │   ├── useActivities.js    # Activity feed
│   │   │   ├── useNotifications.js # Notification system
│   │   │   ├── useClaudeChat.js    # AI chat
│   │   │   └── useAdmin.js         # Admin actions
│   │   └── __tests__/              # Test suite
│   │       ├── components/         # Component tests
│   │       ├── pages/              # Page tests
│   │       ├── hooks/              # Hook tests
│   │       └── integration/        # End-to-end tests
│   ├── index.html                  # HTML template
│   ├── vite.config.js              # Vite build config
│   ├── tailwind.config.js          # TailwindCSS config
│   ├── package.json                # Dependencies
│   └── jest.config.js              # Test runner config
│
├── prisma/                         # Database schema
│   ├── schema.prisma               # Complete data model
│   └── seed.js                     # Initial data (optional)
│
├── package.json                    # Backend dependencies
├── .env.example                    # Environment variables template
├── .env.production                 # Production config (secrets not committed)
├── Dockerfile                      # Multi-stage Docker build
├── .gitignore                      # Git ignore rules
└── docs/                           # Documentation
    ├── DEPLOYMENT.md               # Deployment guide
    ├── MAINTENANCE_GUIDE.md        # Operations manual
    ├── ARCHITECTURE.md             # This file
    ├── API_REFERENCE.md            # Detailed endpoint docs
    └── README.md                   # Getting started
```

---

## Data Flow Diagrams

### Creating a Candidate (Example)

```
User Types in Hiring Page
         ↓
Form Component (React)
         ↓
POST /api/candidates
         ↓
candidatesRouter.js
         ↓
candidateService.createCandidate()
         ↓
db.candidate.create() [Prisma]
         ↓
SQLite Database
         ↓
Response: 201 + candidate object
         ↓
Component updates state
         ↓
Kanban board re-renders
         ↓
User sees candidate in "Prospect" column
```

### Assigning a Device to Employee

```
User clicks "Assign Device" on employee
         ↓
Modal opens (React component state)
         ↓
User selects device, clicks confirm
         ↓
POST /api/assignments
         ↓
assignmentService.assignDevice()
         ↓
Checks: Device available? Yes
         ↓
db.assignment.create()
         ↓
db.device.update({ assignedEmployeeId: X })
         ↓
db.activity.create({ type: "device-assigned" })
         ↓
Response: 201 + assignment object
         ↓
Frontend updates employee detail view
         ↓
User sees "Device Assigned" badge
```

### Promoting Candidate to Employee

```
User clicks "Promote" on candidate
         ↓
PromoteModal component
         ↓
User fills: Start date, department, role
         ↓
POST /api/candidates/:id/promote
         ↓
candidateService.promoteToEmployee()
         ↓
db.employee.create()
         ↓
db.onboardingTask.create() × N (template tasks)
         ↓
db.candidate.update({ stage: "hired" })
         ↓
db.activity.create({ type: "hire" })
         ↓
db.notification.create({ type: "onboarding-started" })
         ↓
Response: 200 + employee object
         ↓
Frontend navigates to employee directory
         ↓
Onboarding checklist automatically created
```

---

## How to Add New Features

### Adding a New Data Model

**Step 1: Update Prisma Schema**

```prisma
// prisma/schema.prisma
model BlogPost {
  id        String   @id @default(cuid())
  title     String
  content   String   @db.Text
  published Boolean  @default(false)
  author    Employee @relation(fields: [authorId], references: [id])
  authorId  String
  created   DateTime @default(now())
}
```

**Step 2: Migrate Database**

```bash
npm run db:push
```

Prisma auto-migrates on deploy too.

**Step 3: Create API Route**

```javascript
// server/routes/blogPosts.js
import express from 'express';
import * as blogService from '../services/blogService.js';

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const posts = await blogService.getAllPosts();
    res.json(posts);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const post = await blogService.createPost(req.body);
    res.status(201).json(post);
  } catch (error) {
    next(error);
  }
});

// ... more routes

export default router;
```

**Step 4: Create Service**

```javascript
// server/services/blogService.js
import { db } from '../db.js';

export async function getAllPosts() {
  return db.blogPost.findMany({
    include: { author: true },
    orderBy: { created: 'desc' }
  });
}

export async function createPost(data) {
  return db.blogPost.create({
    data,
    include: { author: true }
  });
}

// ... more methods
```

**Step 5: Register Route**

```javascript
// server/index.js
import blogPostsRouter from './routes/blogPosts.js';

app.use('/api/blog-posts', blogPostsRouter);
```

**Step 6: Create Frontend Page**

```javascript
// app/src/pages/BlogPosts.jsx
import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';

export default function BlogPosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/blog-posts`)
      .then(r => r.json())
      .then(data => {
        setPosts(data);
        setLoading(false);
      });
  }, []);

  return (
    <div>
      <h1>Blog Posts</h1>
      {posts.map(post => (
        <article key={post.id}>
          <h2>{post.title}</h2>
          <p>{post.content}</p>
          <small>By {post.author.name}</small>
        </article>
      ))}
    </div>
  );
}
```

**Step 7: Add Route to App**

```javascript
// app/src/App.jsx
import BlogPosts from './pages/BlogPosts';

<Route path="/blog" element={<BlogPosts />} />
```

**Step 8: Test Locally**

```bash
npm run dev              # Backend
npm run dev:frontend    # Frontend
# Visit http://localhost:5173/blog
```

**Step 9: Push to GitHub**

```bash
git add .
git commit -m "feat: Add blog posts feature"
git push origin main
```

Railway + Vercel auto-deploy within 2 minutes.

### Adding a New API Endpoint

See "Adding a New Data Model" above. Same process, but skip Steps 1-2 if using existing data model.

### Adding a New Frontend Page

**Step 1: Create page component** → `app/src/pages/MyPage.jsx`
**Step 2: Add route** → `app/src/App.jsx`
**Step 3: Add sidebar link** → `app/src/components/Sidebar.jsx`
**Step 4: Test locally** → Open in browser
**Step 5: Push to GitHub** → Auto-deploys

---

## Testing Strategy

### Backend Tests

```bash
npm test                   # Run all tests
npm run test:coverage      # Coverage report
```

Tests are in `server/tests/`:
- **Routes tests:** Verify endpoints return correct status & data
- **Service tests:** Verify business logic
- **Integration tests:** End-to-end workflows

### Frontend Tests

```bash
cd app
npm test                   # Run all tests
npm run test:coverage      # Coverage report
```

Tests are in `app/src/__tests__/`:
- **Component tests:** Render & interact with UI
- **Page tests:** Full page workflows
- **Hook tests:** Custom hook behavior
- **Integration tests:** Multi-component flows

---

## Deployment Pipeline

### Code → Production (2 minutes)

```
1. Developer pushes to GitHub (main branch)
                ↓
2. GitHub webhook triggers builds
                ↓
3. Railway receives webhook
   - Clones code
   - Runs npm ci
   - Runs prisma db push
   - Runs npm run build (Vite)
   - Starts server with node server/index.js
   - Serves built frontend at /
                ↓
4. Vercel receives webhook (if separate)
   - Clones code
   - Installs dependencies
   - Runs vite build (for Next.js optimizations)
   - Deploys to CDN
                ↓
5. DNS points to deployed services
   - Backend: https://your-app.railway.app
   - Frontend: https://your-app.vercel.app
                ↓
6. User visits app — latest code live
```

---

## Security Considerations

### Authentication
- Session-based (cookies)
- SESSION_SECRET must be >32 chars random
- Cookies only sent over HTTPS in production
- HttpOnly flag prevents XSS access

### CORS
- Frontend domain must be in allowlist
- Set `FRONTEND_URL` environment variable
- Backend checks all requests against allowlist

### Input Validation
- All route handlers validate request body
- Services implement business logic checks
- Database constraints enforce data integrity

### Secrets Management
- `.env.production` is NOT committed to git
- Railway/Vercel manage secrets in dashboard
- Never log sensitive data
- API keys only used server-side

### Rate Limiting
- Not implemented yet (Railway free tier sufficient)
- Can be added via express-rate-limit package

---

## Performance Considerations

### Database
- Prisma caches queries in memory
- Indexes on common filters (employee name, candidate email)
- SQLite suitable for <10,000 records
- Upgrade to PostgreSQL if data grows

### Frontend
- React lazy loading for pages (code splitting)
- Vite automatic chunk splitting
- TailwindCSS minified in production
- Network requests cached with fetch API

### API
- Express gzip compression enabled
- JSON payloads minimized
- No N+1 queries (Prisma `include` prevents this)
- Pagination for large datasets (20 items per page)

---

## Monitoring & Logging

### Backend Logs
- All requests logged with method, path, status, duration
- Errors logged with full stack trace
- Available in Railway dashboard

### Frontend Errors
- Browser console shows client-side errors
- Vercel Function logs available for serverless functions
- Network tab shows API response times

### Metrics
- Railway dashboard shows CPU, memory, disk usage
- Vercel analytics show response times and error rates
- Application health check: `GET /api/health`

---

## Roadmap & Future Improvements

**Phase 2 (Q2):**
- Advanced search with filters
- Bulk operations (import candidates, export reports)
- Custom fields per entity type

**Phase 3 (Q3):**
- Real-time notifications (WebSockets)
- Integration with email (send offers, alerts)
- Calendar view for interviews/start dates

**Phase 4 (Q4):**
- Integration with ATS tools (Lever, Greenhouse)
- Device tracking (GPS, WiFi)
- Mobile app (React Native)

**Phase 5 (2025):**
- Machine learning for candidate matching
- Predictive analytics for turnover
- Advanced reporting & dashboards

---

## Key Files & When to Edit

| File | When to Edit | Why |
|------|-------------|-----|
| `prisma/schema.prisma` | Adding data model | Define new table structure |
| `server/routes/*` | Adding API endpoint | Define request handlers |
| `server/services/*` | Business logic | Implement feature logic |
| `app/src/pages/*` | Adding page | New UI screen |
| `app/src/components/*` | Reusable UI | Shared component |
| `app/src/hooks/*` | Shared state logic | Custom hook |
| `.env.production` | Deployment secrets | API keys, URLs |
| `Dockerfile` | Build changes | Docker image config |

---

## Summary

V.Two Ops is a **three-tier web application** with:

- **25 API endpoints** serving all business logic
- **15 data models** tracking people and assets
- **20+ React pages** for user interactions
- **30+ services** implementing workflows
- **Automated deployment** on git push
- **Production-ready** architecture for growth

It's designed to scale from solo use to team of 50+ with minimal maintenance.
