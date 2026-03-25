# API Reference — V.Two Ops

Complete documentation for all 25 REST API endpoints. Use this to understand data structures and build integrations.

---

## Base URL

```
Development:  http://localhost:3001/api
Production:   https://your-backend-url.railway.app/api
```

All responses are JSON. No API key required (session-based auth).

---

## Response Format

### Success Response

```json
{
  "status": "success",
  "data": { /* payload */ }
}
```

### Error Response

```json
{
  "status": "error",
  "message": "Human-readable error message",
  "code": "ERROR_CODE"
}
```

---

## Health & Diagnostics

### GET /health

Basic health check. No auth required.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-03-24T10:30:00Z",
  "version": "1.0.0",
  "uptime": 3600
}
```

**Usage:**
```bash
curl https://your-api/api/health
```

---

### GET /admin/health

Detailed system health. Admin only.

**Response:**
```json
{
  "status": "ok",
  "database": "connected",
  "uptime": 3600,
  "memory": {
    "heapUsed": 52428800,
    "heapTotal": 209715200
  },
  "database": {
    "connections": 5,
    "queries_total": 1243,
    "avg_query_time_ms": 12
  }
}
```

---

## Authentication

### POST /auth/login

User login. Creates session cookie.

**Request:**
```json
{
  "email": "user@company.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "user": {
    "id": "user123",
    "email": "user@company.com",
    "role": "admin",
    "name": "John Doe"
  },
  "sessionId": "sess_xyz123"
}
```

**Error (401):**
```json
{
  "message": "Invalid email or password"
}
```

---

### POST /auth/logout

User logout. Clears session.

**Response (200):**
```json
{
  "message": "Logged out successfully"
}
```

---

### GET /auth/me

Get current user profile.

**Response (200):**
```json
{
  "user": {
    "id": "user123",
    "email": "user@company.com",
    "name": "John Doe",
    "role": "admin",
    "department": "HR"
  }
}
```

**Error (401):** Not authenticated

---

## Candidates

### GET /candidates

List all candidates. Returns paginated results.

**Query Parameters:**
| Param | Type | Example | Description |
|-------|------|---------|-------------|
| `stage` | string | `prospect` | Filter by stage: prospect, applied, interviewing, offered, hired, rejected |
| `search` | string | `john` | Search in name, email, phone |
| `limit` | number | `20` | Items per page (default: 20, max: 100) |
| `offset` | number | `40` | Pagination offset |
| `sort` | string | `name` | Sort field: name, email, created, stage |
| `order` | string | `asc` | Sort order: asc, desc |

**Response (200):**
```json
{
  "candidates": [
    {
      "id": "cand_001",
      "name": "Alice Johnson",
      "email": "alice@example.com",
      "phone": "(555) 123-4567",
      "position": "Software Engineer",
      "stage": "interviewing",
      "resumeUrl": "https://...",
      "notes": "Strong technical skills",
      "createdAt": "2024-03-01T10:00:00Z",
      "updatedAt": "2024-03-24T15:30:00Z"
    }
  ],
  "pagination": {
    "total": 45,
    "limit": 20,
    "offset": 0,
    "pages": 3
  }
}
```

**Usage:**
```bash
curl https://your-api/api/candidates?stage=interviewing&limit=20
curl https://your-api/api/candidates?search=john&sort=name&order=asc
```

---

### GET /candidates/:id

Get single candidate.

**Response (200):**
```json
{
  "candidate": {
    "id": "cand_001",
    "name": "Alice Johnson",
    "email": "alice@example.com",
    "phone": "(555) 123-4567",
    "position": "Software Engineer",
    "stage": "interviewing",
    "resumeUrl": "https://...",
    "notes": "Strong technical skills",
    "interviews": [
      {
        "id": "int_001",
        "type": "phone",
        "date": "2024-03-15T14:00:00Z",
        "interviewer": "Bob Smith",
        "notes": "Excellent communication",
        "rating": 4.5
      }
    ],
    "offers": [
      {
        "id": "off_001",
        "position": "Software Engineer",
        "salary": 120000,
        "benefits": "Health, 401k, stock options",
        "offerDate": "2024-03-20T09:00:00Z",
        "status": "pending"
      }
    ],
    "createdAt": "2024-03-01T10:00:00Z"
  }
}
```

---

### POST /candidates

Create new candidate.

**Request:**
```json
{
  "name": "Alice Johnson",
  "email": "alice@example.com",
  "phone": "(555) 123-4567",
  "position": "Software Engineer",
  "resumeUrl": "https://drive.google.com/...",
  "notes": "Referral from John"
}
```

**Response (201):**
```json
{
  "candidate": {
    "id": "cand_new_001",
    "name": "Alice Johnson",
    "email": "alice@example.com",
    "phone": "(555) 123-4567",
    "position": "Software Engineer",
    "stage": "prospect",
    "resumeUrl": "https://...",
    "notes": "Referral from John",
    "createdAt": "2024-03-24T16:00:00Z"
  }
}
```

**Error (400):**
```json
{
  "message": "Email already exists",
  "errors": {
    "email": "Candidate with this email already exists"
  }
}
```

---

### PUT /candidates/:id

Update candidate.

**Request:**
```json
{
  "stage": "offered",
  "notes": "Updated notes"
}
```

**Response (200):**
```json
{
  "candidate": {
    "id": "cand_001",
    "name": "Alice Johnson",
    "stage": "offered",
    "notes": "Updated notes",
    "updatedAt": "2024-03-24T16:05:00Z"
  }
}
```

---

### DELETE /candidates/:id

Delete candidate.

**Response (200):**
```json
{
  "message": "Candidate deleted"
}
```

---

### POST /candidates/:id/promote

Promote candidate to employee.

**Request:**
```json
{
  "startDate": "2024-04-01",
  "department": "Engineering",
  "role": "Senior Software Engineer",
  "manager": "Bob Smith"
}
```

**Response (201):**
```json
{
  "employee": {
    "id": "emp_001",
    "name": "Alice Johnson",
    "email": "alice@example.com",
    "department": "Engineering",
    "role": "Senior Software Engineer",
    "hireDate": "2024-04-01",
    "manager": "Bob Smith",
    "status": "active",
    "createdAt": "2024-03-24T16:10:00Z"
  },
  "onboardingTasks": [
    {
      "id": "task_001",
      "task": "Background check",
      "category": "compliance",
      "dueDate": "2024-03-28",
      "completed": false
    }
  ]
}
```

---

## Employees

### GET /employees

List all employees. Paginated like candidates.

**Query Parameters:**
| Param | Type | Example | Description |
|-------|------|---------|-------------|
| `status` | string | `active` | active, onboarding, offboarding, departed |
| `department` | string | `Engineering` | Filter by department |
| `search` | string | `john` | Search in name, email |
| `limit` | number | `20` | Items per page |
| `offset` | number | `0` | Pagination offset |

**Response (200):**
```json
{
  "employees": [
    {
      "id": "emp_001",
      "name": "Alice Johnson",
      "email": "alice@example.com",
      "phone": "(555) 123-4567",
      "department": "Engineering",
      "role": "Senior Software Engineer",
      "hireDate": "2024-04-01",
      "manager": "Bob Smith",
      "status": "active",
      "devices": [
        {
          "id": "dev_001",
          "name": "MacBook Pro 14\"",
          "type": "laptop",
          "serial": "ABC123XYZ"
        }
      ],
      "createdAt": "2024-03-24T16:10:00Z"
    }
  ],
  "pagination": { /* ... */ }
}
```

---

### GET /employees/:id

Get single employee with full details.

**Response (200):**
```json
{
  "employee": {
    "id": "emp_001",
    "name": "Alice Johnson",
    "email": "alice@example.com",
    "phone": "(555) 123-4567",
    "department": "Engineering",
    "role": "Senior Software Engineer",
    "hireDate": "2024-04-01",
    "manager": "Bob Smith",
    "status": "active",
    "onboardingProgress": 0.75,
    "devices": [
      {
        "id": "dev_001",
        "name": "MacBook Pro 14\"",
        "type": "laptop",
        "serial": "ABC123XYZ",
        "assignedDate": "2024-04-01"
      }
    ],
    "onboardingTasks": [
      {
        "id": "task_001",
        "task": "Background check",
        "completed": true,
        "completedAt": "2024-03-27T10:00:00Z"
      }
    ]
  }
}
```

---

### POST /employees

Create new employee (without promoting candidate).

**Request:**
```json
{
  "name": "Bob Smith",
  "email": "bob@company.com",
  "phone": "(555) 987-6543",
  "department": "Sales",
  "role": "Sales Manager",
  "hireDate": "2024-03-15",
  "manager": "Carol White"
}
```

**Response (201):** Employee object (same as GET /:id)

---

### PUT /employees/:id

Update employee.

**Request:**
```json
{
  "role": "Principal Engineer",
  "department": "R&D",
  "manager": "David Brown"
}
```

**Response (200):** Updated employee object

---

### DELETE /employees/:id

Soft delete employee (marks as departed). Triggers offboarding.

**Request:**
```json
{
  "lastDay": "2024-04-30",
  "reason": "resignation"
}
```

**Response (200):**
```json
{
  "employee": {
    "id": "emp_001",
    "status": "departed",
    "offboardingTasks": [
      { "task": "Collect laptop", "completed": false },
      { "task": "Transfer documents", "completed": false },
      { "task": "Revoke access", "completed": false }
    ]
  }
}
```

---

## Devices

### GET /devices

List devices. Paginated.

**Query Parameters:**
| Param | Type | Example | Description |
|-------|------|---------|-------------|
| `status` | string | `available` | available, assigned, in-repair, retired |
| `type` | string | `laptop` | laptop, phone, monitor, keyboard, etc |
| `search` | string | `macbook` | Search in name, model, serial |
| `assignedTo` | string | `emp_001` | Filter by assigned employee |

**Response (200):**
```json
{
  "devices": [
    {
      "id": "dev_001",
      "name": "MacBook Pro 14\" - AL001",
      "type": "laptop",
      "make": "Apple",
      "model": "MacBook Pro 14-inch",
      "serial": "ABC123XYZ",
      "condition": "excellent",
      "purchaseDate": "2023-06-15",
      "warrantyExpiration": "2024-06-15",
      "location": "Office A",
      "status": "assigned",
      "assignedTo": {
        "id": "emp_001",
        "name": "Alice Johnson"
      },
      "assignedDate": "2024-04-01"
    }
  ],
  "pagination": { /* ... */ }
}
```

---

### GET /devices/:id

Get single device details.

**Response (200):**
```json
{
  "device": {
    "id": "dev_001",
    "name": "MacBook Pro 14\" - AL001",
    "type": "laptop",
    "make": "Apple",
    "model": "MacBook Pro 14-inch",
    "serial": "ABC123XYZ",
    "condition": "excellent",
    "purchaseDate": "2023-06-15",
    "warrantyExpiration": "2024-06-15",
    "location": "Office A",
    "status": "assigned",
    "assignedTo": {
      "id": "emp_001",
      "name": "Alice Johnson"
    },
    "assignmentHistory": [
      {
        "employee": "Alice Johnson",
        "assignedDate": "2024-04-01",
        "returnDate": null,
        "conditionOnReturn": null
      }
    ]
  }
}
```

---

### POST /devices

Add device to inventory.

**Request:**
```json
{
  "name": "MacBook Pro 14\" - AL001",
  "type": "laptop",
  "make": "Apple",
  "model": "MacBook Pro 14-inch",
  "serial": "ABC123XYZ",
  "condition": "excellent",
  "purchaseDate": "2023-06-15",
  "warrantyExpiration": "2024-06-15",
  "location": "Office A"
}
```

**Response (201):** Device object

---

### PUT /devices/:id

Update device details.

**Request:**
```json
{
  "condition": "good",
  "location": "Office B"
}
```

**Response (200):** Updated device object

---

### DELETE /devices/:id

Remove device from inventory.

**Response (200):**
```json
{
  "message": "Device deleted"
}
```

---

## Assignments

### GET /assignments

List all device assignments.

**Query Parameters:**
| Param | Type | Example | Description |
|-------|------|---------|-------------|
| `status` | string | `active` | active, returned |
| `employee` | string | `emp_001` | Filter by employee |
| `device` | string | `dev_001` | Filter by device |

**Response (200):**
```json
{
  "assignments": [
    {
      "id": "asgn_001",
      "device": {
        "id": "dev_001",
        "name": "MacBook Pro 14\"",
        "serial": "ABC123XYZ"
      },
      "employee": {
        "id": "emp_001",
        "name": "Alice Johnson"
      },
      "assignedDate": "2024-04-01",
      "returnDate": null,
      "status": "active"
    }
  ]
}
```

---

### POST /assignments

Assign device to employee.

**Request:**
```json
{
  "deviceId": "dev_001",
  "employeeId": "emp_001",
  "assignedDate": "2024-04-01",
  "notes": "Assigned during onboarding"
}
```

**Response (201):**
```json
{
  "assignment": {
    "id": "asgn_001",
    "device": { /* device object */ },
    "employee": { /* employee object */ },
    "assignedDate": "2024-04-01",
    "status": "active"
  }
}
```

**Error (409):**
```json
{
  "message": "Device already assigned to another employee"
}
```

---

### PUT /assignments/:id

Return device (mark assignment as returned).

**Request:**
```json
{
  "returnDate": "2024-04-30",
  "conditionOnReturn": "good",
  "notes": "Device returned in good condition"
}
```

**Response (200):**
```json
{
  "assignment": {
    "id": "asgn_001",
    "device": { /* device object */ },
    "employee": { /* employee object */ },
    "assignedDate": "2024-04-01",
    "returnDate": "2024-04-30",
    "status": "returned",
    "conditionOnReturn": "good"
  }
}
```

---

## Interviews

### GET /interviews

List interviews.

**Query Parameters:**
| Param | Type | Example | Description |
|-------|------|---------|-------------|
| `candidate` | string | `cand_001` | Filter by candidate |
| `status` | string | `completed` | scheduled, completed, cancelled |
| `date` | string | `2024-03-24` | Filter by date |

**Response (200):**
```json
{
  "interviews": [
    {
      "id": "int_001",
      "candidate": {
        "id": "cand_001",
        "name": "Alice Johnson"
      },
      "type": "phone",
      "date": "2024-03-15T14:00:00Z",
      "interviewer": "Bob Smith",
      "notes": "Excellent communication skills",
      "rating": 4.5,
      "nextSteps": "Schedule in-person round"
    }
  ]
}
```

---

### POST /interviews

Create interview record.

**Request:**
```json
{
  "candidateId": "cand_001",
  "type": "phone",
  "date": "2024-03-15T14:00:00Z",
  "interviewer": "Bob Smith",
  "notes": "Initial screening"
}
```

**Response (201):** Interview object

---

### PUT /interviews/:id

Update interview (add rating, notes).

**Request:**
```json
{
  "rating": 4.5,
  "notes": "Excellent communication skills",
  "nextSteps": "Schedule in-person round"
}
```

**Response (200):** Updated interview object

---

## Offers

### GET /offers

List job offers.

**Query Parameters:**
| Param | Type | Example | Description |
|-------|------|---------|-------------|
| `candidate` | string | `cand_001` | Filter by candidate |
| `status` | string | `accepted` | pending, accepted, rejected, expired |

**Response (200):**
```json
{
  "offers": [
    {
      "id": "off_001",
      "candidate": {
        "id": "cand_001",
        "name": "Alice Johnson"
      },
      "position": "Senior Software Engineer",
      "salary": 150000,
      "benefits": "Health, 401k, stock options",
      "offerDate": "2024-03-20",
      "expirationDate": "2024-04-03",
      "acceptedDate": "2024-03-25",
      "startDate": "2024-04-15",
      "status": "accepted"
    }
  ]
}
```

---

### POST /offers

Create job offer.

**Request:**
```json
{
  "candidateId": "cand_001",
  "position": "Senior Software Engineer",
  "salary": 150000,
  "benefits": "Health, 401k, stock options",
  "offerDate": "2024-03-20",
  "expirationDate": "2024-04-03",
  "startDate": "2024-04-15"
}
```

**Response (201):** Offer object

---

### PUT /offers/:id

Update offer status.

**Request:**
```json
{
  "status": "accepted",
  "acceptedDate": "2024-03-25"
}
```

**Response (200):** Updated offer object

---

## Onboarding

### GET /onboarding/:employeeId

Get onboarding checklist for employee.

**Response (200):**
```json
{
  "employee": {
    "id": "emp_001",
    "name": "Alice Johnson",
    "hireDate": "2024-04-01"
  },
  "tasks": [
    {
      "id": "task_001",
      "task": "Background check",
      "category": "compliance",
      "dueDate": "2024-03-28",
      "completed": true,
      "completedAt": "2024-03-27T10:00:00Z"
    },
    {
      "id": "task_002",
      "task": "IT setup (laptop, email, accounts)",
      "category": "it",
      "dueDate": "2024-04-01",
      "completed": false
    }
  ],
  "progress": {
    "completed": 1,
    "total": 5,
    "percentage": 0.2
  }
}
```

---

### POST /onboarding/:employeeId

Add task to employee's onboarding checklist.

**Request:**
```json
{
  "task": "Meet with department head",
  "category": "general",
  "dueDate": "2024-04-05"
}
```

**Response (201):** Task object

---

### PUT /onboarding/:taskId

Mark task as complete.

**Request:**
```json
{
  "completed": true
}
```

**Response (200):**
```json
{
  "task": {
    "id": "task_001",
    "task": "Background check",
    "completed": true,
    "completedAt": "2024-03-27T10:00:00Z"
  }
}
```

---

## Dashboard

### GET /dashboard

Get dashboard metrics and summary data.

**Response (200):**
```json
{
  "metrics": {
    "totalCandidates": 45,
    "candidatesByStage": {
      "prospect": 10,
      "applied": 15,
      "interviewing": 12,
      "offered": 6,
      "hired": 2
    },
    "totalEmployees": 32,
    "employeesByDepartment": {
      "Engineering": 12,
      "Sales": 8,
      "HR": 4,
      "Finance": 3,
      "Operations": 5
    },
    "totalDevices": 45,
    "devicesByStatus": {
      "available": 5,
      "assigned": 38,
      "in-repair": 2,
      "retired": 0
    },
    "onboardingInProgress": 3,
    "upcomingInterviews": 4
  },
  "recentActivity": [
    {
      "type": "hire",
      "description": "Alice Johnson hired as Senior Engineer",
      "timestamp": "2024-03-24T10:00:00Z"
    }
  ]
}
```

---

## Reports & Analytics

### POST /exports

Generate CSV export.

**Request:**
```json
{
  "type": "candidates",
  "fields": ["name", "email", "position", "stage"],
  "filters": {
    "stage": "interviewing"
  }
}
```

**Response (200):**
CSV file (attachment)

---

### GET /search

Full-text search across candidates, employees, devices.

**Query Parameters:**
| Param | Type | Example | Description |
|-------|------|---------|-------------|
| `q` | string | `john` | Search term |
| `type` | string | `candidates` | candidates, employees, devices, all |
| `limit` | number | `20` | Results per type |

**Response (200):**
```json
{
  "results": {
    "candidates": [
      {
        "id": "cand_001",
        "name": "John Doe",
        "email": "john@example.com",
        "position": "Engineer"
      }
    ],
    "employees": [
      {
        "id": "emp_001",
        "name": "John Smith",
        "email": "john.smith@company.com",
        "department": "Engineering"
      }
    ],
    "devices": []
  }
}
```

---

## Settings

### GET /settings

Get application settings.

**Response (200):**
```json
{
  "settings": {
    "companyName": "Acme Corp",
    "timezone": "America/New_York",
    "dateFormat": "MM/DD/YYYY",
    "currency": "USD",
    "onboardingDays": 30,
    "offboardingDays": 14
  }
}
```

---

### PUT /settings

Update application settings.

**Request:**
```json
{
  "companyName": "Acme Corp Inc",
  "timezone": "America/Los_Angeles"
}
```

**Response (200):** Updated settings object

---

## Admin Features

### GET /admin/custom-fields

Get custom field definitions.

**Response (200):**
```json
{
  "fields": [
    {
      "id": "cf_001",
      "entityType": "candidate",
      "fieldName": "desired_salary",
      "fieldType": "number",
      "required": false,
      "options": null
    },
    {
      "id": "cf_002",
      "entityType": "candidate",
      "fieldName": "visa_sponsorship",
      "fieldType": "select",
      "required": true,
      "options": ["yes", "no", "maybe"]
    }
  ]
}
```

---

### POST /admin/custom-fields

Create custom field.

**Request:**
```json
{
  "entityType": "candidate",
  "fieldName": "preferred_location",
  "fieldType": "select",
  "required": true,
  "options": ["New York", "San Francisco", "Remote"]
}
```

**Response (201):** Custom field object

---

## Error Codes

| Code | HTTP | Meaning | Solution |
|------|------|---------|----------|
| `UNAUTHORIZED` | 401 | Not authenticated | Log in first |
| `FORBIDDEN` | 403 | Don't have permission | Check user role |
| `NOT_FOUND` | 404 | Resource doesn't exist | Check ID |
| `CONFLICT` | 409 | Resource already exists | Use different email/serial |
| `VALIDATION_ERROR` | 400 | Missing/invalid fields | Check request body |
| `DATABASE_ERROR` | 500 | Database error | Contact support |
| `INTERNAL_ERROR` | 500 | Server error | Check logs |

---

## Rate Limiting

No rate limiting on free tier. Implement if needed:
```bash
npm install express-rate-limit
```

---

## Pagination

All list endpoints support pagination:

```bash
# Get page 2 (20 items per page)
curl 'https://api/candidates?limit=20&offset=20'

# Get first 50 items
curl 'https://api/employees?limit=50'
```

Response includes pagination metadata:
```json
{
  "pagination": {
    "total": 100,
    "limit": 20,
    "offset": 20,
    "pages": 5
  }
}
```

---

## Filtering & Sorting

Most endpoints support filtering and sorting:

```bash
# Filter by stage and sort by name
curl 'https://api/candidates?stage=interviewing&sort=name&order=asc'

# Search and sort
curl 'https://api/employees?search=john&department=Engineering&sort=hireDate&order=desc'
```

---

## Examples

### Example 1: Create Candidate, Schedule Interview, Send Offer

```bash
# 1. Create candidate
curl -X POST https://api/candidates \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "Alice Johnson",
    "email": "alice@example.com",
    "position": "Engineer"
  }'
# Response: {"id": "cand_001", ...}

# 2. Schedule interview
curl -X POST https://api/interviews \
  -H 'Content-Type: application/json' \
  -d '{
    "candidateId": "cand_001",
    "type": "phone",
    "date": "2024-03-28T10:00:00Z",
    "interviewer": "Bob Smith"
  }'

# 3. Send offer
curl -X POST https://api/offers \
  -H 'Content-Type: application/json' \
  -d '{
    "candidateId": "cand_001",
    "position": "Engineer",
    "salary": 120000,
    "startDate": "2024-04-15"
  }'
```

### Example 2: Hire Candidate, Provision Device, Track Onboarding

```bash
# 1. Promote candidate to employee
curl -X POST https://api/candidates/cand_001/promote \
  -H 'Content-Type: application/json' \
  -d '{
    "startDate": "2024-04-15",
    "department": "Engineering",
    "role": "Software Engineer"
  }'
# Response: {"employee": {"id": "emp_001", ...}, "onboardingTasks": [...]}

# 2. Assign device
curl -X POST https://api/assignments \
  -H 'Content-Type: application/json' \
  -d '{
    "deviceId": "dev_001",
    "employeeId": "emp_001"
  }'

# 3. Check onboarding progress
curl https://api/onboarding/emp_001
```

---

## Summary

- **25 endpoints** covering all HR, recruitment, and asset management needs
- **Consistent error handling** with clear messages
- **Pagination & filtering** for large datasets
- **Session-based auth** (no API keys)
- **JSON responses** with standard format

See `/docs/ARCHITECTURE.md` for data model details and `/docs/MAINTENANCE_GUIDE.md` for monitoring.
