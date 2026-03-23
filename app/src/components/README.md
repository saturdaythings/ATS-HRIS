# V.Two Ops - Component Library

## Phase 2 - Detail Panels & Modal Components

This document describes the detail panels, modal components, and supporting UI components built for V.Two Ops Phase 2.

---

## Components Overview

### Detail Panels (Rippling-style slide-in)

#### CandidateDetailPanel
- **Location:** `panels/CandidateDetailPanel.jsx`
- **Purpose:** View and edit candidate information with resume management
- **Props:**
  - `candidate` (object) - Candidate data
  - `isOpen` (boolean) - Controls panel visibility
  - `onClose` (function) - Callback when panel should close
- **Features:**
  - Overview tab: View/edit candidate details (name, email, role, stage, status, notes)
  - Resume tab: Upload, view, download resume
  - History tab: Activity timeline
  - Actions: Promote to Employee, Reject, Move Stage, Delete
  - Edit mode with form validation
  - Promote modal integration

#### EmployeeDetailPanel
- **Location:** `panels/EmployeeDetailPanel.jsx`
- **Purpose:** View and manage employee information, onboarding, and devices
- **Props:**
  - `employee` (object) - Employee data
  - `isOpen` (boolean) - Controls panel visibility
  - `onClose` (function) - Callback when panel should close
- **Features:**
  - Overview tab: View/edit employee details (name, email, title, department, start date, manager)
  - Onboarding tab: Checklist progress with task management
  - Devices tab: Assigned devices and return history
  - History tab: Activity timeline
  - Actions: Edit, Reassign Manager, Offboard
  - Responsive checklist with progress tracking

---

### Modal Components

#### PromoteModal
- **Location:** `modals/PromoteModal.jsx`
- **Purpose:** Modal for promoting a candidate to employee
- **Props:**
  - `candidate` (object) - Candidate being promoted
  - `onConfirm` (function) - Called with promotion data on confirm
  - `onCancel` (function) - Called when user cancels
- **Features:**
  - Form with validation (title, department, start date)
  - Department dropdown
  - Error messages for required fields
  - Smooth form interaction

---

### Form Components

#### ResumeUploadForm
- **Location:** `forms/ResumeUploadForm.jsx`
- **Purpose:** Drag-and-drop resume upload with validation
- **Props:**
  - `onUpload` (function) - Called with file info on successful upload
  - `onCancel` (function) - Called to exit upload mode
- **Features:**
  - Drag-and-drop zone
  - File type validation (PDF, DOCX only)
  - File size validation (max 10MB)
  - Upload progress indicator
  - Success/error feedback
  - Upload simulation (mock - ready for real API)

---

### Common Components

#### Badge
- **Location:** `common/Badge.jsx`
- **Purpose:** Status and category badges throughout the app
- **Props:**
  - `children` (string) - Badge text
  - `variant` (string) - 'default', 'active', 'inactive', 'rejected', 'pending', 'info'
  - `size` (string) - 'sm', 'md', 'lg'
- **Usage:**
  ```jsx
  <Badge variant="active">Active</Badge>
  <Badge variant="pending" size="sm">Pending</Badge>
  ```

#### ProgressBar
- **Location:** `common/ProgressBar.jsx`
- **Purpose:** Visual progress indicator for checklists and tasks
- **Props:**
  - `completed` (number) - Number of completed items
  - `total` (number) - Total items
  - `label` (boolean) - Show text label (default true)
  - `size` (string) - 'sm', 'md', 'lg'
- **Usage:**
  ```jsx
  <ProgressBar completed={5} total={10} />
  <ProgressBar completed={3} total={5} size="lg" label={false} />
  ```

#### Timeline
- **Location:** `common/Timeline.jsx`
- **Purpose:** Activity timeline visualization
- **Props:**
  - `activities` (array) - Activity objects with id, action, description, timestamp
- **Usage:**
  ```jsx
  <Timeline activities={[
    { id: 1, action: 'Candidate created', timestamp: new Date() }
  ]} />
  ```

---

## Styling

All components use **TailwindCSS** with the following color scheme:

- **Primary:** Purple-600 (#8B5CF6) - main actions
- **Neutral:** Slate colors - text, borders, backgrounds
- **Success:** Green - completed items
- **Warning:** Amber - at-risk items
- **Error:** Red - rejected/overdue items
- **Info:** Blue - informational badges

### Responsive Design

- **Mobile:** Full-screen panels (width: 100%)
- **Tablet:** 50% panel width
- **Desktop:** 40% panel width
- All components are touch-friendly

### Animations

- Panel slide-in/out: 300ms ease
- Badge transitions: smooth color changes
- Progress bar: smooth width transitions
- Overlay fade: 300ms ease

---

## Testing

### Test Files

- `__tests__/components/common/Badge.test.js` - Badge component tests
- `__tests__/components/common/ProgressBar.test.js` - Progress bar tests
- `__tests__/components/common/Timeline.test.js` - Timeline tests
- `__tests__/components/forms/ResumeUploadForm.test.js` - Form upload tests
- `__tests__/components/modals/PromoteModal.test.js` - Promotion modal tests
- `__tests__/components/panels/CandidateDetailPanel.test.js` - Candidate panel tests
- `__tests__/components/panels/EmployeeDetailPanel.test.js` - Employee panel tests
- `__tests__/integration/DetailPanels.integration.test.js` - Integration tests

### Running Tests

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

### Test Coverage

All components have unit tests covering:
- Component rendering
- Props handling
- User interactions (clicks, form inputs)
- State changes
- Tab switching
- Modal open/close
- Form validation
- Responsive behavior

---

## Usage Examples

### Using CandidateDetailPanel in a Page

```jsx
import { useState } from 'react';
import CandidateDetailPanel from '../components/panels/CandidateDetailPanel';

export default function HiringPage() {
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  const candidates = [
    { id: 1, name: 'John Doe', email: 'john@example.com', ... }
  ];

  return (
    <div>
      <table>
        <tbody>
          {candidates.map(candidate => (
            <tr key={candidate.id} onClick={() => setSelectedCandidate(candidate)}>
              <td>{candidate.name}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <CandidateDetailPanel
        candidate={selectedCandidate}
        isOpen={!!selectedCandidate}
        onClose={() => setSelectedCandidate(null)}
      />
    </div>
  );
}
```

### Using EmployeeDetailPanel in Directory

```jsx
import { useState } from 'react';
import EmployeeDetailPanel from '../components/panels/EmployeeDetailPanel';

export default function DirectoryPage() {
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const employees = [
    { id: 1, name: 'Jane Smith', email: 'jane@example.com', ... }
  ];

  return (
    <div>
      <table>
        <tbody>
          {employees.map(emp => (
            <tr key={emp.id} onClick={() => setSelectedEmployee(emp)}>
              <td>{emp.name}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <EmployeeDetailPanel
        employee={selectedEmployee}
        isOpen={!!selectedEmployee}
        onClose={() => setSelectedEmployee(null)}
      />
    </div>
  );
}
```

---

## API Integration (Phase 2B)

These components are currently using mock data. For Phase 2B, integrate with:

### Candidate endpoints
- `GET /api/candidates/:id` - Fetch candidate details
- `PATCH /api/candidates/:id` - Update candidate
- `POST /api/candidates/:id/promote` - Promote to employee
- `POST /api/candidates/:id/resume` - Upload resume

### Employee endpoints
- `GET /api/employees/:id` - Fetch employee with onboarding
- `PATCH /api/employees/:id` - Update employee
- `GET /api/employees/:id/onboarding` - Fetch onboarding checklist
- `PATCH /api/onboarding/:itemId` - Mark task complete

---

## Known Limitations & Future Improvements

- Resume upload is simulated (needs real S3/Cloud Storage integration)
- Notifications not yet implemented
- Email templates not yet integrated
- Device management is read-only (no assignment/removal)
- Onboarding tasks are static mock data
- No real-time updates or WebSocket integration

---

## File Structure

```
components/
├── common/
│   ├── Badge.jsx
│   ├── ProgressBar.jsx
│   └── Timeline.jsx
├── forms/
│   └── ResumeUploadForm.jsx
├── modals/
│   └── PromoteModal.jsx
├── panels/
│   ├── CandidateDetailPanel.jsx
│   └── EmployeeDetailPanel.jsx
└── README.md (this file)

__tests__/
├── components/
│   ├── common/
│   │   ├── Badge.test.js
│   │   ├── ProgressBar.test.js
│   │   └── Timeline.test.js
│   ├── forms/
│   │   └── ResumeUploadForm.test.js
│   ├── modals/
│   │   └── PromoteModal.test.js
│   └── panels/
│       ├── CandidateDetailPanel.test.js
│       └── EmployeeDetailPanel.test.js
├── integration/
│   └── DetailPanels.integration.test.js
└── setup.js
```

---

## Version History

- **v1.0.0** (Phase 2) - Initial detail panels and modal components
  - CandidateDetailPanel with edit, resume upload, and promotion
  - EmployeeDetailPanel with onboarding checklist and device tracking
  - Supporting badge, progress, and timeline components
  - Full test coverage
  - Rippling-inspired UI/UX
