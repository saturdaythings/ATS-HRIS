# Chunk-7: Candidate Pipeline - Usage Guide

## Quick Start

### View the Hiring Pipeline
1. Open the V.Two Ops app (http://localhost:5173 if using Vite dev server)
2. Click "Hiring" in the left sidebar under "People"
3. You'll see 5 Kanban columns: Sourced, Screening, Interview, Offer, Hired

### Add a New Candidate
1. Click the **"+ Add Candidate"** button in the top right
2. Fill in the form:
   - **Name**: Candidate's full name (required)
   - **Email**: Candidate's email address (required)
   - **Role**: Job position they're applying for (required)
   - **Resume**: Click "Upload Resume" to add a PDF/DOCX file
3. Click **"Add Candidate"** to save
4. The candidate will appear in the "Sourced" column

### Search Candidates
1. Use the **search bar** at the top to filter candidates
2. Search by:
   - Candidate name
   - Email address
   - Job role
3. Results filter in real-time as you type
4. Clear the search to see all candidates

### View Candidate Details
1. Click any **candidate card** in the Kanban board
2. A side panel opens showing:
   - Name, email, role
   - Current stage and status
   - Resume (if uploaded)
   - Activity timeline
3. In the panel, you can:
   - Edit candidate details
   - Promote to employee (moves to Employees)
   - Change stage manually
   - Upload/replace resume
   - Add notes
   - Reject candidate
4. Click the **X button** or outside the panel to close

### Move Candidates Between Stages
**Option 1: Drag and Drop** (Phase 3)
- In desktop view, you can drag candidate cards between columns
- Drop to move them to a new stage

**Option 2: Detail Panel**
1. Click the candidate card to open the detail panel
2. Click **"Move Stage"** button
3. Select new stage from dropdown
4. Click **"Save Changes"**

### Mobile View
- On screens smaller than 1024px wide, the Kanban board switches to list view
- Each stage is displayed as a section with candidates listed below
- All features work the same way (search, detail panel, add candidate)

---

## Component Architecture

```
Hiring Page (pages/people/Hiring.jsx)
├── Header (search, add button, candidate count)
├── KanbanBoard (responsive board component)
│   ├── KanbanColumn (5 columns for each stage)
│   │   └── Candidate cards (clickable)
│   └── [Mobile fallback: list view]
├── CandidateDetailPanel (side panel - from Chunk-6)
└── AddCandidateModal (quick-add form)
    └── ResumeUploadForm (drag-drop file upload)
```

## Hook API: useCandidates()

### Usage
```javascript
import { useCandidates } from '@/hooks/useCandidates';

const {
  candidates,          // Array of candidate objects
  loading,             // Boolean: API call in progress
  error,               // String: error message or null
  fetchCandidates,     // Function: fetch candidates
  createCandidate,     // Function: create new candidate
  updateCandidate,     // Function: update existing candidate
  deleteCandidate,     // Function: delete candidate
  getCandidatesByStage, // Function: group candidates by stage
  getCountByStage,     // Function: count candidates per stage
  filterCandidates,    // Function: filter with predicate
  setCandidates,       // Function: manual state update
} = useCandidates();
```

### Methods

#### fetchCandidates(filters)
Fetch candidates from the server with optional filters.
```javascript
// Fetch all candidates
await fetchCandidates();

// Fetch with filters
await fetchCandidates({
  stage: 'interview',
  status: 'active',
  searchTerm: 'John'
});
```

#### createCandidate(data)
Create a new candidate.
```javascript
await createCandidate({
  name: 'Jane Doe',
  email: 'jane@example.com',
  role: 'Software Engineer',
  stage: 'sourced',        // optional, defaults to 'sourced'
  status: 'active',        // optional, defaults to 'active'
  resumeUrl: 'http://...'  // optional
});
```

#### updateCandidate(id, updates)
Update an existing candidate (stage change, status change, etc.).
```javascript
// Change stage
await updateCandidate('candidate-id', { stage: 'interview' });

// Update multiple fields
await updateCandidate('candidate-id', {
  stage: 'offer',
  notes: 'Strong technical background'
});
```

#### deleteCandidate(id)
Delete a candidate from the system.
```javascript
await deleteCandidate('candidate-id');
```

#### getCandidatesByStage()
Group all candidates by their current stage.
```javascript
const grouped = getCandidatesByStage();
// Returns: {
//   sourced: [...],
//   screening: [...],
//   interview: [...],
//   offer: [...],
//   hired: [...]
// }
```

#### getCountByStage()
Get the count of candidates in each stage.
```javascript
const counts = getCountByStage();
// Returns: { sourced: 5, screening: 3, interview: 2, offer: 1, hired: 10 }
```

#### filterCandidates(predicate)
Filter candidates locally using a predicate function.
```javascript
const engineers = filterCandidates(c => c.role.includes('Engineer'));
```

---

## API Endpoints Used

All endpoints are already integrated in the useCandidates hook:

### GET /api/candidates
List all candidates with optional filters.
```javascript
// Query params
?stage=interview
?status=active
?search=john
```

Response:
```json
{
  "candidates": [
    {
      "id": "cuid1",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "Software Engineer",
      "stage": "interview",
      "status": "active",
      "notes": "...",
      "resumeUrl": "...",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-05T00:00:00Z"
    }
  ]
}
```

### POST /api/candidates
Create a new candidate.

Request body:
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "role": "Product Manager",
  "stage": "sourced",
  "status": "active",
  "resumeUrl": "http://..."
}
```

### PATCH /api/candidates/:id
Update candidate (most commonly used to change stage).

Request body:
```json
{
  "stage": "screening",
  "status": "active",
  "notes": "Interview scheduled for Friday"
}
```

### DELETE /api/candidates/:id
Delete candidate (no request body).

---

## Styling & Design

### Colors by Stage
- **Sourced** (blue): Initial application received
- **Screening** (yellow): Resume reviewed, awaiting screening call
- **Interview** (purple): Interview scheduled/in progress
- **Offer** (pink): Offer extended, awaiting response
- **Hired** (green): Accepted offer, now employee

### Responsive Breakpoints
- **Mobile** (<1024px): List view layout
- **Desktop** (≥1024px): Kanban grid layout

### TailwindCSS Classes
Key classes used:
- `grid grid-cols-5 gap-4`: Kanban column layout
- `bg-blue-50`, `bg-yellow-50`, etc.: Column backgrounds
- `border-2 border-blue-200`: Column borders
- `hover:border-purple-400`: Interactive feedback
- `transform transition-all`: Smooth animations

---

## Testing

### Run All Tests
```bash
cd app
npm test -- --testPathPattern="useCandidates|KanbanBoard|KanbanColumn|AddCandidateModal|Hiring"
```

### Run Specific Component Tests
```bash
# Hook tests
npm test -- --testPathPattern="useCandidates"

# Component tests
npm test -- --testPathPattern="KanbanBoard"
npm test -- --testPathPattern="AddCandidateModal"

# Page tests
npm test -- --testPathPattern="Hiring"
```

### Run with Coverage
```bash
npm test -- --testPathPattern="useCandidates|KanbanBoard|KanbanColumn|AddCandidateModal|Hiring" --coverage
```

### Coverage Targets
- useCandidates.js: 94.25% (target: >90%)
- AddCandidateModal.jsx: 85.29% (target: >80%)
- Hiring.jsx: 83.72% (target: >80%)
- KanbanBoard.jsx: 75.86% (target: >70%)
- KanbanColumn.jsx: 73.33% (target: >70%)

---

## Common Tasks

### Add Candidate Programmatically
```javascript
import { useCandidates } from '@/hooks/useCandidates';

function MyComponent() {
  const { createCandidate } = useCandidates();

  const handleAdd = async () => {
    try {
      await createCandidate({
        name: 'Alice Smith',
        email: 'alice@example.com',
        role: 'UI Designer'
      });
      // Success - candidate added and visible in board
    } catch (error) {
      console.error('Failed to add candidate:', error);
    }
  };

  return <button onClick={handleAdd}>Add Alice</button>;
}
```

### Move Candidate to New Stage
```javascript
const { updateCandidate } = useCandidates();

// Move to next stage
await updateCandidate('candidate-id', {
  stage: 'interview'
});
```

### Filter for High-Priority Candidates
```javascript
const { candidates, filterCandidates } = useCandidates();

const interviewStage = filterCandidates(c => c.stage === 'interview');
const recentCandidates = filterCandidates(c => {
  const days = (Date.now() - new Date(c.createdAt)) / (1000 * 60 * 60 * 24);
  return days < 7;
});
```

---

## Troubleshooting

### Candidates Not Showing
1. Check browser console for errors
2. Verify API server is running (localhost:3001)
3. Try refreshing the page (Ctrl+R)
4. Check if candidates are actually in the database

### Search Not Working
1. Search is case-insensitive
2. Searches across name, email, and role fields
3. Try a different search term
4. Clear search and reload

### Add Candidate Modal Not Opening
1. Check browser console for JavaScript errors
2. Verify ResumeUploadForm component is imported
3. Try refreshing the page

### Drag-Drop Not Working
1. Currently in implementation-ready state (Phase 3)
2. Use detail panel to move between stages for now
3. Drag-drop will be enabled in next phase

### Resume Upload Failing
1. Check file size (max 10MB)
2. Verify file type (PDF or DOCX only)
3. Check browser console for network errors
4. Ensure upload service is running

---

## Performance Notes

- Candidates are fetched once on page load
- Search filters happen client-side (fast but limits scalability)
- Drag-drop is virtualized for performance (Phase 3)
- Resume uploads are streamed to avoid memory issues
- Pagination can be added for large datasets (Phase 3)

---

## Next Steps (Phase 3)

- Full drag-drop with visual feedback
- Bulk candidate actions
- Advanced filtering (date range, tags, status)
- Export candidates (CSV, PDF)
- Candidate comparison tool
- Activity timeline enhancements
- Integration with email/calendar

---

**For more information, see the Completion Report: CHUNK_7_COMPLETION_REPORT.md**
