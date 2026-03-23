# Chunk-4: Onboarding Service - Quick Start Guide

## Overview

The Onboarding Service provides a complete system for defining role-based onboarding templates and managing employee onboarding checklists. Templates are reusable task definitions; checklists are employee-specific instances.

---

## Quick Start

### 1. Create an Onboarding Template

```javascript
// Using the service directly
import { createTemplate } from './services/onboardingService.js';

const template = await createTemplate({
  name: 'Junior Engineer Onboarding',
  role: 'Junior Engineer',
  items: [
    { task: 'Setup development environment', assignedTo: 'IT', daysUntilDue: 1 },
    { task: 'Complete security training', assignedTo: 'HR', daysUntilDue: 3 },
    { task: 'Meet with direct manager', assignedTo: 'Manager', daysUntilDue: 1 },
    { task: 'Code review training', assignedTo: 'Engineering Lead', daysUntilDue: 5 }
  ]
});
```

### 2. Create a Checklist for an Employee

```javascript
import { createChecklistFromTemplate } from './services/onboardingService.js';

const checklist = await createChecklistFromTemplate('emp_123', 'template_456');
// Items automatically created from template with calculated due dates
```

### 3. Track Completion

```javascript
import { markItemComplete, getChecklistProgress } from './services/onboardingService.js';

// Mark item complete
await markItemComplete('item_789', 'alice@company.com');

// Get progress
const progress = await getChecklistProgress('checklist_123');
console.log(`${progress.completed}/${progress.total} items complete (${progress.percentage}%)`);
```

---

## API Endpoints Reference

### Templates (Admin)

#### Create Template
```http
POST /api/onboarding/templates
Content-Type: application/json

{
  "name": "Product Manager Onboarding",
  "role": "Product Manager",
  "items": [
    { "task": "Review product roadmap", "assignedTo": "VP Product", "daysUntilDue": 2 },
    { "task": "Meet with teams", "assignedTo": "Manager", "daysUntilDue": 3 }
  ]
}
```

**Response (201):**
```json
{
  "data": {
    "id": "template_123",
    "name": "Product Manager Onboarding",
    "role": "Product Manager",
    "items": [
      { "id": "item_1", "task": "Review product roadmap", "dueDate": "2026-03-25T..." },
      { "id": "item_2", "task": "Meet with teams", "dueDate": "2026-03-26T..." }
    ],
    "createdAt": "2026-03-23T..."
  },
  "error": null
}
```

#### List Templates
```http
GET /api/onboarding/templates
GET /api/onboarding/templates?role=Engineer
```

**Response:**
```json
{
  "data": [
    { "id": "template_1", "name": "...", "role": "Engineer", "items": [...] },
    { "id": "template_2", "name": "...", "role": "Engineer", "items": [...] }
  ],
  "error": null
}
```

#### Get Single Template
```http
GET /api/onboarding/templates/{templateId}
```

#### Update Template
```http
PATCH /api/onboarding/templates/{templateId}
Content-Type: application/json

{
  "name": "Updated Name",
  "items": [
    { "task": "New task", "assignedTo": "HR", "daysUntilDue": 2 }
  ]
}
```

#### Delete Template
```http
DELETE /api/onboarding/templates/{templateId}
```

**Response:** 204 No Content

---

### Checklists (Employee-Specific)

#### Create Checklist
```http
POST /api/onboarding/checklists
Content-Type: application/json

{
  "employeeId": "emp_abc123",
  "templateId": "template_xyz789"
}
```

**Response (201):**
```json
{
  "data": {
    "id": "checklist_123",
    "employeeId": "emp_abc123",
    "templateId": "template_xyz789",
    "status": "active",
    "items": [
      {
        "id": "item_1",
        "task": "Setup laptop",
        "assignedTo": "IT",
        "dueDate": "2026-03-24T10:00:00Z",
        "completed": false,
        "completedAt": null,
        "completedBy": null
      },
      {
        "id": "item_2",
        "task": "Security training",
        "assignedTo": "HR",
        "dueDate": "2026-03-26T10:00:00Z",
        "completed": false,
        "completedAt": null,
        "completedBy": null
      }
    ],
    "createdAt": "2026-03-23T..."
  },
  "error": null
}
```

#### List Employee Checklists
```http
GET /api/onboarding/checklists/{employeeId}
```

**Response:**
```json
{
  "data": [
    {
      "id": "checklist_1",
      "templateId": "template_1",
      "status": "active",
      "items": [...],
      "createdAt": "2026-03-23T..."
    }
  ],
  "error": null
}
```

#### Get Checklist Details
```http
GET /api/onboarding/checklists/detail/{checklistId}
```

#### Get Checklist Progress
```http
GET /api/onboarding/checklists/{checklistId}/progress
```

**Response:**
```json
{
  "data": {
    "total": 4,
    "completed": 2,
    "percentage": 50
  },
  "error": null
}
```

#### Mark Item Complete
```http
PATCH /api/onboarding/checklists/{checklistId}/items/{itemId}
Content-Type: application/json

{
  "completedBy": "alice@company.com"
}
```

**Response:**
```json
{
  "data": {
    "id": "item_1",
    "task": "Setup laptop",
    "completed": true,
    "completedAt": "2026-03-23T14:30:00Z",
    "completedBy": "alice@company.com"
  },
  "error": null
}
```

---

## Data Model

### OnboardingTemplate
- `id` (String, unique ID)
- `name` (String) - Template name
- `role` (String) - Job role this template applies to
- `items` (OnboardingTemplateItem[]) - Task definitions
- `checklists` (OnboardingChecklist[]) - Employee instances
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

### OnboardingTemplateItem
- `id` (String, unique ID)
- `templateId` (String, FK)
- `task` (String) - Task description
- `assignedTo` (String) - Role/person responsible
- `dueDate` (DateTime) - When task is due
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

### OnboardingChecklist
- `id` (String, unique ID)
- `employeeId` (String, FK)
- `templateId` (String, FK)
- `status` (String) - "active", "completed", "cancelled"
- `items` (OnboardingChecklistItem[]) - Employee task instances
- `completedAt` (DateTime) - When all items completed
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

### OnboardingChecklistItem
- `id` (String, unique ID)
- `checklistId` (String, FK)
- `task` (String) - Task description
- `assignedTo` (String) - Initial role/person assigned
- `assignedToEmployeeId` (String, FK, optional) - Specific employee
- `dueDate` (DateTime) - When task is due
- `completed` (Boolean) - Completion status
- `completedAt` (DateTime) - Completion timestamp
- `completedBy` (String) - Who completed it
- `notes` (String, optional) - Notes on completion
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

---

## Common Patterns

### Pattern 1: New Hire Onboarding Flow
```javascript
// 1. When candidate becomes employee
const employee = await createEmployee({...});

// 2. Get their role-based template
const templates = await listTemplates({ role: employee.role });
const template = templates[0];

// 3. Create their checklist
const checklist = await createChecklistFromTemplate(employee.id, template.id);

// 4. Notify assigned team members
// [Implementation in Phase 2 Notifications]
```

### Pattern 2: Track Onboarding Progress
```javascript
// In dashboard/employee profile
const checklists = await listChecklistsByEmployee(employeeId);
const progress = await getChecklistProgress(checklists[0].id);

if (progress.percentage === 100) {
  // Onboarding complete!
  // Update employee status to "fully onboarded"
}
```

### Pattern 3: Admin Updates Task
```javascript
// Update template for future hires
const updated = await updateTemplate(templateId, {
  items: newItemsList // Add new security training requirement
});
// Existing checklists not affected
```

---

## Error Handling

All endpoints return consistent error responses:

```json
{
  "error": "Template not found",
  "data": null
}
```

### Common Errors

| Error | Cause | HTTP Status |
|-------|-------|------------|
| "Template name is required" | Missing name in request | 400 |
| "Template not found" | Invalid template ID | 404 |
| "Employee not found" | Invalid employee ID | 404 |
| "Days until due must be positive" | Negative/zero days | 400 |
| "Task is required for all items" | Missing task in item | 400 |

---

## Testing

Run tests:
```bash
npm test -- server/tests/services/onboardingService.test.js
```

Run with coverage:
```bash
npm test -- server/tests/services/onboardingService.test.js --coverage
```

All 40 tests passing ✅
Coverage: 96.1% statements, 100% functions

---

## Integration Notes

- Uses Prisma ORM for database access
- Follows project error handling patterns
- Compatible with existing employee and notification systems
- Ready for Phase 2-3 extensions (analytics, notifications)

---

## Support

For issues or questions, check:
1. Test file: `server/tests/services/onboardingService.test.js`
2. Service implementation: `server/services/onboardingService.js`
3. Routes: `server/routes/onboarding.js`
