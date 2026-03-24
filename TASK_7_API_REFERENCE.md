# Task 7.1-7.3: Employee & Device Inventory API Reference

## Base URL
```
http://localhost:3001/api
```

---

## Employee Endpoints (7.1)

### List Employees
```bash
GET /employees?department=Engineering&status=active&limit=25&offset=0&sortBy=name

Response 200:
{
  "data": [
    {
      "id": "cuid",
      "name": "John Doe",
      "email": "john@example.com",
      "title": "Software Engineer",
      "department": "Engineering",
      "startDate": "2026-01-15T00:00:00Z",
      "status": "active",
      "createdAt": "2026-03-24T...",
      "updatedAt": "2026-03-24T..."
    }
  ],
  "total": 42,
  "limit": 25,
  "offset": 0
}
```

### Create Employee
```bash
POST /employees
Content-Type: application/json

{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "title": "Product Manager",
  "department": "Product",
  "startDate": "2026-03-24",
  "clientId": "optional-cuid"
}

Response 201:
{
  "id": "cuid",
  "name": "Jane Smith",
  "email": "jane@example.com",
  "title": "Product Manager",
  "department": "Product",
  "startDate": "2026-03-24T00:00:00Z",
  "status": "active",
  "createdAt": "2026-03-24T...",
  "updatedAt": "2026-03-24T..."
}
```

### Get Employee Details
```bash
GET /employees/cuid

Response 200:
{
  "id": "cuid",
  "name": "John Doe",
  "email": "john@example.com",
  "title": "Software Engineer",
  "department": "Engineering",
  "startDate": "2026-01-15T00:00:00Z",
  "status": "active",
  "assignments": [
    {
      "id": "cuid",
      "deviceId": "cuid",
      "device": {
        "id": "cuid",
        "serial": "LAPTOP-001",
        "type": "laptop",
        "make": "Apple",
        "model": "MacBook Pro 16",
        "status": "assigned",
        "condition": "good"
      },
      "assignedDate": "2026-03-01T00:00:00Z",
      "returnedDate": null
    }
  ],
  "onboardingRuns": [
    {
      "id": "cuid",
      "type": "onboarding",
      "status": "in_progress",
      "track": { "name": "Engineering Onboarding" }
    }
  ]
}
```

### Update Employee
```bash
PATCH /employees/cuid
Content-Type: application/json

{
  "title": "Senior Engineer",
  "department": "Engineering",
  "status": "active"
}

Response 200:
{
  "id": "cuid",
  "name": "John Doe",
  "email": "john@example.com",
  "title": "Senior Engineer",
  "department": "Engineering",
  "startDate": "2026-01-15T00:00:00Z",
  "status": "active",
  "updatedAt": "2026-03-24T..."
}
```

### Delete (Offboard) Employee
```bash
DELETE /employees/cuid

Response 200:
{
  "id": "cuid",
  "name": "John Doe",
  "email": "john@example.com",
  "title": "Software Engineer",
  "department": "Engineering",
  "status": "offboarded",
  "updatedAt": "2026-03-24T..."
}
```

---

## Device Endpoints (7.3)

### List Devices
```bash
GET /devices?type=laptop&status=available&condition=good&limit=25&offset=0

Query Parameters:
- type: laptop | monitor | phone | peripheral
- status: available | assigned | retired
- condition: new | good | fair | poor
- limit: number (default 25)
- offset: number (default 0)

Response 200:
{
  "data": [
    {
      "id": "cuid",
      "serial": "LAPTOP-001",
      "type": "laptop",
      "make": "Apple",
      "model": "MacBook Pro 16",
      "condition": "good",
      "status": "available",
      "warrantyExp": "2028-01-15T00:00:00Z",
      "notes": "Standard issue for engineers",
      "createdAt": "2026-03-24T...",
      "updatedAt": "2026-03-24T..."
    }
  ],
  "total": 156,
  "limit": 25,
  "offset": 0
}
```

### Create Device
```bash
POST /devices
Content-Type: application/json

{
  "serial": "LAPTOP-001",
  "type": "laptop",
  "make": "Apple",
  "model": "MacBook Pro 16",
  "condition": "new",
  "warrantyExp": "2028-01-15",
  "notes": "Standard issue for engineers"
}

Response 201:
{
  "id": "cuid",
  "serial": "LAPTOP-001",
  "type": "laptop",
  "make": "Apple",
  "model": "MacBook Pro 16",
  "condition": "new",
  "status": "available",
  "warrantyExp": "2028-01-15T00:00:00Z",
  "notes": "Standard issue for engineers",
  "createdAt": "2026-03-24T..."
}
```

### Get Device Details
```bash
GET /devices/cuid

Response 200:
{
  "id": "cuid",
  "serial": "LAPTOP-001",
  "type": "laptop",
  "make": "Apple",
  "model": "MacBook Pro 16",
  "condition": "good",
  "status": "assigned",
  "warrantyExp": "2028-01-15T00:00:00Z",
  "notes": "Standard issue for engineers",
  "assignments": [
    {
      "id": "cuid",
      "employeeId": "cuid",
      "employee": {
        "id": "cuid",
        "name": "John Doe",
        "email": "john@example.com",
        "title": "Engineer",
        "department": "Engineering"
      },
      "assignedDate": "2026-03-01T00:00:00Z",
      "returnedDate": null,
      "condition": null
    }
  ]
}
```

### Update Device
```bash
PATCH /devices/cuid
Content-Type: application/json

{
  "condition": "fair",
  "status": "available",
  "notes": "Screen has minor scratches",
  "warrantyExp": "2027-01-15"
}

Response 200:
{
  "id": "cuid",
  "serial": "LAPTOP-001",
  "type": "laptop",
  "condition": "fair",
  "status": "available",
  "notes": "Screen has minor scratches",
  "warrantyExp": "2027-01-15T00:00:00Z",
  "updatedAt": "2026-03-24T..."
}
```

### Delete (Retire) Device
```bash
DELETE /devices/cuid

Response 200:
{
  "id": "cuid",
  "serial": "LAPTOP-001",
  "type": "laptop",
  "status": "retired",
  "condition": "good",
  "updatedAt": "2026-03-24T..."
}
```

---

## Special Device Endpoints

### Get Unassigned Devices
```bash
GET /devices/pool/unassigned

Response 200:
{
  "data": [
    { /* device objects with status='available' */ }
  ],
  "total": 45,
  "limit": 25,
  "offset": 0
}
```

---

## Device Assignment Endpoints (7.4-7.5)

### Assign Device to Employee
```bash
POST /devices/cuid/assign
Content-Type: application/json

{
  "employeeId": "cuid",
  "assignedDate": "2026-03-24T00:00:00Z",
  "notes": "Issued at onboarding"
}

Response 201:
{
  "id": "cuid",
  "deviceId": "cuid",
  "employeeId": "cuid",
  "assignedDate": "2026-03-24T00:00:00Z",
  "returnedDate": null,
  "condition": null,
  "notes": "Issued at onboarding"
}
```

### Return Device from Employee
```bash
PATCH /devices/cuid/return
Content-Type: application/json

{
  "returnedDate": "2026-03-24T00:00:00Z",
  "condition": "good",
  "notes": "No damage found"
}

Response 200:
{
  "id": "cuid",
  "deviceId": "cuid",
  "employeeId": "cuid",
  "assignedDate": "2026-03-01T00:00:00Z",
  "returnedDate": "2026-03-24T00:00:00Z",
  "condition": "good",
  "notes": "No damage found"
}
```

### Get Device Assignment History
```bash
GET /devices/cuid/history

Response 200:
[
  {
    "id": "cuid",
    "deviceId": "cuid",
    "employeeId": "cuid",
    "employee": {
      "id": "cuid",
      "name": "Jane Smith",
      "email": "jane@example.com",
      "title": "Engineer",
      "department": "Engineering"
    },
    "device": { /* device details */ },
    "assignedDate": "2026-02-01T00:00:00Z",
    "returnedDate": "2026-03-15T00:00:00Z",
    "condition": "fair"
  }
]
```

### Get Employee's Devices
```bash
GET /employees/cuid/devices

Response 200:
[
  {
    "id": "cuid",
    "serial": "LAPTOP-001",
    "type": "laptop",
    "make": "Apple",
    "model": "MacBook Pro 16",
    "condition": "good",
    "status": "assigned",
    "assignments": [
      {
        "id": "cuid",
        "assignedDate": "2026-03-01T00:00:00Z",
        "returnedDate": null,
        "condition": null
      }
    ]
  }
]
```

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "name, email, and title are required"
}
```

### 404 Not Found
```json
{
  "error": "Employee not found"
}
```

### 400 Duplicate
```json
{
  "error": "Email already exists"
}
```

```json
{
  "error": "Serial number must be unique"
}
```

---

## Filter & Sorting Examples

### Employee Filters
```bash
# Active employees in Engineering
GET /employees?department=Engineering&status=active

# All offboarded employees
GET /employees?status=offboarded

# Sorted by start date
GET /employees?sortBy=startDate
```

### Device Filters
```bash
# Available laptops
GET /devices?type=laptop&status=available

# All poor condition devices
GET /devices?condition=poor

# Assigned monitors in good condition
GET /devices?type=monitor&status=assigned&condition=good
```

---

## Pagination Pattern

All list endpoints follow this pattern:

```bash
GET /endpoint?limit=25&offset=0

Response structure:
{
  "data": [ /* items */ ],
  "total": 100,
  "limit": 25,
  "offset": 0
}
```

**Calculate pages:**
```javascript
const totalPages = Math.ceil(total / limit);
const currentPage = Math.floor(offset / limit) + 1;
```
