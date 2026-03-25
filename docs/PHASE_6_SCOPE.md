# Phase 6 Scope: Detail Panels, Onboarding Completion, Modals

**Created:** 2026-03-24
**Status:** Planning

---

## A1: Detail Panel Interactions

### CandidateDetailPanel

**Location:** `app/src/components/panels/CandidateDetailPanel.jsx`
**Tabs:** overview, resume, interviews, skills, history

#### Buttons/Actions

| Button | Current State | API Call Needed | Modal |
|--------|--------------|-----------------|-------|
| Edit Details | Toggles inline edit mode | None (local state) | -- |
| Save Changes | TODO stub (commented out) | `PUT /api/candidates/:id` | -- |
| Promote to Employee | Opens PromoteModal | `POST /api/candidates/:id/promote` | PromoteModal |
| Move Stage | Button exists, no handler | `PATCH /api/candidates/:id` (stage field) | -- |
| Reject | Button exists, no handler | `PATCH /api/candidates/:id` (status='rejected') | Confirm dialog |
| Upload Resume | Opens inline ResumeUploadForm | `POST /api/candidates/:id/resume` | -- |
| View/Download/Delete Resume | Buttons exist, no handlers | `GET/DELETE /api/candidates/:id/resume/:resumeId` | -- |
| Skill checkboxes | Updates local state only | `PUT /api/candidates/:id` (skills array) | -- |

#### Wiring Gaps
- `handleSave` has TODO comment, API call commented out (line 151-163)
- `handlePromote` has TODO comment, API call commented out (line 165-178)
- `handleResumeUpload` has TODO comment, API call commented out (line 180-196)
- Move Stage button has no onClick handler
- Reject button has no onClick handler
- Resume View/Download/Delete buttons have no handlers
- Skills changes are not persisted to backend
- Activities/interviews/resumes are hardcoded useState (not fetched from API)

#### Error Handling Gaps
- All try/catch blocks only `console.error` -- no user-facing error display
- No loading states during save/promote/upload
- No success confirmation (toast/banner)

---

### EmployeeDetailPanel

**Location:** `app/src/components/panels/EmployeeDetailPanel.jsx`
**Tabs:** overview, onboarding, devices, history

#### Buttons/Actions

| Button | Current State | API Call Needed | Modal |
|--------|--------------|-----------------|-------|
| Edit Details | Toggles inline edit mode | None (local state) | -- |
| Save Changes | TODO stub (no API call) | `PUT /api/employees/:id` | -- |
| Reassign Manager | Button exists, no handler | `PATCH /api/employees/:id` (manager field) | Employee picker |
| Offboard | Opens OffboardModal | `POST /api/offboarding/create` | OffboardModal |
| Mark Task Complete | TODO stub (console.log) | `PATCH /api/onboarding-runs/:runId/tasks/:taskId` | -- |

#### Wiring Gaps
- `handleSave` is a TODO stub (line 129-132) -- no API call
- `handleMarkTaskComplete` only does console.log (line 134-137)
- Reassign Manager button has no onClick handler
- Onboarding items are hardcoded useState (not fetched from API)
- Devices list is hardcoded useState (not fetched from API)
- Activities are hardcoded useState (not fetched from API)
- `handleOffboard` calls `/api/offboarding/create` (line 141) but this endpoint does not exist in routes

#### Error Handling Gaps
- `handleSave` has no try/catch
- `handleOffboard` catches errors but only console.error + TODO comment for toast
- No loading/submitting states for save
- No success feedback

---

### DeviceDetailPanel

**Location:** `app/src/components/panels/DeviceDetailPanel.jsx`

#### Buttons/Actions

| Button | Current State | API Call Needed | Modal |
|--------|--------------|-----------------|-------|
| Assign Device | Calls `onAssign` prop (available status) | Parent opens AssignDeviceModal | AssignDeviceModal |
| Return Device | Calls `onReturn` prop (assigned status) | Parent opens ReturnDeviceModal | ReturnDeviceModal |
| Close | Calls `onClose` prop | None | -- |

#### Wiring Status
- `loadHistory` fetches `GET /api/devices/:id/history` -- **wired**
- Assign/Return actions are delegated to parent via props -- **wired**
- This panel is the most complete of the three

#### Error Handling
- Has loading state for history fetch
- Displays error message in panel if fetch fails
- No retry mechanism

---

## A2: Onboarding/Offboarding Flow

### Current State (What Exists)

**Backend (Prisma models):**
- `TrackTemplate` -- template with tasks, type (company/role/client), autoApply flag
- `TaskTemplate` -- individual task within a track, with ownerRole, dueDaysOffset, order
- `OnboardingRun` -- instance of a track for an employee, with type (onboarding/offboarding), status
- `TaskInstance` -- instance of a task within a run, with status, dueDate, assignedTo

**Backend (API endpoints exist):**
- `GET /api/onboarding/templates` -- returns in-memory template list
- `GET /api/employees/:employeeId/onboarding-runs` -- list runs for employee
- `GET /api/onboarding-runs/:runId` -- run detail with tasks
- `PATCH /api/onboarding-runs/:runId` -- update run status
- `PATCH /api/onboarding-runs/:runId/tasks/:taskId` -- update task instance
- `GET /api/onboarding-runs/:runId/tasks` -- list tasks for run
- `GET /api/dashboard/pending-tasks` -- tasks due next 7 days

**Frontend:**
- EmployeeDetailPanel has hardcoded onboarding checklist (not connected to API)
- OffboardModal collects lastDay + trackIds, calls non-existent `/api/offboarding/create`

### Phase 6 Additions Needed

#### 1. Create Checklist (Assign Template to Employee)

```
POST /api/onboarding/checklists
```
**Request:**
```json
{
  "employeeId": "string",
  "trackId": "string",
  "type": "onboarding | offboarding",
  "startDate": "2026-04-01"
}
```
**Response:** `{ data: OnboardingRun (with tasks auto-created from template), error: null }`
**Logic:**
- Look up TrackTemplate and its TaskTemplates
- Create OnboardingRun record
- For each TaskTemplate, create a TaskInstance with calculated dueDate
- Return the run with tasks

#### 2. Create Offboarding Run

```
POST /api/offboarding/create
```
**Request:**
```json
{
  "employeeId": "string",
  "lastDay": "2026-04-15",
  "trackIds": [1, 2]
}
```
**Response:** `{ data: { runs: OnboardingRun[], employee: Employee }, error: null }`
**Logic:**
- Create one OnboardingRun per trackId (type='offboarding')
- Use lastDay as startDate for due date calculations
- Update employee status to 'offboarding'

#### 3. Completion Notification Endpoint

```
GET /api/onboarding-runs/:runId/status
```
**Response:** `{ data: { progress: 75, allComplete: false, pendingCount: 3 }, error: null }`
**Use case:** Polling or on-demand check for progress bar updates

### UI Changes Required

| Component | Change |
|-----------|--------|
| EmployeeDetailPanel (onboarding tab) | Replace hardcoded useState with `GET /api/employees/:id/onboarding-runs` fetch |
| EmployeeDetailPanel (onboarding tab) | Wire checkbox to `PATCH /api/onboarding-runs/:runId/tasks/:taskId { status: 'complete' }` |
| EmployeeDetailPanel (onboarding tab) | Add "Assign Template" button that opens template picker |
| OffboardModal | Fix endpoint from `/api/offboarding/create` path; wire to new endpoint |
| New: TemplatePickerModal | Dropdown of templates from `GET /api/onboarding/templates`, confirm to POST |
| ProgressBar | Already exists; needs real data from API instead of hardcoded |

### State Management Approach

- Fetch onboarding runs on panel open via `useEffect` with employeeId dependency
- Store runs in local component state (no global store needed)
- On task completion: optimistic update local state, PATCH API, rollback on error
- On template assignment: POST API, then refetch runs list
- On offboarding: POST API, close modal, refresh parent employee list

### Error Handling Strategy

- All API calls wrapped in try/catch
- Display inline error banner (red) below section header on failure
- Optimistic UI for task completion with rollback
- Disable submit buttons during API calls (loading state)
- Show success toast/banner on checklist creation and offboarding start

---

## A3: Modal Specifications

### AddCandidateModal

**Location:** `app/src/components/modals/AddCandidateModal.jsx`

| Aspect | Detail |
|--------|--------|
| **API Call** | `onSubmit` prop (parent provides) -- should call `POST /api/candidates` |
| **Validation** | Name required, email required + regex, role required |
| **Fields** | name, email, role, stage (default: sourced), status (default: active), resumeUrl |
| **Success** | Resets form, calls `onClose` |
| **Error** | Displays inline red banner with error message |
| **Parent State** | Parent should refetch candidates list on success |
| **Gap** | No duplicate email check; no phone/location fields |

### PromoteModal

**Location:** `app/src/components/modals/PromoteModal.jsx`

| Aspect | Detail |
|--------|--------|
| **API Call** | `onConfirm` prop -- should call `POST /api/candidates/:id/promote` |
| **Validation** | Title required, department required, start date required |
| **Fields** | title, department (dropdown), startDate (DatePicker) |
| **Success** | Parent handler closes modal + closes CandidateDetailPanel |
| **Error** | No error display in modal itself (parent catches) |
| **Parent State** | Parent should refresh candidates list (candidate removed) + employees list (employee added) |
| **Gap** | No error banner in modal; no loading/submitting state on button; no manager assignment field |

### OffboardModal

**Location:** `app/src/components/modals/OffboardModal.jsx`

| Aspect | Detail |
|--------|--------|
| **API Call** | `onConfirm` prop -- parent calls `POST /api/offboarding/create` |
| **Validation** | Last day required, at least one track selected |
| **Fields** | lastDay (date input), trackIds (checkbox list of 3 hardcoded tracks) |
| **Success** | Parent closes modal |
| **Error** | No error display in modal (parent catches) |
| **Parent State** | Parent should refresh employee status |
| **Gaps** | Tracks are hardcoded (should fetch from API); task count estimate is naive (trackIds.length * 5); `/api/offboarding/create` endpoint does not exist; no loading state on confirm button |

### AssignDeviceModal

**Location:** `app/src/components/modals/AssignDeviceModal.jsx`

| Aspect | Detail |
|--------|--------|
| **API Call** | `POST /api/devices/:id/assign` -- **fully wired** |
| **Validation** | Employee selection required |
| **Fields** | employee dropdown (fetched from API), assignedDate (DatePicker), notes |
| **Success** | Calls `onSuccess` prop (parent refreshes) |
| **Error** | Inline red banner with server error message |
| **Parent State** | Parent calls `onRefresh` to reload device list |
| **Status** | Most complete modal -- has loading, submitting, error states |

### ReturnDeviceModal

**Location:** `app/src/components/modals/ReturnDeviceModal.jsx`

| Aspect | Detail |
|--------|--------|
| **API Call** | `PATCH /api/devices/:id/return` -- **fully wired** |
| **Validation** | None explicit (condition defaults to 'good') |
| **Fields** | returnedDate (DatePicker), condition (button group: new/good/fair/poor), notes |
| **Success** | Calls `onSuccess` prop (parent refreshes) |
| **Error** | Inline red banner with server error message |
| **Parent State** | Parent calls `onRefresh` to reload device list |
| **Status** | Fully wired with loading, submitting, error states |

---

## Effort Estimate

### Task Breakdown

| # | Task | Size | Notes |
|---|------|------|-------|
| 1 | Wire CandidateDetailPanel Save (PUT /api/candidates/:id) | S | Uncomment + add error/loading state |
| 2 | Wire CandidateDetailPanel Promote (POST /api/candidates/:id/promote) | S | Uncomment + add error state |
| 3 | Add Move Stage handler + confirmation | S | PATCH candidate stage field |
| 4 | Add Reject handler + confirmation dialog | S | PATCH candidate status='rejected' |
| 5 | Wire resume View/Download/Delete handlers | M | 3 actions, file serving |
| 6 | Wire skills persistence on change | S | PUT on skill toggle |
| 7 | Wire EmployeeDetailPanel Save (PUT /api/employees/:id) | S | Add API call + error/loading |
| 8 | Wire Reassign Manager (employee picker or input) | M | Needs employee search/dropdown |
| 9 | Replace hardcoded onboarding items with API fetch | M | GET runs + tasks, render dynamically |
| 10 | Wire handleMarkTaskComplete to API | S | PATCH task instance status |
| 11 | Replace hardcoded devices with API fetch in EmployeeDetailPanel | S | GET employee devices |
| 12 | Replace hardcoded activities with API fetch | S | GET employee activity log |
| 13 | Build POST /api/onboarding/checklists endpoint | M | Create run + task instances from template |
| 14 | Build POST /api/offboarding/create endpoint | M | Create offboarding runs, update employee status |
| 15 | Build TemplatePickerModal component | M | Fetch templates, select, confirm |
| 16 | Fix OffboardModal to fetch tracks from API | S | Replace hardcoded tracks array |
| 17 | Add error banners to PromoteModal | S | Display API errors inline |
| 18 | Add loading/submitting state to PromoteModal | S | Disable button during submit |
| 19 | Add loading/submitting state to OffboardModal | S | Disable button during submit |
| 20 | Add success toasts/feedback across all panels | M | Reusable toast component or callback |
| 21 | Add duplicate email validation to AddCandidateModal | S | Check before submit |

**Total: 21 tasks**
- Small (S): 14 tasks (~1-2 hours each)
- Medium (M): 7 tasks (~2-4 hours each)
- **Estimated total: 30-50 hours**

### Priority Order

**P0 -- Core wiring (must have):**
Tasks 1, 2, 7, 9, 10, 13, 14

**P1 -- Complete interactions:**
Tasks 3, 4, 5, 6, 8, 11, 12, 15, 16

**P2 -- Polish:**
Tasks 17, 18, 19, 20, 21
