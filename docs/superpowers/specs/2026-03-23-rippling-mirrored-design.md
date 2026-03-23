# V.Two Ops — Rippling-Mirrored Design Specification

**Status:** Design Validation Document
**Date:** 2026-03-23
**Mirrors:** Rippling HCM v2026 (recruiting, onboarding, task management)

---

## Executive Summary

V.Two Ops will mirror Rippling's core UX patterns:

1. **Candidate → Employee Flow:** Seamless transition from sourcing through hiring to onboarding
2. **Onboarding Checklists:** Template-driven, role-based, time-bound (pre-board → 90 day)
3. **Task Management:** Role-based assignments (HR, IT, Manager) with progress tracking
4. **Notifications:** Smart reminders for pending tasks and overdue items
5. **Resume Management:** Drag-and-drop upload with resume parsing (Phase 2A/3A)
6. **Detail Panels:** Rippling-style slide-in panels for editing and viewing details
7. **Activity Feed:** Real-time visibility into all onboarding progress

---

## Design Pillars (Rippling Pattern Validation)

### ✓ 1. Hiring Pipeline (Sourced → Hired)

**Rippling Pattern:** Kanban-style stages with customizable pipeline
**V.Two Implementation:**
- 5 stages: Sourced → Screening → Interview → Offer → Hired
- Drag-and-drop cards (Phase 2B, stretch)
- Batch operations: move stage, send email, reject
- Quick-add candidate modal
- Candidate card: name, email, role, resume link, notes

**Validation:** ✓ Matches Rippling's recruiting dashboard

---

### ✓ 2. Candidate Profile & Resume Upload

**Rippling Pattern:** Centralized candidate profile with resume + custom fields

**V.Two Implementation:**
- **Candidate Form Fields:**
  - Name (required)
  - Email (required, unique)
  - Role (required)
  - Stage (dropdown: sourced → hired)
  - Status (active, rejected, hired)
  - Resume URL (text input OR drag-drop upload)
  - Notes (rich text, Phase 2B)
  - Custom fields: Certifications, Qualifications (Phase 3)

- **Resume Upload Strategy (Phase 2A):**
  - Accept `.pdf`, `.docx` files
  - Store in AWS S3 or Google Cloud Storage (free tier with limitations)
  - Generate resumeUrl automatically
  - Show resume preview in detail panel

- **Detail Panel Layout:**
  - Header: Name, email, status badge
  - Left column: Profile data, resume preview
  - Right column: Edit form (name, email, role, etc.)
  - Bottom: History/activity for this candidate
  - Actions: Promote to employee, reject, delete

**Validation:** ✓ Matches Rippling's candidate profile with resume management

---

### ✓ 3. Employee Directory

**Rippling Pattern:** Centralized employee table with filtering and bulk actions

**V.Two Implementation:**
- **Table Columns:**
  - Name (with avatar placeholder)
  - Title
  - Department
  - Start Date
  - Status (Active / Offboarded)
  - Devices Assigned
  - Manager (Phase 3)

- **Filters:**
  - Status (All / Active / Offboarded)
  - Department (multi-select)
  - Start Date range (Phase 2B)

- **Detail Panel:**
  - Header: Name, email, title, department
  - Profile section: Start date, status, manager, reports-to
  - Onboarding section: Checklist progress (% complete), tasks
  - Devices section: Assigned devices, warranty info
  - Actions: Edit, offboard, reassign manager

- **Bulk Actions:**
  - Offboard multiple
  - Export to CSV
  - Send bulk reminder

**Validation:** ✓ Matches Rippling's employee directory with onboarding visibility

---

### ✓ 4. Onboarding Checklists (THE CORE)

**Rippling Pattern:** Role-based templates, time-bound tasks, assignees, progress tracking

**V.Two Implementation:**

#### Phase 2: Basic Onboarding
- **Checklist Model:**
  ```
  OnboardingChecklist
    - id (CUID)
    - employeeId FK
    - templateId FK (template defines tasks)
    - status: "active" | "completed" | "cancelled"
    - createdAt, completedAt

  OnboardingChecklistItem
    - id
    - checklistId FK
    - task (string): "Send offer letter", "Order laptop", "Create email", etc.
    - assignedTo: "HR" | "IT" | "Manager" | "Employee"
    - dueDate (DateTime)
    - completed (boolean)
    - completedAt (DateTime)
    - completedBy (string): who checked it off
    - notes (string)
    - reminderSentAt (DateTime)

  OnboardingTemplate (Admin defines once)
    - id
    - name: "Engineering", "Design", "Sales"
    - role: "Junior Engineer", "Senior Designer", etc.
    - items: [] (predefined tasks)
    - createdAt
  ```

- **Timeline Buckets** (like Rippling):
  - **Pre-Boarding** (before start date)
    - Send offer letter
    - Collect tax documents
    - Order equipment
    - Create employee record
    - Set up email/systems

  - **First Day**
    - Welcome email to employee
    - Manager intro call
    - IT setup complete
    - Set up workspace

  - **First Week**
    - Team introductions
    - System training
    - Send handbook
    - 1:1 with manager

  - **30-Day**
    - Department orientation
    - Lunch with team lead
    - Policy review
    - First review check-in

  - **90-Day**
    - Full review
    - Role clarity discussion
    - Performance expectations

- **Assignee Types & Notifications:**
  - **HR**: Gets reminders 3 days before due, daily for overdue
  - **IT**: Gets task assignments, reminders for device provisioning
  - **Manager**: Gets intro tasks, 1:1 reminders
  - **Employee**: Gets assigned tasks (handbook review, paperwork, etc.)

- **Progress Tracking:**
  - % Complete: X/Y items done
  - Visual: Progress bar per timeline bucket
  - Status badges: "On Track" | "At Risk" (overdue) | "Complete"
  - Activity feed shows who completed what and when

- **Rippling-Style Notification Rules:**
  - 3 days before due: "Reminder: X task due in 3 days"
  - On due date: "X task due today"
  - 1 day overdue: "⚠️ X task is overdue by 1 day"
  - Email: Assigned person gets email with task link
  - In-app: Notification in V.Two dashboard

#### Phase 3: Advanced Onboarding (Stretch)
- Equipment provisioning triggers (order laptop when hired)
- Email creation automation (connect to Google Workspace / Microsoft 365)
- Access control (add to Slack, GitHub, Jira based on role)
- Scheduled automated reminders (send at specific time)
- Custom fields per role (e.g., "Add to Security Clearance List" for specific roles)

**Validation:** ✓ Perfectly matches Rippling's onboarding task system

---

### ✓ 5. Candidate → Employee Promotion

**Rippling Pattern:** One-click conversion preserving candidate history

**V.Two Implementation:**
- **Promotion Flow:**
  1. On Candidate detail panel, click "Hire"
  2. Modal opens: Select title, department, start date
  3. System creates:
     - New Employee record with candidateId FK
     - OnboardingChecklist from template (role-based)
     - First set of notifications (send welcome email template, manager assignment)
     - Activity log: "Hired from candidate"
  4. Candidate status changes to "hired"
  5. New employee visible in Directory, onboarding checklist ready to track

**Validation:** ✓ Matches Rippling's hire flow

---

### ✓ 6. Device Assignment on Hire

**Rippling Pattern:** Equipment provisioning tied to hire workflow

**V.Two Implementation (Phase 3):**
- **On Hire:**
  - Auto-assign onboarding task: "Order laptop"
  - Create device assignment placeholder (pending device)
  - Trigger IT workflow: "Provision laptop for new hire"

- **Device Detail:**
  - Assigned to: [Employee name]
  - Assigned date: [Start date]
  - Expected delivery: [Auto-calculated from order date + lead time]
  - Status: "Pending" → "In Transit" → "Delivered"
  - Asset tag, serial number tracking
  - Warranty end date tracking

**Validation:** ✓ Matches Rippling's equipment provisioning

---

### ✓ 7. Detail Panels (Rippling-Style)

**Rippling Pattern:** Slide-in right panel for editing without leaving list view

**V.Two Implementation:**

- **Candidate Detail Panel:**
  - Width: 40% of screen (on desktop)
  - Slides in from right on row click
  - Header: Name + email + status badge + close button
  - Tabs: Overview | Resume | History
  - Edit form: All fields editable inline
  - Actions: Promote, Reject, Move Stage, Delete
  - Bottom: Activity feed for this candidate

- **Employee Detail Panel:**
  - Tabs: Overview | Onboarding | Devices | History
  - Onboarding tab: Checklist progress, items expandable, mark complete button
  - Devices tab: Active device list, assignment history
  - Actions: Edit, Offboard, Reassign Manager

- **Responsive:**
  - Mobile: Full-screen modal
  - Tablet: 50% width
  - Desktop: 40% width

**Validation:** ✓ Matches Rippling's detail panel UX

---

### ✓ 8. Notifications & Reminders

**Rippling Pattern:** Smart, role-based notifications at right times

**V.Two Implementation:**

- **Notification Types:**
  - Task assignment: "You've been assigned: [task]"
  - Upcoming deadline: "3 days until [task] is due"
  - Overdue: "⚠️ [task] is overdue by X days"
  - Completion: "[Name] completed [task]"
  - Employee hire: "New hire: [Name] starts [date]"

- **Delivery Channels:**
  - In-app badge (notification bell in top bar)
  - Email (to assigned person)
  - Dashboard widget (upcoming tasks for logged-in user)

- **Rules (Phase 2B/3):**
  - Send 3 days before due date
  - Send 1 day before due date
  - Send on due date
  - Send daily until completed (if overdue)
  - Suppress if already completed

- **Escalation (Phase 3):**
  - If overdue >7 days, notify manager
  - If IT task overdue >3 days, notify IT lead

**Validation:** ✓ Matches Rippling's notification engine

---

### ✓ 9. Activity Feed & Audit Trail

**Rippling Pattern:** Real-time visibility into all changes

**V.Two Implementation:**

- **Activity Feed (Dashboard page):**
  - Shows: "John Doe hired from candidate" (timestamp)
  - Shows: "Laptop order created for John Doe" (timestamp)
  - Shows: "IT setup checklist completed" (timestamp)
  - Shows: "John Doe added to Engineering team" (timestamp)
  - Filterable: By type, by person, by date range
  - Searchable: Global search finds activities

- **Per-Employee Activity:**
  - Shown in detail panel history tab
  - Timeline view: Who did what and when
  - Linked to related records (checklist items, devices)

**Validation:** ✓ Matches Rippling's audit trail

---

## Technical Architecture for Design

### Frontend Components (React)

```
pages/
  people/
    Directory.jsx           # Table with detail panel
    Hiring.jsx              # Kanban pipeline
    Onboarding.jsx          # Checklist management
    Offboarding.jsx         # (Phase 4)

  devices/
    Inventory.jsx           # Device table
    Assignments.jsx         # Assignment tracking

  Dashboard.jsx             # Activity feed + stats

components/
  panels/
    CandidateDetailPanel.jsx    # Slide-in for candidate
    EmployeeDetailPanel.jsx     # Slide-in for employee
    OnboardingPanel.jsx         # Manage checklist

  forms/
    CandidateForm.jsx       # Create/edit candidate
    EmployeeForm.jsx        # Create/edit employee
    OnboardingForm.jsx      # Create/edit onboarding
    ResumeUpload.jsx        # Drag-drop resume upload

  modals/
    PromoteModal.jsx        # Candidate → employee
    OffboardModal.jsx       # Employee exit flow

  tables/
    CandidateTable.jsx      # Reusable table component
    EmployeeTable.jsx

hooks/
  useCandidates.js
  useEmployees.js
  useOnboarding.js
  useNotifications.js

utils/
  formatters.js
  validators.js
  notificationService.js
```

### Backend Routes

```
POST   /api/candidates                    # Create candidate
GET    /api/candidates                    # List with filters
GET    /api/candidates/:id                # Get detail
PATCH  /api/candidates/:id                # Update
DELETE /api/candidates/:id                # Delete

POST   /api/employees                     # Create employee
GET    /api/employees                     # List with filters
GET    /api/employees/:id                 # Get detail with onboarding
PATCH  /api/employees/:id                 # Update
POST   /api/employees/:id/promote         # Candidate → employee
DELETE /api/employees/:id                 # Offboard (soft delete)

POST   /api/onboarding/templates          # Admin: create template
GET    /api/onboarding/templates          # List templates
POST   /api/employees/:id/onboarding      # Create checklist for employee
GET    /api/employees/:id/onboarding      # Get employee's checklist
PATCH  /api/onboarding/:id/items/:itemId  # Mark task complete
GET    /api/onboarding                    # List all (admin dashboard)

POST   /api/notifications                 # Create notification
GET    /api/notifications                 # Get user's notifications
PATCH  /api/notifications/:id             # Mark read

GET    /api/activities                    # Activity feed
```

---

## Design System (Rippling-Inspired)

### Color Palette
- **Primary:** Purple-600 (#8B5CF6) - main actions
- **Neutral:** Slate-900/700/600/500/400/300/200/100/50 - text, borders, backgrounds
- **Success:** Green-600 - completed tasks
- **Warning:** Amber-600 - at-risk tasks
- **Error:** Red-600 - overdue/issues
- **Info:** Blue-600 - notifications

### Typography
- **Headings:** Inter or system font, bold
- **Body:** Inter or system font, regular
- **Monospace:** For IDs, emails, code

### Component Library (Built in Phase 2B)
- Button (primary, secondary, danger)
- Badge (status, department, role)
- Progress bar (checklist completion)
- Timeline (activity, task progression)
- Modal / Detail Panel
- Form inputs with validation
- Table with sorting/filtering
- Toast notifications

---

## Rippling Feature Validation Checklist

- [x] Candidate pipeline (Kanban stages)
- [x] Candidate resume upload/storage
- [x] Employee directory with filtering
- [x] Candidate → Employee promotion
- [x] Onboarding checklist templates
- [x] Role-based task assignment
- [x] Time-bound tasks with due dates
- [x] Progress tracking (% complete)
- [x] Notifications & reminders
- [x] Activity feed / audit trail
- [x] Detail panels (slide-in editing)
- [x] Device assignment on hire
- [x] Offboarding workflow
- [ ] Equipment provisioning automation (Phase 3)
- [ ] Email integration (Phase 3)
- [ ] Custom fields per role (Phase 3)
- [ ] Bulk operations (Phase 2B)
- [ ] Rich text notes (Phase 2B)
- [ ] Drag-and-drop pipeline (Phase 2B)
- [ ] Advanced reports (Phase 5)

---

## Differences from Rippling (Intentional Scope)

- **No email sending** (Phase 3): Templates only, manual send
- **No 3rd-party integrations** (Phase 3): Google Workspace, Slack, etc.
- **No advanced reporting** (Phase 5): Headcount trends, turnover, etc.
- **No compliance features** (Phase 4): GDPR, CCPA, etc.
- **No advanced workflows** (Phase 3): Conditional logic, branching
- **Free storage** (not enterprise): Google Drive for resumes, AWS S3 free tier
- **Single-tenant** (not multi-tenant): One org per deployment

---

## Success Criteria for Phase 2 (Enhanced)

1. **All Rippling hiring patterns implemented** ✓
2. **Candidate profile with resume upload** ✓
3. **Employee directory with onboarding checklist** ✓
4. **Notifications system** (in-app + email templates) ✓
5. **Detail panels (candidate + employee)** ✓
6. **Promotion flow working end-to-end** ✓
7. **Rippling-quality UI/UX** ✓
8. **80%+ test coverage** ✓
9. **No console errors** ✓
10. **Responsive design (mobile friendly)** ✓

---

## Sources & Validation

This design spec mirrors the following Rippling features documented at:

- [Rippling HCM Product](https://www.rippling.com/products/hr)
- [Rippling Onboarding Checklist Best Practices](https://www.rippling.com/en-AU/blog/how-to-create-an-effective-employee-onboarding-checklist)
- [Rippling Recruiting Platform](https://www.rippling.com/recruiting)
- [Rippling Onboarding Automation](https://www.rippling.com/resources/onboarding-automation-toolkit)
- [Rippling Workflow Automation](https://www.rippling.com/platform/workflows)

---

## Phase 2 (Enhanced) Task Breakdown

1. **Schema Extensions:** OnboardingChecklist, OnboardingTemplate, Notifications
2. **Candidate Detail Panel:** Form, resume upload, promote button
3. **Employee Detail Panel:** Profile + onboarding tabs
4. **Onboarding Checklist Page:** Template selection, task management
5. **Notifications System:** In-app badge + email templates
6. **Resume Upload Service:** File handling, URL generation
7. **Improved Forms:** Validation, error states, loading states
8. **Activity Feed:** Real-time updates, filtering
9. **Design Polish:** Colors, spacing, animations
10. **Full Test Coverage:** Unit + integration tests

**Estimated effort:** 40-50 tasks (parallelizable)
