# TASK 3.1 - Candidates API Implementation

**Status:** COMPLETE ✅
**Date:** 2026-03-24
**Test Coverage:** 35/35 tests passing (100%)
**Files Modified:** 3 | Files Created:** 1

---

## Summary

Successfully implemented full Candidates CRUD API with comprehensive filtering, sorting, pagination, and duplicate email detection. All endpoints tested and verified.

### Key Metrics
- **GET /api/candidates** - List with 8+ filters, sorting, pagination
- **POST /api/candidates** - Create with duplicate detection (409 conflict response)
- **GET /api/candidates/:id** - Detail view with related data (resumes, interviews, offers, tags)
- **PATCH /api/candidates/:id** - Update all fields with email uniqueness constraint
- **DELETE /api/candidates/:id** - Soft delete by setting status=rejected
- **Tests Created:** 35 comprehensive integration tests
- **Edge Cases Covered:** Validation, pagination limits, constraint handling, error responses

---

## Deliverables

### 1. Service Layer (`server/services/candidateService.js`)

#### Enhanced Functions

**listCandidates(options)**
- Filters: status (multi-value), stage, sourceId, seniorityId, clientId, tags (multi), dateRange
- Sorting: By any column, asc/desc
- Pagination: limit (max 100), offset, page calculation
- Returns: { candidates: [], total, page, limit }

**getCandidateDetail(id)**
- Includes all related data with eager loading
- Relations: resumes, interviews (with interviewers), offers, skillTags, source, seniority, client, rejectionReason
- Throws 'Candidate not found' if not exists

**checkDuplicateEmail(email)**
- Returns existing candidate summary or null
- Used by POST endpoint for 409 conflict detection

#### Existing Functions (Preserved)
- createCandidate, getCandidateById, updateCandidate, deleteCandidate
- Resume operations: associateResumeWithCandidate, getCandidateWithResume, etc.

---

### 2. Routes (`server/routes/candidates.js`)

#### GET /api/candidates - List Candidates
**Query Parameters:**
```
status=active,hired          // Multi-value filter
stage=interview              // Single filter
sourceId=<id>              // Source reference
seniorityId=<id>           // Seniority reference
clientId=<id>              // Client reference
tags=<id1>,<id2>           // Multi-value skill tag IDs
dateRangeFrom=2026-03-20   // YYYY-MM-DD format
dateRangeTo=2026-03-24
sortBy=name                // Default: createdAt
sortOrder=asc              // Default: desc
limit=25                   // Default: 25, max: 100
offset=0                   // Default: 0
```

**Response:**
```json
{
  "candidates": [
    {
      "id": "cuid",
      "name": "John Doe",
      "email": "john@example.com",
      "roleApplied": "Engineer",
      "status": "active",
      "stage": "applied",
      "phone": "555-1234",
      "location": "San Francisco, CA",
      "sourceId": "cuid",
      "seniorityId": "cuid",
      "clientId": "cuid",
      "referredBy": "Jane Doe",
      "notes": "...",
      "sourcedAt": "2026-03-24T10:00:00Z",
      "latestInterviewAt": "2026-03-23T15:00:00Z",
      "latestStageChangeAt": "2026-03-22T09:00:00Z",
      "createdAt": "2026-03-20T12:00:00Z",
      "updatedAt": "2026-03-24T10:00:00Z"
    }
  ],
  "total": 100,
  "page": 1,
  "limit": 25
}
```

#### POST /api/candidates - Create Candidate
**Request Body:**
```json
{
  "name": "John Doe",           // required
  "email": "john@example.com",  // required, unique
  "roleApplied": "Engineer",    // required
  "phone": "555-1234",          // optional
  "location": "San Francisco",  // optional
  "status": "active",           // optional, default
  "stage": "applied",           // optional, default
  "sourceId": "cuid",           // optional
  "seniorityId": "cuid",        // optional
  "clientId": "cuid",           // optional
  "referredBy": "Jane Doe",     // optional
  "notes": "..."                // optional
}
```

**Responses:**
- 201: Candidate created
- 400: Missing required field (name, email, roleApplied)
- 409: Email already exists + conflict modal data
  ```json
  {
    "conflict": true,
    "existingCandidateId": "cuid",
    "existingCandidate": {
      "id": "cuid",
      "name": "Existing Name",
      "email": "john@example.com",
      "phone": "555-1234",
      "roleApplied": "Engineer",
      "status": "active",
      "stage": "applied"
    },
    "error": "Candidate with email john@example.com already exists"
  }
  ```

#### GET /api/candidates/:id - Get Candidate Detail
**Response (with all relations):**
```json
{
  "id": "cuid",
  "name": "John Doe",
  "email": "john@example.com",
  "...": "candidate fields",
  "resumes": [
    {
      "id": "cuid",
      "candidateId": "cuid",
      "fileUrl": "/resumes/john_resume.pdf",
      "fileName": "john_resume.pdf",
      "version": 1,
      "isActive": true,
      "uploadedAt": "2026-03-24T10:00:00Z",
      "createdAt": "2026-03-24T10:00:00Z"
    }
  ],
  "interviews": [
    {
      "id": "cuid",
      "candidateId": "cuid",
      "scheduledAt": "2026-03-25T14:00:00Z",
      "status": "scheduled",
      "formatId": "cuid",
      "notes": "...",
      "interviewers": [...],
      "createdAt": "2026-03-24T10:00:00Z",
      "updatedAt": "2026-03-24T10:00:00Z"
    }
  ],
  "offers": [
    {
      "id": "cuid",
      "candidateId": "cuid",
      "role": "Senior Engineer",
      "compensation": "150k-200k",
      "startDate": "2026-04-01T00:00:00Z",
      "sentAt": "2026-03-24T10:00:00Z",
      "expiresAt": "2026-03-31T00:00:00Z",
      "status": "pending",
      "notes": "...",
      "createdAt": "2026-03-24T10:00:00Z",
      "updatedAt": "2026-03-24T10:00:00Z"
    }
  ],
  "skillTags": [
    {
      "id": "cuid",
      "candidateId": "cuid",
      "tagId": "cuid",
      "tag": {
        "id": "cuid",
        "listId": "cuid",
        "label": "React",
        "value": "react",
        "order": 0,
        "createdAt": "2026-03-24T10:00:00Z"
      },
      "createdAt": "2026-03-24T10:00:00Z"
    }
  ],
  "source": {...},
  "seniority": {...},
  "client": {...},
  "rejectionReason": null
}
```

**Responses:**
- 200: Candidate detail
- 404: Candidate not found

#### PATCH /api/candidates/:id - Update Candidate
**Request Body (any field):**
```json
{
  "name": "Updated Name",
  "email": "updated@example.com",  // Enforced unique via constraint
  "phone": "555-9999",
  "location": "Austin, TX",
  "roleApplied": "Senior Engineer",
  "status": "hired",
  "stage": "closed",
  "sourceId": "cuid",
  "seniorityId": "cuid",
  "clientId": "cuid",
  "referredBy": "Updated Ref",
  "notes": "Updated notes"
}
```

**Responses:**
- 200: Updated candidate
- 400: Email conflicts with another candidate
- 404: Candidate not found

#### DELETE /api/candidates/:id - Delete Candidate
**Implementation:** Soft delete by setting status='rejected'

**Responses:**
- 204: No content (soft delete successful)
- 404: Candidate not found

---

## Test Coverage

### File: `server/tests/routes/candidates-crud.test.js`
**35 Tests | 100% Passing**

#### Test Categories

**GET /api/candidates (11 tests)**
- Empty list, default pagination, limit/offset
- Filter by status, stage, source, seniority, client
- Multi-value status filter
- Sorting asc/desc by multiple columns
- Pagination caps limit at 100

**POST /api/candidates (9 tests)**
- Create with minimal fields (defaults applied)
- Create with all fields
- Validation: require name, email, roleApplied
- Duplicate detection returns 409 with conflict data
- Valid status/stage values accepted

**GET /api/candidates/:id (5 tests)**
- Basic candidate retrieval
- Includes resumes, interviews, offers, skillTags
- Returns 404 for non-existent

**PATCH /api/candidates/:id (6 tests)**
- Update status, stage, notes, phone, location
- Multi-field updates
- Email uniqueness constraint enforced
- Returns 404 for non-existent

**DELETE /api/candidates/:id (3 tests)**
- Soft delete sets status=rejected
- Returns 404 for non-existent
- Idempotent (can delete already-rejected)

**Edge Cases (1 test)**
- Empty PATCH body doesn't modify candidate
- Pagination limit cap at 100

---

## Key Implementation Details

### Duplicate Detection
```javascript
// 1. Check email before create
const existing = await candidateService.checkDuplicateEmail(email);
if (existing) {
  return res.status(409).json({
    conflict: true,
    existingCandidateId: existing.id,
    existingCandidate: existing,
    error: `Candidate with email ${email} already exists`,
  });
}
```

### Advanced Filtering
```javascript
// Status multi-value: ?status=active,hired
const statusValues = status.split(',').map(s => s.trim());
where.status = statusValues.length === 1
  ? statusValues[0]
  : { in: statusValues };

// Date range: ?dateRangeFrom=2026-03-20&dateRangeTo=2026-03-24
where.sourcedAt = {};
if (dateRangeFrom) {
  where.sourcedAt.gte = new Date(`${dateRangeFrom}T00:00:00Z`);
}
if (dateRangeTo) {
  where.sourcedAt.lte = new Date(`${dateRangeTo}T23:59:59Z`);
}

// Tags filter (multi-value): ?tags=<id1>,<id2>
candidates = await db.candidate.findMany({
  where: {
    ...where,
    skillTags: {
      some: {
        tagId: { in: tagIds }
      }
    }
  }
});
```

### Soft Delete Pattern
```javascript
// DELETE /api/candidates/:id
await db.candidate.update({
  where: { id },
  data: { status: 'rejected' }  // No hard delete
});
```

### Pagination with Total Count
```javascript
const total = await db.candidate.count({ where });
const page = Math.floor(parsedOffset / parsedLimit) + 1;
return {
  candidates,
  total,
  page,
  limit: parsedLimit
};
```

---

## Files Modified/Created

| File | Type | Changes |
|------|------|---------|
| `server/services/candidateService.js` | Modified | Added: listCandidates (enhanced), checkDuplicateEmail, getCandidateDetail |
| `server/routes/candidates.js` | Modified | Enhanced: GET /, POST /, GET /:id, PATCH /:id, DELETE /:id with full filtering/sorting/validation |
| `server/tests/routes/candidates-crud.test.js` | Created | 35 comprehensive integration tests |

---

## Performance Considerations

### Query Optimization
- All filtering done at database layer via Prisma
- Pagination uses skip/take for efficiency
- Relation loading only for detail endpoint (GET /:id)
- Indexes on schema support: status, stage, sourceId, seniorityId, clientId, createdAt

### Sorting Support
- Default: createdAt (descending)
- Supports any column via sortBy parameter
- Order validated (asc/desc)

### Pagination Limits
- Default limit: 25
- Maximum limit: 100 (enforced)
- Offset-based pagination with page calculation

---

## Error Handling

### Validation Errors (400)
- Missing required fields (name, email, roleApplied)
- Invalid email on update (uniqueness violation)

### Conflict Errors (409)
- Duplicate email on POST with existing candidate modal data

### Not Found Errors (404)
- Candidate ID doesn't exist

### Server Errors (500)
- Database connectivity
- Unexpected exceptions logged with context

---

## Next Steps

1. **Phase 3:** Implement remaining endpoints (Interviews, Offers, Skills, etc.)
2. **Integration:** Wire up to frontend with React hooks for data fetching
3. **Analytics:** Track candidate funnel metrics by stage
4. **Audit:** Implement change logging for compliance

---

## Self-Review Checklist

- [x] All CRUD endpoints implemented
- [x] Filtering supports: status, stage, source, seniority, client, tags, date range
- [x] Sorting by any column, asc/desc
- [x] Pagination with limit (max 100), offset, page number, total count
- [x] Duplicate email detection returns 409 with conflict modal data
- [x] DELETE uses soft delete pattern (status=rejected)
- [x] GET /:id includes all relations (resumes, interviews, offers, tags)
- [x] Full validation on POST/PATCH
- [x] Comprehensive test coverage (35 tests, 100% passing)
- [x] Error handling for all edge cases
- [x] Performance optimized (query layer filtering, pagination limits)
- [x] Documentation complete with examples
