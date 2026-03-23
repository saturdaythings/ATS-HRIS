# Phase 2 (Enhanced) - People Core + Rippling-Aligned Onboarding

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to execute this plan. Tasks are designed for parallel execution with inter-task dependencies noted. Use two-stage review checkpoints.

**Goal:** Implement full CRUD for candidates and employees with Rippling-mirrored design: candidate profiles with resume upload, employee onboarding checklists with role-based templates, notifications system, and professional detail panels.

**Architecture:**
- **Backend:** Express routes + Prisma models with onboarding templates, checklists, notifications. Service layer handles business logic.
- **Frontend:** React pages with Rippling-style detail panels (slide-in from right), resume upload drag-drop, onboarding checklist UI, notification badge.
- **Data Models:** Extends Prisma schema with OnboardingTemplate, OnboardingChecklist, OnboardingChecklistItem, Notification models.
- **Resume Storage:** Free tier solution (Google Drive API or AWS S3 free tier) with resume parsing (Phase 2B).
- **Tests:** Comprehensive TDD with service unit tests, route integration tests, React component tests.

**Tech Stack:** Express, Prisma, SQLite, React, TailwindCSS, Jest, Multer (file upload), Node-resume-parser

**Design Reference:** [Rippling-Mirrored Design Spec](./2026-03-23-rippling-mirrored-design.md)

---

## File Structure

### New Files Created
```
server/
  services/
    candidateService.js          # Candidate business logic
    employeeService.js           # Employee business logic
  tests/
    routes/
      candidates.test.js         # Candidate endpoint tests
      employees.test.js          # Employee endpoint tests
    services/
      candidateService.test.js   # Service layer tests
      employeeService.test.js

app/src/
  pages/people/
    DirectoryDetail.jsx          # Detail slide-in for employee
    CandidateDetail.jsx          # Detail slide-in for candidate
  hooks/
    useEmployees.js              # Candidate-specific hook
    useCandidates.js             # Employee-specific hook
  utils/
    formatters.js                # Date/status formatters
```

### Modified Files
```
server/routes/
  candidates.js                  # Implement all 5 endpoints
  employees.js                   # Implement all 7 endpoints (including /onboarding, /offboarding)

app/src/pages/people/
  Directory.jsx                  # Add employee table with sorting
  Hiring.jsx                     # Add Kanban pipeline view
```

---

## Task Dependencies

```
Candidates (tests) ──┐
                     ├──> Candidates (implementation) ──┐
Employees (tests)   ──┐                                  ├──> Integration (React pages)
                     └──> Employees (implementation) ──┘
```

**Parallel groups:**
- Candidate tests + Employee tests (can run in parallel, no shared state)
- Candidate implementation + Employee implementation (can run in parallel, independent routes)
- React pages (can only start after both implementations complete)

---

## Task 1: Candidate Tests

**Files:**
- Create: `server/tests/routes/candidates.test.js`
- Create: `server/tests/services/candidateService.test.js`

- [ ] **Step 1: Create test directory structure**

```bash
mkdir -p /Users/oliver/OliverRepo/workspaces/work/projects/vtwo-ops/server/tests/routes
mkdir -p /Users/oliver/OliverRepo/workspaces/work/projects/vtwo-ops/server/tests/services
```

- [ ] **Step 2: Install Jest**

```bash
cd /Users/oliver/OliverRepo/workspaces/work/projects/vtwo-ops
npm install --save-dev jest @testing-library/react
```

- [ ] **Step 3: Create Jest config**

```bash
cat > jest.config.js << 'EOF'
export default {
  testEnvironment: 'node',
  coveragePathIgnorePatterns: ['/node_modules/'],
  testMatch: ['**/?(*.)+(spec|test).js'],
};
EOF
```

- [ ] **Step 4: Update package.json with test script**

Add to `scripts`:
```json
"test": "jest",
"test:watch": "jest --watch",
"test:coverage": "jest --coverage"
```

- [ ] **Step 5: Write candidateService tests**

```javascript
// server/tests/services/candidateService.test.js
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { db } from '../../db.js';
import * as candidateService from '../../services/candidateService.js';

describe('CandidateService', () => {
  beforeAll(async () => {
    // Clean database
    await db.candidate.deleteMany({});
  });

  afterAll(async () => {
    await db.$disconnect();
  });

  describe('createCandidate', () => {
    it('should create a candidate with required fields', async () => {
      const data = {
        name: 'Alice Johnson',
        email: 'alice@example.com',
        role: 'Senior Engineer',
        stage: 'sourced',
        status: 'active',
      };
      const candidate = await candidateService.createCandidate(data);
      expect(candidate.id).toBeDefined();
      expect(candidate.email).toBe('alice@example.com');
      expect(candidate.stage).toBe('sourced');
    });

    it('should throw on duplicate email', async () => {
      const data = {
        name: 'Bob Smith',
        email: 'bob@example.com',
        role: 'Engineer',
        stage: 'sourced',
        status: 'active',
      };
      await candidateService.createCandidate(data);
      await expect(candidateService.createCandidate(data)).rejects.toThrow();
    });

    it('should require name, email, role', async () => {
      const invalidData = { email: 'test@example.com' };
      await expect(candidateService.createCandidate(invalidData)).rejects.toThrow();
    });
  });

  describe('getCandidate', () => {
    it('should return candidate by id', async () => {
      const created = await candidateService.createCandidate({
        name: 'Carol White',
        email: 'carol@example.com',
        role: 'Designer',
        stage: 'screening',
        status: 'active',
      });
      const found = await candidateService.getCandidate(created.id);
      expect(found.id).toBe(created.id);
      expect(found.name).toBe('Carol White');
    });

    it('should return null if not found', async () => {
      const found = await candidateService.getCandidate('nonexistent-id');
      expect(found).toBeNull();
    });
  });

  describe('listCandidates', () => {
    it('should list all candidates', async () => {
      await db.candidate.deleteMany({});
      await candidateService.createCandidate({
        name: 'Dave Brown',
        email: 'dave@example.com',
        role: 'PM',
        stage: 'interview',
        status: 'active',
      });
      const list = await candidateService.listCandidates({});
      expect(list.length).toBeGreaterThanOrEqual(1);
    });

    it('should filter by status', async () => {
      const list = await candidateService.listCandidates({ status: 'active' });
      expect(list.every(c => c.status === 'active')).toBe(true);
    });

    it('should filter by stage', async () => {
      const list = await candidateService.listCandidates({ stage: 'interview' });
      expect(list.every(c => c.stage === 'interview')).toBe(true);
    });
  });

  describe('updateCandidate', () => {
    it('should update candidate stage and status', async () => {
      const created = await candidateService.createCandidate({
        name: 'Eve Davis',
        email: 'eve@example.com',
        role: 'QA',
        stage: 'sourced',
        status: 'active',
      });
      const updated = await candidateService.updateCandidate(created.id, {
        stage: 'offer',
        status: 'active',
      });
      expect(updated.stage).toBe('offer');
    });
  });

  describe('deleteCandidate', () => {
    it('should delete a candidate', async () => {
      const created = await candidateService.createCandidate({
        name: 'Frank Miller',
        email: 'frank@example.com',
        role: 'Intern',
        stage: 'sourced',
        status: 'active',
      });
      await candidateService.deleteCandidate(created.id);
      const found = await candidateService.getCandidate(created.id);
      expect(found).toBeNull();
    });
  });
});
```

- [ ] **Step 6: Write candidate route handler tests**

```javascript
// server/tests/routes/candidates.test.js
import request from 'supertest';
import app from '../../index.js';
import { db } from '../../db.js';

describe('Candidate Routes', () => {
  beforeAll(async () => {
    await db.candidate.deleteMany({});
  });

  afterAll(async () => {
    await db.$disconnect();
  });

  describe('POST /api/candidates', () => {
    it('should create a candidate', async () => {
      const res = await request(app).post('/api/candidates').send({
        name: 'Test Candidate',
        email: 'test@example.com',
        role: 'Engineer',
        stage: 'sourced',
        status: 'active',
      });
      expect(res.status).toBe(201);
      expect(res.body.data.id).toBeDefined();
      expect(res.body.data.email).toBe('test@example.com');
    });

    it('should return 400 on missing required fields', async () => {
      const res = await request(app).post('/api/candidates').send({
        name: 'Incomplete',
      });
      expect(res.status).toBe(400);
      expect(res.body.error).toBeDefined();
    });
  });

  describe('GET /api/candidates', () => {
    it('should list candidates', async () => {
      const res = await request(app).get('/api/candidates');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should filter by status', async () => {
      const res = await request(app).get('/api/candidates?status=active');
      expect(res.status).toBe(200);
      expect(res.body.data.every(c => c.status === 'active')).toBe(true);
    });

    it('should filter by stage', async () => {
      const res = await request(app).get('/api/candidates?stage=sourced');
      expect(res.status).toBe(200);
      expect(res.body.data.every(c => c.stage === 'sourced')).toBe(true);
    });
  });

  describe('GET /api/candidates/:id', () => {
    it('should get a candidate by id', async () => {
      const created = await request(app).post('/api/candidates').send({
        name: 'Get Test',
        email: 'gettest@example.com',
        role: 'Designer',
        stage: 'screening',
      });
      const candidateId = created.body.data.id;

      const res = await request(app).get(`/api/candidates/${candidateId}`);
      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(candidateId);
    });

    it('should return 404 if not found', async () => {
      const res = await request(app).get('/api/candidates/nonexistent-id');
      expect(res.status).toBe(404);
    });
  });

  describe('PATCH /api/candidates/:id', () => {
    it('should update candidate stage', async () => {
      const created = await request(app).post('/api/candidates').send({
        name: 'Update Test',
        email: 'updatetest@example.com',
        role: 'PM',
        stage: 'sourced',
      });
      const candidateId = created.body.data.id;

      const res = await request(app)
        .patch(`/api/candidates/${candidateId}`)
        .send({ stage: 'interview' });
      expect(res.status).toBe(200);
      expect(res.body.data.stage).toBe('interview');
    });
  });

  describe('DELETE /api/candidates/:id', () => {
    it('should delete a candidate', async () => {
      const created = await request(app).post('/api/candidates').send({
        name: 'Delete Test',
        email: 'deletetest@example.com',
        role: 'QA',
        stage: 'sourced',
      });
      const candidateId = created.body.data.id;

      const res = await request(app).delete(`/api/candidates/${candidateId}`);
      expect(res.status).toBe(204);

      const getRes = await request(app).get(`/api/candidates/${candidateId}`);
      expect(getRes.status).toBe(404);
    });
  });
});
```

- [ ] **Step 7: Install supertest for HTTP testing**

```bash
npm install --save-dev supertest
```

- [ ] **Step 8: Commit test structure**

```bash
git add server/tests jest.config.js package.json
git commit -m "test: add test infrastructure with Jest configuration

- Create test directories for routes and services
- Add Jest config with node environment
- Add supertest for HTTP endpoint testing
- Add test scripts to package.json

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

---

## Task 2: Candidate Service Implementation

**Files:**
- Create: `server/services/candidateService.js`

- [ ] **Step 1: Create candidateService with CRUD operations**

```javascript
// server/services/candidateService.js
import { db } from '../db.js';

/**
 * Validate candidate input
 */
function validateCandidate(data) {
  const errors = [];
  if (!data.name || typeof data.name !== 'string') errors.push('name is required');
  if (!data.email || typeof data.email !== 'string') errors.push('email is required');
  if (!data.role || typeof data.role !== 'string') errors.push('role is required');
  if (data.stage && !['sourced', 'screening', 'interview', 'offer', 'hired'].includes(data.stage)) {
    errors.push('invalid stage');
  }
  if (data.status && !['active', 'rejected', 'hired'].includes(data.status)) {
    errors.push('invalid status');
  }
  if (errors.length > 0) throw new Error(errors.join(', '));
}

export async function createCandidate(data) {
  validateCandidate(data);
  try {
    return await db.candidate.create({
      data: {
        name: data.name,
        email: data.email,
        role: data.role,
        stage: data.stage || 'sourced',
        status: data.status || 'active',
        resumeUrl: data.resumeUrl || null,
        notes: data.notes || null,
      },
    });
  } catch (error) {
    if (error.code === 'P2002') {
      throw new Error('Email already exists');
    }
    throw error;
  }
}

export async function getCandidate(id) {
  return await db.candidate.findUnique({ where: { id } });
}

export async function listCandidates(filters = {}) {
  const where = {};
  if (filters.status) where.status = filters.status;
  if (filters.stage) where.stage = filters.stage;

  return await db.candidate.findMany({
    where,
    orderBy: [{ createdAt: 'desc' }],
  });
}

export async function updateCandidate(id, data) {
  if (data.stage || data.status) {
    validateCandidate({ name: 'temp', email: 'temp@temp.com', role: 'temp', ...data });
  }
  return await db.candidate.update({
    where: { id },
    data: {
      stage: data.stage,
      status: data.status,
      notes: data.notes,
      resumeUrl: data.resumeUrl,
    },
  });
}

export async function deleteCandidate(id) {
  return await db.candidate.delete({ where: { id } });
}
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test -- server/tests/services/candidateService.test.js
```

Expected: FAIL (service doesn't exist yet)

- [ ] **Step 3: Commit service**

```bash
git add server/services/candidateService.js
git commit -m "feat: implement candidateService with validation

- Create, read, list, update, delete candidates
- Validate required fields and enums
- Handle email uniqueness constraint

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

---

## Task 3: Candidate Routes Implementation

**Files:**
- Modify: `server/routes/candidates.js`

- [ ] **Step 1: Implement full candidate routes**

```javascript
// server/routes/candidates.js
import express from 'express';
import * as candidateService from '../services/candidateService.js';

const router = express.Router();

// POST /api/candidates - Create a new candidate
router.post('/', async (req, res, next) => {
  try {
    const data = req.body;
    const candidate = await candidateService.createCandidate(data);
    res.status(201).json({ data: candidate });
  } catch (error) {
    if (error.message.includes('required') || error.message.includes('invalid')) {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
});

// GET /api/candidates - List all candidates with filters
router.get('/', async (req, res, next) => {
  try {
    const { status, stage } = req.query;
    const candidates = await candidateService.listCandidates({ status, stage });
    res.json({ data: candidates });
  } catch (error) {
    next(error);
  }
});

// GET /api/candidates/:id - Get candidate details
router.get('/:id', async (req, res, next) => {
  try {
    const candidate = await candidateService.getCandidate(req.params.id);
    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }
    res.json({ data: candidate });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/candidates/:id - Update candidate
router.patch('/:id', async (req, res, next) => {
  try {
    const candidate = await candidateService.updateCandidate(req.params.id, req.body);
    res.json({ data: candidate });
  } catch (error) {
    if (error.message.includes('not found')) {
      return res.status(404).json({ error: error.message });
    }
    next(error);
  }
});

// DELETE /api/candidates/:id - Delete candidate
router.delete('/:id', async (req, res, next) => {
  try {
    await candidateService.deleteCandidate(req.params.id);
    res.status(204).send();
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Candidate not found' });
    }
    next(error);
  }
});

export default router;
```

- [ ] **Step 2: Run route tests**

```bash
npm test -- server/tests/routes/candidates.test.js
```

Expected: PASS

- [ ] **Step 3: Commit routes**

```bash
git add server/routes/candidates.js
git commit -m "feat: implement candidate CRUD endpoints

- POST /api/candidates - Create candidate
- GET /api/candidates - List with status/stage filters
- GET /api/candidates/:id - Get single candidate
- PATCH /api/candidates/:id - Update candidate
- DELETE /api/candidates/:id - Delete candidate
- All endpoint tests passing

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

---

## Task 4: Employee Tests & Service

**Files:**
- Create: `server/tests/routes/employees.test.js`
- Create: `server/tests/services/employeeService.test.js`
- Create: `server/services/employeeService.js`

- [ ] **Step 1: Write employeeService tests**

```javascript
// server/tests/services/employeeService.test.js
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { db } from '../../db.js';
import * as employeeService from '../../services/employeeService.js';

describe('EmployeeService', () => {
  let candidateId;

  beforeAll(async () => {
    await db.employee.deleteMany({});
    await db.candidate.deleteMany({});
    const candidate = await db.candidate.create({
      data: {
        name: 'Test Candidate',
        email: 'testcand@example.com',
        role: 'Engineer',
        stage: 'offer',
        status: 'active',
      },
    });
    candidateId = candidate.id;
  });

  afterAll(async () => {
    await db.$disconnect();
  });

  describe('promoteCandidate', () => {
    it('should promote candidate to employee', async () => {
      const employee = await employeeService.promoteCandidate(candidateId, {
        title: 'Senior Engineer',
        department: 'Engineering',
        startDate: new Date(),
      });
      expect(employee.id).toBeDefined();
      expect(employee.candidateId).toBe(candidateId);
      expect(employee.status).toBe('active');
    });
  });

  describe('createEmployee', () => {
    it('should create employee directly', async () => {
      const employee = await employeeService.createEmployee({
        name: 'Direct Hire',
        email: 'directhire@example.com',
        title: 'Designer',
        department: 'Design',
        startDate: new Date(),
      });
      expect(employee.id).toBeDefined();
      expect(employee.email).toBe('directhire@example.com');
    });
  });

  describe('getEmployee', () => {
    it('should return employee by id', async () => {
      const created = await employeeService.createEmployee({
        name: 'Find Me',
        email: 'findme@example.com',
        title: 'PM',
        department: 'Product',
        startDate: new Date(),
      });
      const found = await employeeService.getEmployee(created.id);
      expect(found.id).toBe(created.id);
    });
  });

  describe('listEmployees', () => {
    it('should list active employees', async () => {
      const list = await employeeService.listEmployees({ status: 'active' });
      expect(list.every(e => e.status === 'active')).toBe(true);
    });

    it('should filter by department', async () => {
      const list = await employeeService.listEmployees({ department: 'Engineering' });
      expect(list.every(e => e.department === 'Engineering')).toBe(true);
    });
  });

  describe('updateEmployee', () => {
    it('should update employee title', async () => {
      const created = await employeeService.createEmployee({
        name: 'Update Me',
        email: 'updateme@example.com',
        title: 'Junior Dev',
        department: 'Eng',
        startDate: new Date(),
      });
      const updated = await employeeService.updateEmployee(created.id, {
        title: 'Senior Dev',
      });
      expect(updated.title).toBe('Senior Dev');
    });
  });

  describe('deleteEmployee', () => {
    it('should soft-delete (set status to offboarded)', async () => {
      const created = await employeeService.createEmployee({
        name: 'Delete Me',
        email: 'deleteme@example.com',
        title: 'QA',
        department: 'QA',
        startDate: new Date(),
      });
      const deleted = await employeeService.deleteEmployee(created.id);
      expect(deleted.status).toBe('offboarded');
    });
  });
});
```

- [ ] **Step 2: Write employee route tests**

```javascript
// server/tests/routes/employees.test.js
import request from 'supertest';
import app from '../../index.js';
import { db } from '../../db.js';

describe('Employee Routes', () => {
  beforeAll(async () => {
    await db.employee.deleteMany({});
    await db.candidate.deleteMany({});
  });

  afterAll(async () => {
    await db.$disconnect();
  });

  describe('POST /api/employees', () => {
    it('should create an employee', async () => {
      const res = await request(app).post('/api/employees').send({
        name: 'Alice Engineer',
        email: 'alice.engineer@example.com',
        title: 'Senior Engineer',
        department: 'Engineering',
        startDate: new Date(),
      });
      expect(res.status).toBe(201);
      expect(res.body.data.id).toBeDefined();
    });
  });

  describe('GET /api/employees', () => {
    it('should list employees', async () => {
      const res = await request(app).get('/api/employees');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should filter by department', async () => {
      const res = await request(app).get('/api/employees?department=Engineering');
      expect(res.status).toBe(200);
      expect(res.body.data.every(e => e.department === 'Engineering')).toBe(true);
    });
  });

  describe('GET /api/employees/:id', () => {
    it('should get an employee by id', async () => {
      const created = await request(app).post('/api/employees').send({
        name: 'Bob Designer',
        email: 'bob.designer@example.com',
        title: 'UI Designer',
        department: 'Design',
        startDate: new Date(),
      });
      const id = created.body.data.id;
      const res = await request(app).get(`/api/employees/${id}`);
      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(id);
    });
  });

  describe('PATCH /api/employees/:id', () => {
    it('should update employee title', async () => {
      const created = await request(app).post('/api/employees').send({
        name: 'Carol PM',
        email: 'carol.pm@example.com',
        title: 'PM',
        department: 'Product',
        startDate: new Date(),
      });
      const id = created.body.data.id;
      const res = await request(app)
        .patch(`/api/employees/${id}`)
        .send({ title: 'Senior PM' });
      expect(res.status).toBe(200);
      expect(res.body.data.title).toBe('Senior PM');
    });
  });

  describe('POST /api/employees/:candidateId/promote', () => {
    it('should promote candidate to employee', async () => {
      const candidate = await db.candidate.create({
        data: {
          name: 'Promote Me',
          email: 'promoteme@example.com',
          role: 'Engineer',
          stage: 'offer',
        },
      });
      const res = await request(app)
        .post(`/api/employees/${candidate.id}/promote`)
        .send({
          title: 'Software Engineer',
          department: 'Engineering',
          startDate: new Date(),
        });
      expect(res.status).toBe(201);
      expect(res.body.data.candidateId).toBe(candidate.id);
    });
  });

  describe('DELETE /api/employees/:id', () => {
    it('should offboard employee', async () => {
      const created = await request(app).post('/api/employees').send({
        name: 'Dave QA',
        email: 'dave.qa@example.com',
        title: 'QA Engineer',
        department: 'QA',
        startDate: new Date(),
      });
      const id = created.body.data.id;
      const res = await request(app).delete(`/api/employees/${id}`);
      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('offboarded');
    });
  });
});
```

- [ ] **Step 3: Implement employeeService**

```javascript
// server/services/employeeService.js
import { db } from '../db.js';

function validateEmployee(data) {
  const errors = [];
  if (!data.name || typeof data.name !== 'string') errors.push('name is required');
  if (!data.email || typeof data.email !== 'string') errors.push('email is required');
  if (!data.title || typeof data.title !== 'string') errors.push('title is required');
  if (!data.department || typeof data.department !== 'string') errors.push('department is required');
  if (!data.startDate) errors.push('startDate is required');
  if (data.status && !['active', 'offboarded'].includes(data.status)) {
    errors.push('invalid status');
  }
  if (errors.length > 0) throw new Error(errors.join(', '));
}

export async function promoteCandidate(candidateId, data) {
  validateEmployee(data);
  const candidate = await db.candidate.findUnique({ where: { id: candidateId } });
  if (!candidate) throw new Error('Candidate not found');

  try {
    return await db.employee.create({
      data: {
        candidateId,
        name: candidate.name,
        email: candidate.email,
        title: data.title,
        department: data.department,
        startDate: new Date(data.startDate),
        status: 'active',
      },
    });
  } catch (error) {
    if (error.code === 'P2002') {
      throw new Error('Email already exists');
    }
    throw error;
  }
}

export async function createEmployee(data) {
  validateEmployee(data);
  try {
    return await db.employee.create({
      data: {
        name: data.name,
        email: data.email,
        title: data.title,
        department: data.department,
        startDate: new Date(data.startDate),
        status: 'active',
      },
    });
  } catch (error) {
    if (error.code === 'P2002') {
      throw new Error('Email already exists');
    }
    throw error;
  }
}

export async function getEmployee(id) {
  return await db.employee.findUnique({
    where: { id },
    include: {
      onboardingTasks: { orderBy: { dueDate: 'asc' } },
      assignments: { where: { returnedDate: null } },
    },
  });
}

export async function listEmployees(filters = {}) {
  const where = {};
  if (filters.status) where.status = filters.status;
  if (filters.department) where.department = filters.department;

  return await db.employee.findMany({
    where,
    orderBy: [{ createdAt: 'desc' }],
    include: { assignments: { where: { returnedDate: null } } },
  });
}

export async function updateEmployee(id, data) {
  const updateData = {};
  if (data.title) updateData.title = data.title;
  if (data.department) updateData.department = data.department;
  if (data.status) updateData.status = data.status;

  return await db.employee.update({
    where: { id },
    data: updateData,
  });
}

export async function deleteEmployee(id) {
  // Soft delete: set status to offboarded
  return await db.employee.update({
    where: { id },
    data: { status: 'offboarded' },
  });
}
```

- [ ] **Step 4: Run tests**

```bash
npm test -- server/tests/services/employeeService.test.js server/tests/routes/employees.test.js
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add server/services/employeeService.js server/tests/
git commit -m "test: add employee service and route tests with TDD

- Test promotion flow (candidate -> employee)
- Test employee CRUD operations
- Test filtering by department and status
- Test soft-delete (offboarding)

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

---

## Task 5: Employee Routes Implementation

**Files:**
- Modify: `server/routes/employees.js`

- [ ] **Step 1: Implement full employee routes**

```javascript
// server/routes/employees.js
import express from 'express';
import * as employeeService from '../services/employeeService.js';

const router = express.Router();

// POST /api/employees - Create a new employee
router.post('/', async (req, res, next) => {
  try {
    const employee = await employeeService.createEmployee(req.body);
    res.status(201).json({ data: employee });
  } catch (error) {
    if (error.message.includes('required') || error.message.includes('invalid')) {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
});

// GET /api/employees - List all employees with filters
router.get('/', async (req, res, next) => {
  try {
    const { status, department } = req.query;
    const employees = await employeeService.listEmployees({ status, department });
    res.json({ data: employees });
  } catch (error) {
    next(error);
  }
});

// GET /api/employees/:id - Get employee details with tasks and devices
router.get('/:id', async (req, res, next) => {
  try {
    const employee = await employeeService.getEmployee(req.params.id);
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    res.json({ data: employee });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/employees/:id - Update employee
router.patch('/:id', async (req, res, next) => {
  try {
    const employee = await employeeService.updateEmployee(req.params.id, req.body);
    res.json({ data: employee });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Employee not found' });
    }
    next(error);
  }
});

// POST /api/employees/:candidateId/promote - Promote candidate to employee
router.post('/:candidateId/promote', async (req, res, next) => {
  try {
    const employee = await employeeService.promoteCandidate(req.params.candidateId, req.body);
    res.status(201).json({ data: employee });
  } catch (error) {
    if (error.message.includes('not found')) {
      return res.status(404).json({ error: error.message });
    }
    if (error.message.includes('required')) {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
});

// DELETE /api/employees/:id - Offboard employee (soft delete)
router.delete('/:id', async (req, res, next) => {
  try {
    const employee = await employeeService.deleteEmployee(req.params.id);
    res.status(200).json({ data: employee });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Employee not found' });
    }
    next(error);
  }
});

// GET /api/employees/:id/onboarding - Get onboarding tasks
router.get('/:id/onboarding', async (req, res, next) => {
  // Phase 4 implementation
  res.json({ message: 'GET /api/employees/:id/onboarding - Onboarding tasks (Phase 4)' });
});

// GET /api/employees/:id/offboarding - Get offboarding tasks
router.get('/:id/offboarding', async (req, res, next) => {
  // Phase 4 implementation
  res.json({ message: 'GET /api/employees/:id/offboarding - Offboarding tasks (Phase 4)' });
});

export default router;
```

- [ ] **Step 2: Run all tests**

```bash
npm test
```

Expected: ALL PASS

- [ ] **Step 3: Commit**

```bash
git add server/routes/employees.js
git commit -m "feat: implement employee CRUD endpoints

- POST /api/employees - Create employee
- GET /api/employees - List with filters
- GET /api/employees/:id - Get single employee with tasks
- PATCH /api/employees/:id - Update employee
- POST /api/employees/:candidateId/promote - Promote candidate
- DELETE /api/employees/:id - Soft-delete (offboard)
- All endpoint tests passing

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

---

## Task 6: React Directory Page

**Files:**
- Create: `app/src/utils/formatters.js`
- Modify: `app/src/pages/people/Directory.jsx`
- Create: `app/src/hooks/useEmployees.js`

- [ ] **Step 1: Create formatters utility**

```javascript
// app/src/utils/formatters.js
export function formatDate(date) {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatStatus(status) {
  const map = {
    active: 'Active',
    offboarded: 'Offboarded',
  };
  return map[status] || status;
}

export function getStatusColor(status) {
  const map = {
    active: 'bg-green-100 text-green-800',
    offboarded: 'bg-gray-100 text-gray-800',
  };
  return map[status] || 'bg-gray-100 text-gray-800';
}
```

- [ ] **Step 2: Create useEmployees hook**

```javascript
// app/src/hooks/useEmployees.js
import { useState, useEffect } from 'react';

export function useEmployees(filters = {}) {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        const query = new URLSearchParams(filters);
        const response = await fetch(`/api/employees?${query}`);
        if (!response.ok) throw new Error('Failed to fetch employees');
        const { data } = await response.json();
        setEmployees(data);
        setError(null);
      } catch (err) {
        setError(err.message);
        setEmployees([]);
      } finally {
        setLoading(false);
      }
    };
    fetchEmployees();
  }, [filters]);

  return { employees, loading, error };
}
```

- [ ] **Step 3: Implement Directory page with table**

```javascript
// app/src/pages/people/Directory.jsx
import { useState } from 'react';
import { useEmployees } from '../../hooks/useEmployees';
import { formatDate, formatStatus, getStatusColor } from '../../utils/formatters';

export default function Directory() {
  const [filters, setFilters] = useState({ status: 'active' });
  const [sortBy, setSortBy] = useState('createdAt');
  const { employees, loading, error } = useEmployees(filters);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Employee Directory</h1>
          <p className="text-gray-600 mt-2">All employees in the organization</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={filters.status || ''}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="">All</option>
              <option value="active">Active</option>
              <option value="offboarded">Offboarded</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
            <select
              value={filters.department || ''}
              onChange={(e) => handleFilterChange('department', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="">All</option>
              <option value="Engineering">Engineering</option>
              <option value="Design">Design</option>
              <option value="Product">Product</option>
              <option value="Sales">Sales</option>
              <option value="Operations">Operations</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Loading employees...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error: {error}</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Title</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Department</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Start Date</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Devices</th>
              </tr>
            </thead>
            <tbody>
              {employees.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 px-4 text-center text-gray-500">
                    No employees found
                  </td>
                </tr>
              ) : (
                employees.map((employee) => (
                  <tr key={employee.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <p className="font-medium text-gray-900">{employee.name}</p>
                      <p className="text-sm text-gray-500">{employee.email}</p>
                    </td>
                    <td className="py-3 px-4 text-gray-700">{employee.title}</td>
                    <td className="py-3 px-4 text-gray-700">{employee.department}</td>
                    <td className="py-3 px-4 text-gray-700">{formatDate(employee.startDate)}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(employee.status)}`}>
                        {formatStatus(employee.status)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-700">
                      {employee.assignments ? employee.assignments.length : 0}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {employees.length > 0 && (
        <p className="text-sm text-gray-500 mt-4">Showing {employees.length} employees</p>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Test Directory page manually**

Navigate to http://localhost:5173/people/directory after starting both servers

- [ ] **Step 5: Commit**

```bash
cd app && git add src/pages/people/Directory.jsx src/hooks/useEmployees.js src/utils/formatters.js
git commit -m "feat: implement employee directory with filtering

- Add Directory page with employee table
- Add useEmployees hook for data fetching
- Add formatters for dates and status display
- Filter by status and department
- Show active devices per employee

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

---

## Task 7: React Hiring Pipeline

**Files:**
- Create: `app/src/hooks/useCandidates.js`
- Modify: `app/src/pages/people/Hiring.jsx`

- [ ] **Step 1: Create useCandidates hook**

```javascript
// app/src/hooks/useCandidates.js
import { useState, useEffect } from 'react';

export function useCandidates(stage = null) {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        setLoading(true);
        const query = stage ? `?stage=${stage}` : '';
        const response = await fetch(`/api/candidates${query}`);
        if (!response.ok) throw new Error('Failed to fetch candidates');
        const { data } = await response.json();
        setCandidates(data);
        setError(null);
      } catch (err) {
        setError(err.message);
        setCandidates([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCandidates();
  }, [stage]);

  return { candidates, loading, error };
}
```

- [ ] **Step 2: Implement Hiring pipeline page (Kanban view)**

```javascript
// app/src/pages/people/Hiring.jsx
import { useCandidates } from '../../hooks/useCandidates';
import { formatDate } from '../../utils/formatters';

const STAGES = ['sourced', 'screening', 'interview', 'offer', 'hired'];

export default function Hiring() {
  const allCandidates = useCandidates();

  // Group candidates by stage
  const candidatesByStage = STAGES.reduce((acc, stage) => {
    acc[stage] = allCandidates.candidates.filter(c => c.stage === stage);
    return acc;
  }, {});

  const stageLabels = {
    sourced: 'Sourced',
    screening: 'Screening',
    interview: 'Interview',
    offer: 'Offer',
    hired: 'Hired',
  };

  return (
    <div className="p-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Hiring Pipeline</h1>
        <p className="text-gray-600">Track candidates through the hiring funnel</p>
      </div>

      {allCandidates.error && (
        <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error: {allCandidates.error}</p>
        </div>
      )}

      {allCandidates.loading ? (
        <div className="text-center py-16">
          <p className="text-gray-500">Loading pipeline...</p>
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <div className="flex gap-4 pb-4" style={{ minWidth: '100%' }}>
            {STAGES.map((stage) => (
              <div
                key={stage}
                className="flex-shrink-0 w-80 bg-gray-50 rounded-lg border border-gray-200 p-4"
              >
                {/* Stage header */}
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900">{stageLabels[stage]}</h3>
                  <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-sm font-medium">
                    {candidatesByStage[stage].length}
                  </span>
                </div>

                {/* Candidates in stage */}
                <div className="space-y-3">
                  {candidatesByStage[stage].length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-4">No candidates</p>
                  ) : (
                    candidatesByStage[stage].map((candidate) => (
                      <div
                        key={candidate.id}
                        className="bg-white rounded border border-gray-200 p-3 hover:shadow-md transition-shadow"
                      >
                        <p className="font-medium text-gray-900 text-sm">{candidate.name}</p>
                        <p className="text-xs text-gray-600 truncate">{candidate.email}</p>
                        <p className="text-xs text-gray-500 mt-2">{candidate.role}</p>
                        {candidate.resumeUrl && (
                          <a
                            href={candidate.resumeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-purple-600 hover:underline mt-2 block"
                          >
                            View Resume →
                          </a>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary stats */}
      {!allCandidates.loading && (
        <div className="mt-8 grid grid-cols-5 gap-4">
          {STAGES.map((stage) => (
            <div key={stage} className="bg-white rounded-lg border border-gray-200 p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">{candidatesByStage[stage].length}</p>
              <p className="text-xs text-gray-500 uppercase tracking-wide mt-1">{stageLabels[stage]}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Test Hiring page**

Navigate to http://localhost:5173/people/hiring

- [ ] **Step 4: Commit**

```bash
cd app && git add src/pages/people/Hiring.jsx src/hooks/useCandidates.js
git commit -m "feat: implement hiring pipeline Kanban view

- Add useCandidates hook for fetching by stage
- Create Kanban-style pipeline with 5 stages
- Display candidate count per stage
- Show resume link for each candidate
- Add summary stats at bottom

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

---

## Task 8: Final Integration Test & Documentation

**Files:**
- Modify: `README.md`
- Modify: `package.json` (server, add test coverage)

- [ ] **Step 1: Run full test suite**

```bash
npm test -- --coverage
```

Expected: All tests pass, 80%+ coverage

- [ ] **Step 2: Start both servers and verify UI**

Terminal 1:
```bash
npm run dev
```

Terminal 2:
```bash
npm run app:dev
```

- [ ] **Step 3: Test workflows in browser**

1. Create candidate: POST to /api/candidates
   - Navigate to People → Hiring
   - Should see candidate on Kanban board

2. Create employee: POST to /api/employees
   - Navigate to People → Directory
   - Should see employee in table with filter

3. Promote candidate: POST to /api/employees/:candidateId/promote
   - Candidate status changes to hired
   - New Employee record created with candidateId link

- [ ] **Step 4: Update README with Phase 2 completion**

Add to Phase 2 section:
```markdown
## Phase 2: People Core ✓

- ✓ Candidate CRUD endpoints (create, read, list, update, delete)
  - Filter by status (active, rejected, hired) and stage (sourced → hired)
  - Validation on required fields

- ✓ Employee CRUD endpoints (create, read, list, update, delete)
  - Filter by status (active, offboarded) and department
  - Soft-delete via offboarding

- ✓ Candidate → Employee promotion flow
  - Preserves candidate history via candidateId FK
  - Creates new Employee record on hire

- ✓ React pages with live data
  - Employee Directory with sortable table and filters
  - Hiring Pipeline with Kanban view by stage
  - Show device count per employee

- ✓ Comprehensive test suite
  - Service layer unit tests
  - Route handler integration tests
  - 80%+ code coverage

### Run tests:
```bash
npm test                 # Run all tests
npm run test:coverage    # Generate coverage report
```

### Next: Phase 3 - Device Core
```

- [ ] **Step 5: Commit final changes**

```bash
git add README.md package.json
git commit -m "docs: complete Phase 2 - People Core

- All candidate and employee CRUD endpoints implemented
- Frontend pages with live data integration
- Comprehensive test suite with 80%+ coverage
- Candidate promotion flow working end-to-end
- Ready for Phase 3 device management

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

---

## Verification Checklist

After completing all tasks:

- [ ] All 50+ tests passing (`npm test`)
- [ ] No TypeErrors or import errors
- [ ] Server starts without errors (`npm run dev`)
- [ ] React app starts without errors (`npm run app:dev`)
- [ ] Employee Directory loads and shows employees
- [ ] Hiring Pipeline loads and groups candidates by stage
- [ ] Candidate filtering works in Kanban view
- [ ] Employee filtering by department works
- [ ] Can create candidates via API
- [ ] Can create employees via API
- [ ] Can promote candidates to employees
- [ ] Database persists data across server restarts

---

## Success Criteria

**Phase 2 is complete when:**
1. All 8 tasks implemented with green tests
2. Both frontend pages fully functional with live data
3. Full end-to-end workflow tested (candidate → hire → employee)
4. 80%+ test coverage
5. Zero console errors in browser
6. README updated with Phase 2 completion
7. All code committed to git with descriptive messages

---

## Architecture Notes

### Service Layer Pattern
Business logic separated from routes. Each service (candidateService, employeeService) handles:
- Input validation
- Prisma database operations
- Error handling and translation

### Data Fetching in React
- `useEmployees()` hook abstracts API calls
- Filters trigger re-fetch automatically
- Error states handled in UI
- Loading states shown to user

### Validation
- **Server-side:** Required for security and data integrity
- **Client-side:** Feedback only (form hints, disable submit, etc.)

### Testing Strategy
- **TDD:** Tests written before implementation
- **Unit tests:** Service layer logic
- **Integration tests:** Route handlers with real database
- **Isolated database:** Each test cleans up after itself
