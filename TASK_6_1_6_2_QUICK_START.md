# TASK 6.1-6.2: Quick Start Guide

## What Was Built

Comprehensive API for managing onboarding/offboarding runs and their tasks.

## Test Status
✅ **28/28 tests passing (100%)**

## Key Endpoints

### Onboarding Runs (Task 6.1)
```bash
# List runs for employee
GET /api/employees/:employeeId/onboarding-runs

# Get run details with progress
GET /api/onboarding-runs/:runId

# Update run status
PATCH /api/onboarding-runs/:runId
# Body: { "status": "in_progress|complete|pending" }

# Get pending tasks for dashboard
GET /api/dashboard/pending-tasks
```

### Task Instances (Task 6.2)
```bash
# Update task instance
PATCH /api/onboarding-runs/:runId/tasks/:taskId
# Body: { "status": "pending|in_progress|complete|skipped", "notes": "", "assignedTo": "" }

# List tasks for run
GET /api/onboarding-runs/:runId/tasks
```

## Implementation Details

### Service: `onboardingService.js`
- `getRuns(employeeId)` - List employee's runs
- `getRun(runId)` - Get run detail with progress
- `updateRunStatus(runId, data)` - Update run
- `updateTaskInstance(runId, taskId, data)` - Update task
- `getTaskInstances(runId)` - List tasks
- `getPendingTasksNextSevenDays()` - Get dashboard tasks
- `calculateProgress(tasks)` - Calculate % complete
- `calculateDueDate(startDate, offset)` - Calculate task due date

### Routes: `onboarding.js`
- 7 endpoints (GET, PATCH)
- Error handling with proper HTTP status codes
- Thin route layer (business logic in service)

### Tests: `onboarding.test.js`
- 28 comprehensive test cases
- Covers all endpoints and edge cases
- TDD approach

## Usage Examples

### Example 1: Get employee's runs
```javascript
const response = await fetch('/api/employees/emp123/onboarding-runs');
const { data } = await response.json();
// data = [
//   {
//     id: 'run1',
//     employeeId: 'emp123',
//     status: 'in_progress',
//     progress: 50,
//     taskCount: 4,
//     ...
//   }
// ]
```

### Example 2: Update task to complete
```javascript
const response = await fetch('/api/onboarding-runs/run1/tasks/task1', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    status: 'complete',
    notes: 'Equipment ready',
    assignedTo: 'ops'
  })
});
const { data } = await response.json();
// data.status = 'complete'
// data.completedAt = '2026-03-24T14:30:00Z'
```

### Example 3: Get pending tasks (7 day window)
```javascript
const response = await fetch('/api/dashboard/pending-tasks');
const { data } = await response.json();
// data = [
//   {
//     employeeId: 'emp1',
//     employee: { name: 'John Doe', ... },
//     tasks: [
//       {
//         id: 'task1',
//         status: 'pending',
//         dueDate: '2026-03-27',
//         ...
//       }
//     ]
//   }
// ]
```

## Error Handling

All endpoints return proper HTTP status codes:
- `200` - Success
- `400` - Bad request (invalid status, etc.)
- `404` - Not found (employee, run, task doesn't exist)
- `500` - Server error

Example error response:
```json
{
  "error": "Employee not found"
}
```

## Progress Calculation

Progress = (tasks marked complete or skipped) / total tasks × 100

Example:
- 4 tasks total
- 2 complete, 1 skipped, 1 pending
- Progress = (2+1)/4 × 100 = 75%

## Due Date Calculation

dueDate = startDate + dueDaysOffset days

Examples:
- startDate: 2026-03-24, offset: 7 → dueDate: 2026-03-31
- startDate: 2026-03-24, offset: -3 → dueDate: 2026-03-21
- startDate: 2026-03-24, offset: null → dueDate: null (no deadline)

## Integration Points

The router is already mounted in `/server/index.js`:
```javascript
app.use('/api', onboardingRouter);
```

All endpoints are available at `/api/...`

## Running Tests

```bash
# Run onboarding tests only
npm test -- server/tests/routes/onboarding.test.js

# Run with verbose output
npm test -- server/tests/routes/onboarding.test.js --verbose

# Run specific test
npm test -- server/tests/routes/onboarding.test.js --testNamePattern="should list all"
```

## Files Changed

| File | Type | Status |
|------|------|--------|
| server/services/onboardingService.js | New | 194 lines |
| server/routes/onboarding.js | Modified | 101 lines (skeleton replaced) |
| server/tests/routes/onboarding.test.js | New | 646 lines |

## Next Steps

Ready for frontend integration! All endpoints are:
- ✅ Fully functional
- ✅ Tested
- ✅ Error-handled
- ✅ Production-ready

Frontend can now:
1. Fetch employee's onboarding runs
2. Display run progress
3. Update task status
4. View pending tasks dashboard
5. Manage task assignments

## Support

For detailed information, see: `TASK_6_1_6_2_COMPLETION.md`

---

**Status:** Complete and Verified
**Test Coverage:** 28/28 tests passing
**Ready for Production:** Yes
