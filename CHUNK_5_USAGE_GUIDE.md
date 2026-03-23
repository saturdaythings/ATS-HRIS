# Notification Service - Usage Guide

## Overview

The Notification Service provides a complete REST API for managing employee notifications. It supports creating, reading, filtering, and managing notifications for various events (task assignments, due dates, completions, etc.).

---

## Quick Start

### 1. Create a Notification

```bash
curl -X POST http://localhost:3001/api/notifications \
  -H "Content-Type: application/json" \
  -d '{
    "type": "task_assignment",
    "description": "You have been assigned the IT onboarding checklist",
    "employeeId": "cuid-employee-id-here"
  }'
```

**Response (201 Created):**
```json
{
  "id": "cuid-notification-id",
  "type": "task_assignment",
  "description": "You have been assigned the IT onboarding checklist",
  "employeeId": "cuid-employee-id-here",
  "read": false,
  "createdAt": "2026-03-23T10:30:00.000Z",
  "updatedAt": "2026-03-23T10:30:00.000Z"
}
```

### 2. List Notifications for an Employee

```bash
curl http://localhost:3001/api/notifications/{employeeId}
```

**Response (200 OK):**
```json
[
  {
    "id": "cuid-1",
    "type": "task_assignment",
    "description": "You have been assigned the IT onboarding checklist",
    "employeeId": "cuid-employee-id",
    "read": false,
    "createdAt": "2026-03-23T10:30:00.000Z",
    "updatedAt": "2026-03-23T10:30:00.000Z"
  },
  {
    "id": "cuid-2",
    "type": "task_due",
    "description": "Your onboarding task is due today",
    "employeeId": "cuid-employee-id",
    "read": true,
    "createdAt": "2026-03-23T09:00:00.000Z",
    "updatedAt": "2026-03-23T09:30:00.000Z"
  }
]
```

**Notes:**
- Unread notifications appear first
- Ordered by createdAt DESC (newest first)
- Default limit: 25, offset: 0

### 3. Mark a Single Notification as Read

```bash
curl -X PATCH http://localhost:3001/api/notifications/{notificationId}
```

**Response (200 OK):**
```json
{
  "id": "cuid-notification-id",
  "type": "task_assignment",
  "description": "You have been assigned the IT onboarding checklist",
  "employeeId": "cuid-employee-id",
  "read": true,
  "createdAt": "2026-03-23T10:30:00.000Z",
  "updatedAt": "2026-03-23T10:31:00.000Z"
}
```

### 4. Mark All Notifications as Read

```bash
curl -X PATCH http://localhost:3001/api/notifications/read-all/{employeeId}
```

**Response (200 OK):**
```json
{
  "message": "Marked 3 notifications as read",
  "count": 3
}
```

### 5. Delete a Notification

```bash
curl -X DELETE http://localhost:3001/api/notifications/{notificationId}
```

**Response (204 No Content)** - No body returned

---

## Notification Types

The API supports 6 notification types:

| Type | Use Case |
|------|----------|
| `task_assignment` | New task assigned to employee |
| `task_due` | Task due date is approaching |
| `task_overdue` | Task is overdue |
| `employee_hired` | Employee onboarded/hired |
| `completion` | Task or checklist completed |
| `device_assigned` | Device assigned to employee |

---

## Query Parameters & Filtering

### List with Pagination

```bash
# Get first 10 notifications
curl "http://localhost:3001/api/notifications/{employeeId}?limit=10&offset=0"

# Get next 10 (skip first 10)
curl "http://localhost:3001/api/notifications/{employeeId}?limit=10&offset=10"
```

### Filter by Read Status

```bash
# Get only unread notifications
curl "http://localhost:3001/api/notifications/{employeeId}?read=false"

# Get only read notifications
curl "http://localhost:3001/api/notifications/{employeeId}?read=true"
```

### Combine Filters

```bash
# Get first 5 unread notifications
curl "http://localhost:3001/api/notifications/{employeeId}?limit=5&offset=0&read=false"
```

---

## Service Functions (Node.js)

For server-side integration, use the service directly:

```javascript
import {
  createNotification,
  getNotification,
  listNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  validateNotificationType,
} from '../server/services/notificationService.js';

// Create notification
const notification = await createNotification(
  'task_assignment',
  'You have a new task',
  employeeId
);

// List unread notifications
const unread = await listNotifications(employeeId, { read: false });

// Mark all as read
const result = await markAllAsRead(employeeId);
console.log(`Marked ${result.count} notifications as read`);

// Mark single as read
await markAsRead(notificationId);

// Delete notification
await deleteNotification(notificationId);
```

---

## Error Handling

### Invalid Notification Type

```bash
curl -X POST http://localhost:3001/api/notifications \
  -H "Content-Type: application/json" \
  -d '{
    "type": "invalid_type",
    "description": "Test",
    "employeeId": "emp-123"
  }'
```

**Response (500 Internal Server Error):**
```json
{
  "error": "Invalid notification type"
}
```

### Missing Required Fields

```bash
curl -X POST http://localhost:3001/api/notifications \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Test"
  }'
```

**Response (500 Internal Server Error):**
```json
{
  "error": "Notification type is required"
}
```

### Employee Not Found

```bash
curl -X POST http://localhost:3001/api/notifications \
  -H "Content-Type: application/json" \
  -d '{
    "type": "task_assignment",
    "description": "Test",
    "employeeId": "nonexistent-id"
  }'
```

**Response (500 Internal Server Error):**
```json
{
  "error": "Employee not found"
}
```

### Notification Not Found

```bash
curl -X PATCH http://localhost:3001/api/notifications/nonexistent-id
```

**Response (500 Internal Server Error):**
```json
{
  "error": "Notification not found"
}
```

---

## Integration Example

### Notify Employee on Task Assignment

```javascript
// In onboarding service
import { createNotification } from '../services/notificationService.js';

async function assignTaskToEmployee(employeeId, taskDescription) {
  // Create task (existing logic)
  const task = await db.onboardingTask.create({
    data: {
      employeeId,
      task: taskDescription,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      completed: false,
    },
  });

  // Create notification
  await createNotification(
    'task_assignment',
    `New task assigned: ${taskDescription}`,
    employeeId
  );

  return task;
}
```

### Notify on Due Date

```javascript
// Scheduled job (e.g., daily cron)
async function checkDueTasks() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const dueTasks = await db.onboardingTask.findMany({
    where: {
      dueDate: {
        gte: new Date(),
        lte: tomorrow,
      },
      completed: false,
    },
  });

  for (const task of dueTasks) {
    await createNotification(
      'task_due',
      `Task due: ${task.task}`,
      task.employeeId
    );
  }
}
```

### Notify on Completion

```javascript
// When task is completed
async function completeTask(taskId) {
  const task = await db.onboardingTask.update({
    where: { id: taskId },
    data: {
      completed: true,
      completedAt: new Date(),
    },
  });

  await createNotification(
    'completion',
    `Task completed: ${task.task}`,
    task.employeeId
  );

  return task;
}
```

---

## Testing

### Run Tests

```bash
# Service tests only
npm test -- server/tests/services/notificationService.test.js

# Route tests only
npm test -- server/tests/routes/notifications.test.js

# Both
npm test -- server/tests/services/notificationService.test.js server/tests/routes/notifications.test.js

# With coverage
npm test -- server/tests/services/notificationService.test.js --coverage
```

### Expected Results

```
Test Suites: 2 passed, 2 total
Tests:       50 passed, 50 total
Coverage:    97.61% (notificationService.js: 100%)
```

---

## Performance Considerations

### Pagination Defaults
- Default limit: 25 notifications
- Maximum limit: 100 (can be adjusted)
- Use offset for pagination, not cursor-based

### Database Indexes
The Notification model has a composite index:
```prisma
@@index([employeeId, read, createdAt])
```

This enables efficient filtering by:
- Employee (required)
- Read status (optional)
- Creation date (for sorting)

### Query Optimization
- Always filter by `employeeId` in queries
- Use `read` filter to reduce results
- Use pagination for large result sets
- Database will use indexes for fast lookups

---

## API Reference

| Endpoint | Method | Parameters | Status | Response |
|----------|--------|-----------|--------|----------|
| /api/notifications | POST | body: {type, description, employeeId} | 201 | notification |
| /api/notifications/:employeeId | GET | limit, offset, read | 200 | [notification] |
| /api/notifications/:notificationId | PATCH | - | 200 | notification |
| /api/notifications/read-all/:employeeId | PATCH | - | 200 | {message, count} |
| /api/notifications/:notificationId | DELETE | - | 204 | - |

---

## Troubleshooting

### Notifications not appearing?
1. Verify employeeId exists in database
2. Check notification was created (POST response status 201)
3. Ensure using correct endpoint GET /api/notifications/{employeeId}

### All notifications show as read?
1. Verify PATCH endpoint correctly updates read status
2. Check markAllAsRead wasn't accidentally called
3. Verify read filter query parameter: ?read=false

### 500 Errors?
1. Check error message in response
2. Verify all required fields in request body
3. Verify employeeId exists for employee operations
4. Check server logs for stack trace

---

## Future Enhancements

- Email delivery for notifications
- Notification scheduling (send at specific time)
- Notification templates with variables
- Archive instead of hard delete
- Read receipts with timestamp
- Notification preferences per employee
- Analytics and reporting

