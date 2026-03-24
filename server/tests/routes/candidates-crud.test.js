import request from 'supertest';
import express from 'express';
import { db } from '../../db.js';
import candidatesRouter from '../../routes/candidates.js';

/**
 * Comprehensive tests for Candidates CRUD API
 * Tests all CRUD operations, filtering, sorting, pagination, and duplicate detection
 */

describe('Candidates CRUD API Routes', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/candidates', candidatesRouter);
    // Error handler middleware
    app.use((err, req, res, next) => {
      console.error('[Test Error]', err.message);
      res.status(err.status || 500).json({
        error: err.message || 'Internal server error',
      });
    });
  });

  beforeEach(async () => {
    // Clean up database before each test
    await db.candidate.deleteMany({});
    await db.configList.deleteMany({});
    await db.configListItem.deleteMany({});
    await db.client.deleteMany({});
  });

  afterAll(async () => {
    await db.$disconnect();
  });

  // ==================== HELPER FUNCTIONS ====================

  async function createTestClient(name = 'Test Client') {
    return db.client.create({
      data: { name },
    });
  }

  async function createConfigListWithItems(listName, items) {
    const list = await db.configList.create({
      data: { name: listName },
    });

    const createdItems = await Promise.all(
      items.map((item, index) =>
        db.configListItem.create({
          data: {
            listId: list.id,
            label: item.label,
            value: item.value || item.label,
            order: index,
          },
        })
      )
    );

    return { list, items: createdItems };
  }

  // ==================== GET /api/candidates - LIST TESTS ====================

  describe('GET /api/candidates - List candidates with filters, sorting, pagination', () => {
    test('should return empty array when no candidates exist', async () => {
      const res = await request(app).get('/api/candidates');
      expect(res.status).toBe(200);
      expect(res.body.candidates).toEqual([]);
      expect(res.body.total).toBe(0);
      expect(res.body.page).toBe(1);
      expect(res.body.limit).toBe(25);
    });

    test('should list all candidates with default pagination', async () => {
      await db.candidate.create({
        data: {
          name: 'Alice Johnson',
          email: 'alice@example.com',
          phone: '555-1234',
          location: 'San Francisco, CA',
          roleApplied: 'Senior Engineer',
          status: 'active',
          stage: 'applied',
        },
      });

      await db.candidate.create({
        data: {
          name: 'Bob Smith',
          email: 'bob@example.com',
          phone: '555-5678',
          location: 'New York, NY',
          roleApplied: 'Product Manager',
          status: 'active',
          stage: 'screening',
        },
      });

      const res = await request(app).get('/api/candidates');
      expect(res.status).toBe(200);
      expect(res.body.candidates).toHaveLength(2);
      expect(res.body.total).toBe(2);
    });

    test('should filter candidates by status', async () => {
      await db.candidate.create({
        data: {
          name: 'Active Candidate',
          email: 'active@example.com',
          roleApplied: 'Engineer',
          status: 'active',
          stage: 'applied',
        },
      });

      await db.candidate.create({
        data: {
          name: 'Hired Candidate',
          email: 'hired@example.com',
          roleApplied: 'Engineer',
          status: 'hired',
          stage: 'closed',
        },
      });

      const res = await request(app).get('/api/candidates?status=active');
      expect(res.status).toBe(200);
      expect(res.body.candidates).toHaveLength(1);
      expect(res.body.candidates[0].status).toBe('active');
    });

    test('should filter candidates by stage', async () => {
      await db.candidate.create({
        data: {
          name: 'Applied Candidate',
          email: 'applied@example.com',
          roleApplied: 'Engineer',
          status: 'active',
          stage: 'applied',
        },
      });

      await db.candidate.create({
        data: {
          name: 'Interview Candidate',
          email: 'interview@example.com',
          roleApplied: 'Engineer',
          status: 'active',
          stage: 'interview',
        },
      });

      const res = await request(app).get('/api/candidates?stage=interview');
      expect(res.status).toBe(200);
      expect(res.body.candidates).toHaveLength(1);
      expect(res.body.candidates[0].stage).toBe('interview');
    });

    test('should filter by multiple statuses', async () => {
      await db.candidate.create({
        data: {
          name: 'Active',
          email: 'active@example.com',
          roleApplied: 'Engineer',
          status: 'active',
          stage: 'applied',
        },
      });

      await db.candidate.create({
        data: {
          name: 'Hired',
          email: 'hired@example.com',
          roleApplied: 'Engineer',
          status: 'hired',
          stage: 'closed',
        },
      });

      await db.candidate.create({
        data: {
          name: 'Rejected',
          email: 'rejected@example.com',
          roleApplied: 'Engineer',
          status: 'rejected',
          stage: 'closed',
        },
      });

      const res = await request(app).get('/api/candidates?status=active,hired');
      expect(res.status).toBe(200);
      expect(res.body.candidates).toHaveLength(2);
      expect(res.body.candidates.map(c => c.status)).toEqual(expect.arrayContaining(['active', 'hired']));
    });

    test('should filter by source', async () => {
      const { items } = await createConfigListWithItems('candidate_source', [
        { label: 'LinkedIn', value: 'linkedin' },
        { label: 'Referral', value: 'referral' },
      ]);

      await db.candidate.create({
        data: {
          name: 'LinkedIn Candidate',
          email: 'linkedin@example.com',
          roleApplied: 'Engineer',
          sourceId: items[0].id,
        },
      });

      await db.candidate.create({
        data: {
          name: 'Referral Candidate',
          email: 'referral@example.com',
          roleApplied: 'Engineer',
          sourceId: items[1].id,
        },
      });

      const res = await request(app).get(`/api/candidates?sourceId=${items[0].id}`);
      expect(res.status).toBe(200);
      expect(res.body.candidates).toHaveLength(1);
      expect(res.body.candidates[0].sourceId).toBe(items[0].id);
    });

    test('should filter by client', async () => {
      const client1 = await createTestClient('Acme Corp');
      const client2 = await createTestClient('Tech Startup');

      await db.candidate.create({
        data: {
          name: 'Acme Candidate',
          email: 'acme@example.com',
          roleApplied: 'Engineer',
          clientId: client1.id,
        },
      });

      await db.candidate.create({
        data: {
          name: 'Startup Candidate',
          email: 'startup@example.com',
          roleApplied: 'Engineer',
          clientId: client2.id,
        },
      });

      const res = await request(app).get(`/api/candidates?clientId=${client1.id}`);
      expect(res.status).toBe(200);
      expect(res.body.candidates).toHaveLength(1);
      expect(res.body.candidates[0].clientId).toBe(client1.id);
    });

    test('should support sorting by different columns', async () => {
      await db.candidate.create({
        data: {
          name: 'Alice',
          email: 'alice@example.com',
          roleApplied: 'Engineer',
          status: 'active',
        },
      });

      await db.candidate.create({
        data: {
          name: 'Bob',
          email: 'bob@example.com',
          roleApplied: 'Engineer',
          status: 'active',
        },
      });

      const res = await request(app).get('/api/candidates?sortBy=name&sortOrder=asc');
      expect(res.status).toBe(200);
      expect(res.body.candidates[0].name).toBe('Alice');
      expect(res.body.candidates[1].name).toBe('Bob');
    });

    test('should support sorting in descending order', async () => {
      await db.candidate.create({
        data: {
          name: 'Alice',
          email: 'alice@example.com',
          roleApplied: 'Engineer',
        },
      });

      await db.candidate.create({
        data: {
          name: 'Bob',
          email: 'bob@example.com',
          roleApplied: 'Engineer',
        },
      });

      const res = await request(app).get('/api/candidates?sortBy=name&sortOrder=desc');
      expect(res.status).toBe(200);
      expect(res.body.candidates[0].name).toBe('Bob');
      expect(res.body.candidates[1].name).toBe('Alice');
    });

    test('should support pagination with limit and offset', async () => {
      for (let i = 0; i < 30; i++) {
        await db.candidate.create({
          data: {
            name: `Candidate ${i}`,
            email: `candidate${i}@example.com`,
            roleApplied: 'Engineer',
          },
        });
      }

      const res1 = await request(app).get('/api/candidates?limit=10&offset=0');
      expect(res1.status).toBe(200);
      expect(res1.body.candidates).toHaveLength(10);
      expect(res1.body.total).toBe(30);

      const res2 = await request(app).get('/api/candidates?limit=10&offset=10');
      expect(res2.status).toBe(200);
      expect(res2.body.candidates).toHaveLength(10);
    });

    test('should use default pagination values', async () => {
      const res = await request(app).get('/api/candidates');
      expect(res.status).toBe(200);
      expect(res.body.limit).toBe(25);
      expect(res.body.page).toBe(1);
    });
  });

  // ==================== POST /api/candidates - CREATE TESTS ====================

  describe('POST /api/candidates - Create candidate with duplicate detection', () => {
    test('should create a candidate with minimal required fields', async () => {
      const res = await request(app)
        .post('/api/candidates')
        .send({
          name: 'John Doe',
          email: 'john@example.com',
          roleApplied: 'Software Engineer',
        });

      expect(res.status).toBe(201);
      expect(res.body.id).toBeDefined();
      expect(res.body.name).toBe('John Doe');
      expect(res.body.email).toBe('john@example.com');
      expect(res.body.roleApplied).toBe('Software Engineer');
      expect(res.body.status).toBe('active');
      expect(res.body.stage).toBe('applied');
    });

    test('should create a candidate with all fields', async () => {
      const client = await createTestClient('Acme Corp');
      const { items: sources } = await createConfigListWithItems('candidate_source', [
        { label: 'LinkedIn', value: 'linkedin' },
      ]);
      const { items: seniorities } = await createConfigListWithItems('seniority', [
        { label: 'Senior', value: 'senior' },
      ]);

      const res = await request(app)
        .post('/api/candidates')
        .send({
          name: 'Jane Smith',
          email: 'jane@example.com',
          phone: '555-1234',
          location: 'San Francisco, CA',
          roleApplied: 'Product Manager',
          status: 'active',
          stage: 'screening',
          sourceId: sources[0].id,
          seniorityId: seniorities[0].id,
          clientId: client.id,
          referredBy: 'John Doe',
          notes: 'Great fit for team',
        });

      expect(res.status).toBe(201);
      expect(res.body.id).toBeDefined();
      expect(res.body.phone).toBe('555-1234');
      expect(res.body.location).toBe('San Francisco, CA');
      expect(res.body.status).toBe('active');
      expect(res.body.stage).toBe('screening');
      expect(res.body.sourceId).toBe(sources[0].id);
      expect(res.body.seniorityId).toBe(seniorities[0].id);
      expect(res.body.clientId).toBe(client.id);
      expect(res.body.referredBy).toBe('John Doe');
      expect(res.body.notes).toBe('Great fit for team');
    });

    test('should require name field', async () => {
      const res = await request(app)
        .post('/api/candidates')
        .send({
          email: 'test@example.com',
          roleApplied: 'Engineer',
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('name');
    });

    test('should require email field', async () => {
      const res = await request(app)
        .post('/api/candidates')
        .send({
          name: 'Test User',
          roleApplied: 'Engineer',
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('email');
    });

    test('should require roleApplied field', async () => {
      const res = await request(app)
        .post('/api/candidates')
        .send({
          name: 'Test User',
          email: 'test@example.com',
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('roleApplied');
    });

    test('should detect duplicate email and return conflict with existing candidate data', async () => {
      const existing = await db.candidate.create({
        data: {
          name: 'John Doe',
          email: 'john@example.com',
          roleApplied: 'Engineer',
        },
      });

      const res = await request(app)
        .post('/api/candidates')
        .send({
          name: 'Different Name',
          email: 'john@example.com',
          roleApplied: 'Manager',
        });

      expect(res.status).toBe(409);
      expect(res.body.conflict).toBe(true);
      expect(res.body.existingCandidateId).toBe(existing.id);
      expect(res.body.existingCandidate).toBeDefined();
      expect(res.body.existingCandidate.name).toBe('John Doe');
      expect(res.body.existingCandidate.email).toBe('john@example.com');
    });

    test('should accept valid status values', async () => {
      const statuses = ['active', 'hired', 'rejected', 'withdrawn'];

      for (const status of statuses) {
        const res = await request(app)
          .post('/api/candidates')
          .send({
            name: `Candidate ${status}`,
            email: `candidate.${status}@example.com`,
            roleApplied: 'Engineer',
            status,
          });

        expect(res.status).toBe(201);
        expect(res.body.status).toBe(status);
      }
    });

    test('should accept valid stage values', async () => {
      const stages = ['applied', 'screening', 'interview', 'offer', 'closed'];

      for (const stage of stages) {
        const res = await request(app)
          .post('/api/candidates')
          .send({
            name: `Candidate ${stage}`,
            email: `candidate.${stage}@example.com`,
            roleApplied: 'Engineer',
            stage,
          });

        expect(res.status).toBe(201);
        expect(res.body.stage).toBe(stage);
      }
    });
  });

  // ==================== GET /api/candidates/:id - DETAIL TESTS ====================

  describe('GET /api/candidates/:id - Get candidate detail with related data', () => {
    test('should retrieve candidate with basic data', async () => {
      const candidate = await db.candidate.create({
        data: {
          name: 'John Doe',
          email: 'john@example.com',
          roleApplied: 'Engineer',
        },
      });

      const res = await request(app).get(`/api/candidates/${candidate.id}`);
      expect(res.status).toBe(200);
      expect(res.body.id).toBe(candidate.id);
      expect(res.body.name).toBe('John Doe');
      expect(res.body.email).toBe('john@example.com');
    });

    test('should retrieve candidate with resumes', async () => {
      const candidate = await db.candidate.create({
        data: {
          name: 'John Doe',
          email: 'john@example.com',
          roleApplied: 'Engineer',
        },
      });

      await db.resume.create({
        data: {
          candidateId: candidate.id,
          fileUrl: '/resumes/john_resume.pdf',
          fileName: 'john_resume.pdf',
        },
      });

      await db.resume.create({
        data: {
          candidateId: candidate.id,
          fileUrl: '/resumes/john_resume_v2.pdf',
          fileName: 'john_resume_v2.pdf',
        },
      });

      const res = await request(app).get(`/api/candidates/${candidate.id}`);
      expect(res.status).toBe(200);
      expect(res.body.resumes).toBeDefined();
      expect(res.body.resumes).toHaveLength(2);
      // Resumes are ordered by uploadedAt desc, so latest comes first
      const fileNames = res.body.resumes.map(r => r.fileName);
      expect(fileNames).toContain('john_resume.pdf');
      expect(fileNames).toContain('john_resume_v2.pdf');
    });

    test('should retrieve candidate with interviews', async () => {
      const candidate = await db.candidate.create({
        data: {
          name: 'John Doe',
          email: 'john@example.com',
          roleApplied: 'Engineer',
        },
      });

      const interview = await db.interview.create({
        data: {
          candidateId: candidate.id,
          scheduledAt: new Date(),
          status: 'scheduled',
        },
      });

      const res = await request(app).get(`/api/candidates/${candidate.id}`);
      expect(res.status).toBe(200);
      expect(res.body.interviews).toBeDefined();
      expect(res.body.interviews).toHaveLength(1);
      expect(res.body.interviews[0].id).toBe(interview.id);
    });

    test('should retrieve candidate with offers', async () => {
      const candidate = await db.candidate.create({
        data: {
          name: 'John Doe',
          email: 'john@example.com',
          roleApplied: 'Engineer',
        },
      });

      const offer = await db.offer.create({
        data: {
          candidateId: candidate.id,
          role: 'Senior Engineer',
          status: 'pending',
        },
      });

      const res = await request(app).get(`/api/candidates/${candidate.id}`);
      expect(res.status).toBe(200);
      expect(res.body.offers).toBeDefined();
      expect(res.body.offers).toHaveLength(1);
      expect(res.body.offers[0].id).toBe(offer.id);
    });

    test('should return 404 for non-existent candidate', async () => {
      const res = await request(app).get('/api/candidates/nonexistent-id');
      expect(res.status).toBe(404);
      expect(res.body.error).toContain('not found');
    });
  });

  // ==================== PATCH /api/candidates/:id - UPDATE TESTS ====================

  describe('PATCH /api/candidates/:id - Update candidate', () => {
    test('should update candidate status', async () => {
      const candidate = await db.candidate.create({
        data: {
          name: 'John Doe',
          email: 'john@example.com',
          roleApplied: 'Engineer',
          status: 'active',
        },
      });

      const res = await request(app)
        .patch(`/api/candidates/${candidate.id}`)
        .send({ status: 'hired' });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('hired');
      expect(res.body.name).toBe('John Doe'); // unchanged
    });

    test('should update candidate stage', async () => {
      const candidate = await db.candidate.create({
        data: {
          name: 'John Doe',
          email: 'john@example.com',
          roleApplied: 'Engineer',
          stage: 'applied',
        },
      });

      const res = await request(app)
        .patch(`/api/candidates/${candidate.id}`)
        .send({ stage: 'interview' });

      expect(res.status).toBe(200);
      expect(res.body.stage).toBe('interview');
    });

    test('should update candidate notes', async () => {
      const candidate = await db.candidate.create({
        data: {
          name: 'John Doe',
          email: 'john@example.com',
          roleApplied: 'Engineer',
        },
      });

      const res = await request(app)
        .patch(`/api/candidates/${candidate.id}`)
        .send({ notes: 'Great technical skills' });

      expect(res.status).toBe(200);
      expect(res.body.notes).toBe('Great technical skills');
    });

    test('should update multiple fields at once', async () => {
      const candidate = await db.candidate.create({
        data: {
          name: 'John Doe',
          email: 'john@example.com',
          roleApplied: 'Engineer',
          status: 'active',
          stage: 'applied',
        },
      });

      const res = await request(app)
        .patch(`/api/candidates/${candidate.id}`)
        .send({
          status: 'rejected',
          stage: 'closed',
          notes: 'Not a good fit',
        });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('rejected');
      expect(res.body.stage).toBe('closed');
      expect(res.body.notes).toBe('Not a good fit');
    });

    test('should return 404 for non-existent candidate', async () => {
      const res = await request(app)
        .patch('/api/candidates/nonexistent-id')
        .send({ status: 'hired' });

      expect(res.status).toBe(404);
      expect(res.body.error).toContain('not found');
    });

    test('should not allow updating email to duplicate', async () => {
      const candidate1 = await db.candidate.create({
        data: {
          name: 'John Doe',
          email: 'john@example.com',
          roleApplied: 'Engineer',
        },
      });

      const candidate2 = await db.candidate.create({
        data: {
          name: 'Jane Smith',
          email: 'jane@example.com',
          roleApplied: 'Manager',
        },
      });

      const res = await request(app)
        .patch(`/api/candidates/${candidate1.id}`)
        .send({ email: 'jane@example.com' });

      expect(res.status).toBe(400);
      expect(res.body.error.toLowerCase()).toContain('email');
    });
  });

  // ==================== DELETE /api/candidates/:id - DELETE TESTS ====================

  describe('DELETE /api/candidates/:id - Delete (soft) candidate', () => {
    test('should soft delete candidate by setting status=rejected', async () => {
      const candidate = await db.candidate.create({
        data: {
          name: 'John Doe',
          email: 'john@example.com',
          roleApplied: 'Engineer',
          status: 'active',
        },
      });

      const res = await request(app).delete(`/api/candidates/${candidate.id}`);
      expect(res.status).toBe(204);

      // Verify candidate still exists but status changed
      const retrieved = await db.candidate.findUnique({
        where: { id: candidate.id },
      });

      expect(retrieved).toBeDefined();
      expect(retrieved.status).toBe('rejected');
    });

    test('should return 404 for non-existent candidate', async () => {
      const res = await request(app).delete('/api/candidates/nonexistent-id');
      expect(res.status).toBe(404);
      expect(res.body.error).toContain('not found');
    });

    test('should not change candidate if already rejected', async () => {
      const candidate = await db.candidate.create({
        data: {
          name: 'John Doe',
          email: 'john@example.com',
          roleApplied: 'Engineer',
          status: 'rejected',
        },
      });

      const res = await request(app).delete(`/api/candidates/${candidate.id}`);
      expect(res.status).toBe(204);

      const retrieved = await db.candidate.findUnique({
        where: { id: candidate.id },
      });

      expect(retrieved.status).toBe('rejected');
    });
  });

  // ==================== EDGE CASES & ERROR HANDLING ====================

  describe('Edge cases and error handling', () => {
    test('should handle empty request body gracefully', async () => {
      const candidate = await db.candidate.create({
        data: {
          name: 'John Doe',
          email: 'john@example.com',
          roleApplied: 'Engineer',
        },
      });

      const res = await request(app)
        .patch(`/api/candidates/${candidate.id}`)
        .send({});

      expect(res.status).toBe(200);
      expect(res.body.name).toBe('John Doe'); // unchanged
    });

    test('should cap pagination limit at 100', async () => {
      for (let i = 0; i < 30; i++) {
        await db.candidate.create({
          data: {
            name: `Candidate ${i}`,
            email: `candidate${i}@example.com`,
            roleApplied: 'Engineer',
          },
        });
      }

      const res = await request(app).get('/api/candidates?limit=500');
      expect(res.status).toBe(200);
      expect(res.body.limit).toBeLessThanOrEqual(100);
    });
  });
});
