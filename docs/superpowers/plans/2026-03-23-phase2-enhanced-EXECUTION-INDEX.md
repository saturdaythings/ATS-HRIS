# Phase 2 (Enhanced) Execution Index

**Status:** Ready for Parallel Execution
**Architecture:** Rippling-Aligned People Management + Onboarding
**Execution Method:** `superpowers:subagent-driven-development` (parallel + review)

---

## Quick Reference

**Total Tasks:** 15 major chunks (65+ subtasks)
**Estimated Time:** 8-10 hours (parallel execution)
**Dependencies:** Phase 1 complete ✓
**Design Reference:** `2026-03-23-rippling-mirrored-design.md`
**Implementation Plan:** `2026-03-23-phase2-people-core.md`
**Admin + Claude Integration:** `2026-03-23-ADMIN-CLAUDE-INTEGRATION.md`

---

## Execution Phases

### Phase 2.1: Core Schema Extensions (Independence: High)
Database models for onboarding system

- **[CHUNK-1]** Prisma Schema Extensions
  - Add: OnboardingTemplate, OnboardingChecklist, OnboardingChecklistItem, Notification
  - Validate: All relationships and constraints
  - Run: `npm run db:push`

### Phase 2.2: Backend Implementation (Independence: High)
API endpoints for all new features

- **[CHUNK-2]** Resume Upload Service
  - Create: `server/services/resumeUploadService.js`
  - Implement: File validation, storage (local + S3 integration)
  - Tests: Upload, validation, URL generation

- **[CHUNK-3]** Candidate Service Extensions
  - Update: `server/services/candidateService.js`
  - Add: Resume association, resume parsing
  - Tests: Resume upload flow

- **[CHUNK-4]** Onboarding Template Routes & Service
  - Create: `server/services/onboardingService.js`
  - Create: `server/routes/onboarding.js`
  - Implement: Template CRUD, checklist creation on hire
  - Tests: All onboarding endpoints

- **[CHUNK-5]** Notification Routes & Service
  - Create: `server/services/notificationService.js`
  - Create: `server/routes/notifications.js`
  - Implement: Create, list, mark read
  - Tests: Notification lifecycle

### Phase 2.3: Frontend Components (Independence: Medium)
React components with Rippling-style UX

- **[CHUNK-6]** Detail Panels & Modal Components
  - Create: `app/src/components/panels/CandidateDetailPanel.jsx`
  - Create: `app/src/components/panels/EmployeeDetailPanel.jsx`
  - Create: `app/src/components/forms/ResumeUploadForm.jsx`
  - Styling: Rippling-inspired design
  - Tests: Panel interactions, form submission

- **[CHUNK-7]** Candidate Profile Page
  - Update: `app/src/pages/people/Hiring.jsx`
  - Add: Detail panel on row click
  - Add: Quick-add candidate modal
  - Add: Resume upload in form
  - Tests: Modal interactions, data fetching

- **[CHUNK-8]** Employee Profile & Onboarding Tab
  - Update: `app/src/pages/people/Directory.jsx`
  - Add: Detail panel with onboarding tab
  - Add: Onboarding checklist viewer
  - Add: Mark task complete button
  - Tests: Onboarding tab interactions

- **[CHUNK-9]** Onboarding Checklist Management Page
  - Create: `app/src/pages/people/Onboarding.jsx`
  - Implement: Template selector, checklist editor, progress tracking
  - Add: Timeline view (pre-board → 90 day)
  - Tests: Checklist CRUD, progress calculation

### Phase 2.4: Notifications & Dashboard (Independence: Medium)
Real-time notifications and activity feed

- **[CHUNK-10]** Notification Service & UI
  - Create: `app/src/hooks/useNotifications.js`
  - Update: `app/src/components/TopBar.jsx` (add notification bell)
  - Create: `app/src/components/NotificationDropdown.jsx`
  - Styling: Notification badges, toast messages
  - Tests: Notification fetching, marking read

- **[CHUNK-11]** Activity Feed Implementation
  - Update: `app/src/pages/Dashboard.jsx`
  - Implement: Recent activity widget
  - Add: Filtering by type and person
  - Add: Timeline view of hiring funnel
  - Tests: Activity feed loading, filtering

### Phase 2.5: Rippling-Aligned UX Polish (Independence: Low)
Design system and visual refinement

- **[CHUNK-12]** Design System & Styling
  - Update: `app/src/index.css` (colors, spacing)
  - Create: `app/src/components/common/Badge.jsx` (status badges)
  - Create: `app/src/components/common/ProgressBar.jsx`
  - Create: `app/src/components/common/Timeline.jsx`
  - Update: All components with Rippling colors and spacing
  - Tests: Component rendering, accessibility

### Phase 2.6: Admin Panel + Custom Fields (Independence: Medium)
Backend custom field system and admin CRUD

- **[CHUNK-13]** Custom Fields Schema & Service
  - Extend: `prisma/schema.prisma` (CustomField, CustomFieldValue models)
  - Create: `server/services/customFieldService.js`
  - Create: `server/routes/admin/customFields.js`
  - Implement: Full CRUD for custom fields
  - Validate: Field types, entity types
  - Tests: Service layer, endpoint tests

### Phase 2.7: Admin Panel UI (Independence: Low)
Self-service admin dashboard

- **[CHUNK-14]** Admin Panel Pages
  - Create: `app/src/pages/admin/CustomFields.jsx` (field builder)
  - Create: `app/src/pages/admin/Templates.jsx` (template manager)
  - Create: `app/src/pages/admin/Settings.jsx` (system config)
  - Create: `app/src/pages/admin/FeatureRequests.jsx` (request board)
  - Create: `app/src/pages/admin/Health.jsx` (system stats)
  - Update: `app/src/components/Sidebar.jsx` (add admin section)
  - Update: All forms to render dynamic custom fields
  - Tests: Admin page interactions, form rendering

### Phase 2.8: Claude Chat Integration (Independence: Low)
Chat widget and feature request system

- **[CHUNK-15]** Claude Chat & Feature Requests
  - Extend: `prisma/schema.prisma` (FeatureRequest, ChatMessage models)
  - Create: `server/services/claudeService.js` (Claude API integration)
  - Create: `server/routes/claude.js` (chat endpoint)
  - Create: `app/src/components/ClaudeChat.jsx` (chat widget)
  - Create: `app/src/hooks/useClaudeChat.js`
  - Implement: Auto-create custom fields from chat
  - Implement: Feature request tracking
  - Tests: Chat interactions, Claude integration

---

## Task Execution Matrix

| Chunk | Name | Dependencies | Parallelizable | Subtasks |
|-------|------|--------------|-----------------|----------|
| 1 | Schema Extensions | Phase 1 | Yes | 2 |
| 2 | Resume Upload | Chunk-1 | Yes | 4 |
| 3 | Candidate Extensions | Chunk-2 | Yes | 3 |
| 4 | Onboarding Service | Chunk-3 | Yes | 5 |
| 5 | Notification Service | Chunk-4 | Yes | 4 |
| 6 | Detail Panels | Phase 1 | Yes | 6 |
| 7 | Candidate Profile Page | Chunk-2, 6 | No | 5 |
| 8 | Employee Profile | Chunk-4, 6 | No | 5 |
| 9 | Onboarding Checklist Page | Chunk-4, 6 | No | 5 |
| 10 | Notifications UI | Chunk-5, 6 | No | 4 |
| 11 | Activity Feed | Chunk-5 | No | 3 |
| 12 | Design Polish | 6-11 | Yes (partial) | 6 |
| 13 | Custom Fields Schema | Chunk-1 | Yes | 3 |
| 14 | Admin Panel UI | Chunk-13, 12 | Yes (partial) | 8 |
| 15 | Claude Chat | Chunk-13, 14 | No | 5 |

---

## Dependency Graph (ASCII)

```
Phase-1 ✓
  ├─→ Chunk-1 (Schema)
  │     ├─→ Chunk-2 (Resume Upload)
  │     │     └─→ Chunk-3 (Candidate Ext)
  │     │           └─→ Chunk-7 (Candidate Page)
  │     │
  │     ├─→ Chunk-4 (Onboarding)
  │     │     ├─→ Chunk-8 (Employee Profile)
  │     │     ├─→ Chunk-9 (Onboarding Page)
  │     │
  │     └─→ Chunk-5 (Notifications)
  │           ├─→ Chunk-10 (Notification UI)
  │           └─→ Chunk-11 (Activity Feed)
  │
  └─→ Chunk-6 (Detail Panels)
        ├─→ Chunk-7
        ├─→ Chunk-8
        ├─→ Chunk-9
        ├─→ Chunk-10
        └─→ Chunk-12 (Design Polish)
```

---

## Recommended Execution Order

### **Round 1 (Parallel):**
- Chunk-1: Schema extensions (includes CustomField, FeatureRequest models)
- Chunk-6: Detail panels (independent React work)

### **Round 2 (Parallel):**
- Chunk-2: Resume upload service
- Chunk-4: Onboarding service
- Chunk-5: Notification service
- Chunk-13: Custom fields schema & service

### **Round 3 (Parallel):**
- Chunk-3: Candidate service extensions
- Chunk-7: Candidate profile page

### **Round 4 (Parallel):**
- Chunk-8: Employee profile page
- Chunk-9: Onboarding checklist page
- Chunk-10: Notification UI
- Chunk-12: Design polish (can start earlier)

### **Round 5 (Parallel):**
- Chunk-11: Activity feed
- Chunk-14: Admin panel UI (depends on Chunk-13)

### **Round 6 (Sequential):**
- Chunk-15: Claude chat (depends on Chunk-14)
- Integration testing (all components together)
- Full end-to-end testing (candidate → hire → onboarding + admin)
- Performance optimization

---

## Success Criteria per Chunk

### Chunk-1 (Schema)
- [ ] All new tables created without conflicts
- [ ] Relationships properly linked
- [ ] Indexes on foreign keys and search fields
- [ ] `npm run db:push` succeeds
- [ ] Tests pass for schema validation

### Chunk-2 (Resume Upload)
- [ ] Accept .pdf, .docx files
- [ ] File size validation (max 10MB)
- [ ] Generate unique filename
- [ ] Return URL for retrieval
- [ ] 90%+ test coverage
- [ ] No console errors

### Chunk-3 (Candidate Extensions)
- [ ] Resume field added to candidate service
- [ ] Update flow includes resume association
- [ ] Candidate detail includes resume preview
- [ ] Tests pass
- [ ] Backwards compatible with Phase-1

### Chunk-4 (Onboarding Service)
- [ ] Create templates (HR admin only)
- [ ] Assign template to employee on hire
- [ ] Mark tasks complete
- [ ] Get checklist progress
- [ ] All CRUD operations tested
- [ ] Permissions validated

### Chunk-5 (Notification Service)
- [ ] Create notification on task assignment
- [ ] Create notification on task due/overdue
- [ ] Mark notification read
- [ ] List user's notifications
- [ ] Email template for notification
- [ ] Tests at 80%+ coverage

### Chunk-6 (Detail Panels)
- [ ] Candidate panel slides in from right
- [ ] Employee panel slides in from right
- [ ] Panel closes on back/escape key
- [ ] Forms are editable
- [ ] Actions (promote, reject, etc.) work
- [ ] Responsive (mobile: full-screen modal)

### Chunk-7 (Candidate Profile)
- [ ] Kanban view shows candidates by stage
- [ ] Click row opens detail panel
- [ ] Resume upload works in form
- [ ] Promote button works
- [ ] Stage change works
- [ ] Tests for all interactions

### Chunk-8 (Employee Profile)
- [ ] Directory table shows employees
- [ ] Click row opens detail panel
- [ ] Onboarding tab shows checklist
- [ ] Task completion works
- [ ] Responsive table
- [ ] Tests pass

### Chunk-9 (Onboarding Checklist)
- [ ] Template selector works
- [ ] Create checklist from template
- [ ] Show timeline view (pre-board → 90 day)
- [ ] Mark items complete
- [ ] Progress bar updates
- [ ] Tests for timeline logic

### Chunk-10 (Notification UI)
- [ ] Bell icon in top bar
- [ ] Dropdown shows unread notifications
- [ ] Mark as read works
- [ ] Delete notification works
- [ ] Real-time badge update
- [ ] Tests for interactions

### Chunk-11 (Activity Feed)
- [ ] Dashboard shows recent hires
- [ ] Shows onboarding progress
- [ ] Filter by type (hire, task complete, etc.)
- [ ] Timeline view works
- [ ] Search activity
- [ ] Tests for filtering

### Chunk-12 (Design Polish)
- [ ] Rippling color palette applied
- [ ] Consistent spacing throughout
- [ ] Badge components styled
- [ ] Progress bars visible
- [ ] Timeline component works
- [ ] All pages match Rippling aesthetic

---

## Testing Strategy

**Per Chunk:**
- Write tests before implementation (TDD)
- Service layer: Unit tests with mocked data
- Routes: Integration tests with real database (isolated)
- React components: Component tests + interaction tests
- Target: 80%+ coverage per chunk

**Final Integration:**
- Full flow test: Candidate → Hire → Onboarding → Complete
- Performance: Page load <2s, API response <500ms
- Accessibility: WCAG AA compliance
- Mobile: Responsive on iOS/Android

---

## Deployment Checklist

- [ ] All tests passing
- [ ] Zero console errors
- [ ] Both servers start cleanly
- [ ] API health check: `curl http://localhost:3001/api/health`
- [ ] App loads: http://localhost:5173
- [ ] Create candidate, promote, complete onboarding checklist
- [ ] Activity feed shows all events
- [ ] Notifications sent and displayed
- [ ] Resume upload works
- [ ] All forms validate input
- [ ] Database persists across restarts

---

## Phase 3 Preview (Not this phase)

After Phase 2, Phase 3 will add:
- Device inventory CRUD
- Device assignment on hire (automatic)
- Device recovery on offboard
- Equipment provisioning automation (Slack/Google Workspace integration)

---

## Notes for Executing Agents

1. **Each chunk is independent:** Can be worked on in parallel without blocking others (except where noted in dependency graph)
2. **Use TDD:** Write tests first, implement second
3. **Commit frequently:** After each step
4. **Review gates:** Two-stage review per chunk (tests pass, then code review)
5. **Rippling alignment:** Reference `2026-03-23-rippling-mirrored-design.md` constantly
6. **Ask questions:** If unsure about Rippling pattern, check design spec first
7. **No scope creep:** Stick to this execution index; Phase 3 items go in Phase 3

---

## File Manifest (All files created/modified this phase)

**Prisma:**
- `prisma/schema.prisma` (extend with new models)

**Backend:**
- `server/services/resumeUploadService.js` (new)
- `server/services/candidateService.js` (extend)
- `server/services/employeeService.js` (no change)
- `server/services/onboardingService.js` (new)
- `server/services/notificationService.js` (new)
- `server/routes/candidates.js` (extend)
- `server/routes/employees.js` (extend)
- `server/routes/onboarding.js` (new)
- `server/routes/notifications.js` (new)
- `server/tests/routes/*.test.js` (extend)
- `server/tests/services/*.test.js` (extend)
- `server/middleware/upload.js` (new, multer config)

**Frontend:**
- `app/src/pages/people/Hiring.jsx` (extend)
- `app/src/pages/people/Directory.jsx` (extend)
- `app/src/pages/people/Onboarding.jsx` (new)
- `app/src/components/panels/CandidateDetailPanel.jsx` (new)
- `app/src/components/panels/EmployeeDetailPanel.jsx` (new)
- `app/src/components/forms/ResumeUploadForm.jsx` (new)
- `app/src/components/modals/PromoteModal.jsx` (new)
- `app/src/components/common/Badge.jsx` (new)
- `app/src/components/common/ProgressBar.jsx` (new)
- `app/src/components/common/Timeline.jsx` (new)
- `app/src/components/NotificationDropdown.jsx` (new)
- `app/src/hooks/useCandidates.js` (new)
- `app/src/hooks/useEmployees.js` (new)
- `app/src/hooks/useOnboarding.js` (new)
- `app/src/hooks/useNotifications.js` (new)
- `app/src/utils/formatters.js` (extend)
- `app/src/utils/validators.js` (new)
- `app/src/pages/Dashboard.jsx` (extend with activity feed)
- `app/src/components/TopBar.jsx` (extend with notification bell)

**Tests:**
- `app/__tests__/components/*.test.jsx` (component tests)
- `app/__tests__/hooks/*.test.js` (hook tests)

**Configuration:**
- `package.json` (add new dependencies)
- `.env.example` (add new vars like S3_BUCKET, etc.)

---

## Start Execution

**Command to dispatch subagent-driven development:**

```
Use superpowers:subagent-driven-development

Task list:
1. Schema extensions (Chunk-1)
2. Resume upload service (Chunk-2)
3. Onboarding service (Chunk-4)
4. Notification service (Chunk-5)
5. Detail panels (Chunk-6)
6. Candidate extensions (Chunk-3)
7. Candidate profile page (Chunk-7)
8. Employee profile page (Chunk-8)
9. Onboarding checklist page (Chunk-9)
10. Notification UI (Chunk-10)
11. Activity feed (Chunk-11)
12. Design polish (Chunk-12)

Execution index: https://[repo]/docs/superpowers/plans/2026-03-23-phase2-enhanced-EXECUTION-INDEX.md
Design spec: https://[repo]/docs/superpowers/specs/2026-03-23-rippling-mirrored-design.md
```

---

**Phase 2 (Enhanced) is ready to execute. Dispatch subagents now.**
