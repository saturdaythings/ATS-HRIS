import request from 'supertest';
import express from 'express';
import { db } from '../../db.js';
import candidatesRouter from '../../routes/candidates.js';
import offersRouter from '../../routes/offers.js';

/**
 * Comprehensive tests for Stage Progression and Offer Management (TASK 4.1-4.2)
 *
 * Task 4.1: Stage Progression
 * - PATCH /api/candidates/:id (update stage field)
 * - Update latestStageChangeAt timestamp on stage change
 * - Validation: Only move forward (applied→screening→interview→offer→closed), or to rejected
 * - Prevent moving backward except to rejected
 *
 * Task 4.2: Offer Management
 * - POST /api/offers (create: candidateId, role, compensation, startDate)
 * - PATCH /api/offers/:id (update status: pending/accepted/declined/expired)
 * - GET /api/candidates/:id/offers (list all offers)
 * - Offer lifecycle tracking (sentAt, expiresAt dates)
 */

describe('Stage Progression & Offer Management (TASK 4.1-4.2)', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/candidates', candidatesRouter);
    app.use('/api/offers', offersRouter);
    app.use((err, req, res, next) => {
      console.error('[Test Error]', err.message);
      res.status(err.status || 500).json({
        error: err.message || 'Internal server error',
      });
    });
  });

  beforeEach(async () => {
    // Clean up database before each test
    await db.offer.deleteMany({});
    await db.candidate.deleteMany({});
    await db.client.deleteMany({});
  });

  afterAll(async () => {
    await db.$disconnect();
  });

  // ==================== HELPER FUNCTIONS ====================

  async function createTestCandidate(overrides = {}) {
    return db.candidate.create({
      data: {
        name: 'Test Candidate',
        email: `test-${Math.random().toString(36).substr(2, 9)}@example.com`,
        roleApplied: 'Engineer',
        status: 'active',
        stage: 'applied',
        ...overrides,
      },
    });
  }

  // ==================== TASK 4.1: STAGE PROGRESSION ====================

  describe('TASK 4.1: Stage Progression - PATCH /api/candidates/:id', () => {
    test('should update stage from applied to screening', async () => {
      const candidate = await createTestCandidate({ stage: 'applied' });

      const res = await request(app)
        .patch(`/api/candidates/${candidate.id}`)
        .send({ stage: 'screening' });

      expect(res.status).toBe(200);
      expect(res.body.stage).toBe('screening');
      expect(res.body.latestStageChangeAt).toBeTruthy();
      expect(new Date(res.body.latestStageChangeAt) instanceof Date).toBe(true);
    });

    test('should update stage through pipeline: applied → screening → interview → offer → closed', async () => {
      const candidate = await createTestCandidate({ stage: 'applied' });
      const stages = ['screening', 'interview', 'offer', 'closed'];

      for (const stage of stages) {
        const res = await request(app)
          .patch(`/api/candidates/${candidate.id}`)
          .send({ stage });

        expect(res.status).toBe(200);
        expect(res.body.stage).toBe(stage);
        expect(res.body.latestStageChangeAt).toBeTruthy();
      }
    });

    test('should update latestStageChangeAt when stage changes', async () => {
      const candidate = await createTestCandidate({ stage: 'applied' });

      const res1 = await request(app)
        .patch(`/api/candidates/${candidate.id}`)
        .send({ stage: 'screening' });

      expect(res1.body.latestStageChangeAt).toBeTruthy();
      const firstChangeTime = new Date(res1.body.latestStageChangeAt);

      // Wait a bit
      await new Promise(resolve => setTimeout(resolve, 10));

      const res2 = await request(app)
        .patch(`/api/candidates/${candidate.id}`)
        .send({ stage: 'interview' });

      const secondChangeTime = new Date(res2.body.latestStageChangeAt);
      expect(secondChangeTime.getTime()).toBeGreaterThanOrEqual(firstChangeTime.getTime());
    });

    test('should prevent moving backward in pipeline (applied → applied is no-op)', async () => {
      const candidate = await createTestCandidate({ stage: 'screening' });

      // Try to move back to applied (should be rejected)
      const res = await request(app)
        .patch(`/api/candidates/${candidate.id}`)
        .send({ stage: 'applied' });

      // Should either reject or stay in current stage
      // Implementation decides: for now, allow with validation error or reject
      // Check if status indicates an error or if it allowed it
      if (res.status === 400) {
        expect(res.body.error).toBeTruthy();
      } else {
        // If allowed, verify the stage didn't change (or changed to a valid state)
        expect(res.body.stage).not.toBe('applied');
      }
    });

    test('should allow moving to rejected from any stage', async () => {
      const stages = ['applied', 'screening', 'interview', 'offer', 'closed'];

      for (const stage of stages) {
        const candidate = await createTestCandidate({ stage });

        const res = await request(app)
          .patch(`/api/candidates/${candidate.id}`)
          .send({ stage: 'rejected' });

        expect(res.status).toBe(200);
        expect(res.body.stage).toBe('rejected');
      }
    });

    test('should return 404 if candidate not found', async () => {
      const res = await request(app)
        .patch('/api/candidates/non-existent-id')
        .send({ stage: 'screening' });

      expect(res.status).toBe(404);
      expect(res.body.error).toBeTruthy();
    });

    test('should not update other fields when stage is updated', async () => {
      const candidate = await createTestCandidate({
        stage: 'applied',
        phone: '555-1234',
      });

      const res = await request(app)
        .patch(`/api/candidates/${candidate.id}`)
        .send({ stage: 'screening' });

      expect(res.status).toBe(200);
      expect(res.body.phone).toBe('555-1234'); // Should remain unchanged
      expect(res.body.stage).toBe('screening');
    });
  });

  // ==================== TASK 4.2: OFFER MANAGEMENT ====================

  describe('TASK 4.2: Offer Management - POST /api/offers', () => {
    test('should create a new offer with required fields', async () => {
      const candidate = await createTestCandidate();

      const res = await request(app)
        .post('/api/offers')
        .send({
          candidateId: candidate.id,
          role: 'Senior Engineer',
          compensation: '$150,000 - $180,000',
          startDate: '2026-04-01',
        });

      expect(res.status).toBe(201);
      expect(res.body.id).toBeTruthy();
      expect(res.body.candidateId).toBe(candidate.id);
      expect(res.body.role).toBe('Senior Engineer');
      expect(res.body.compensation).toBe('$150,000 - $180,000');
      expect(res.body.status).toBe('pending');
      expect(res.body.createdAt).toBeTruthy();
    });

    test('should create offer with optional sentAt and expiresAt dates', async () => {
      const candidate = await createTestCandidate();
      const sentAt = new Date();
      const expiresAt = new Date(sentAt.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days later

      const res = await request(app)
        .post('/api/offers')
        .send({
          candidateId: candidate.id,
          role: 'Product Manager',
          compensation: '$120,000',
          startDate: '2026-04-15',
          sentAt: sentAt.toISOString(),
          expiresAt: expiresAt.toISOString(),
        });

      expect(res.status).toBe(201);
      expect(res.body.sentAt).toBeTruthy();
      expect(res.body.expiresAt).toBeTruthy();
    });

    test('should return 400 if candidateId is missing', async () => {
      const res = await request(app)
        .post('/api/offers')
        .send({
          role: 'Engineer',
          compensation: '$100,000',
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toBeTruthy();
    });

    test('should return 404 if candidate not found', async () => {
      const res = await request(app)
        .post('/api/offers')
        .send({
          candidateId: 'non-existent-id',
          role: 'Engineer',
          compensation: '$100,000',
        });

      expect(res.status).toBe(404);
      expect(res.body.error).toBeTruthy();
    });

    test('should create offer with minimal fields (only candidateId and role)', async () => {
      const candidate = await createTestCandidate();

      const res = await request(app)
        .post('/api/offers')
        .send({
          candidateId: candidate.id,
          role: 'Engineer',
        });

      expect(res.status).toBe(201);
      expect(res.body.candidateId).toBe(candidate.id);
      expect(res.body.role).toBe('Engineer');
      expect(res.body.status).toBe('pending');
      expect(res.body.compensation).toBeNull();
      expect(res.body.startDate).toBeNull();
    });
  });

  describe('TASK 4.2: Offer Management - PATCH /api/offers/:id', () => {
    test('should update offer status from pending to accepted', async () => {
      const candidate = await createTestCandidate();
      const offer = await db.offer.create({
        data: {
          candidateId: candidate.id,
          role: 'Engineer',
          status: 'pending',
        },
      });

      const res = await request(app)
        .patch(`/api/offers/${offer.id}`)
        .send({ status: 'accepted' });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('accepted');
      expect(res.body.id).toBe(offer.id);
    });

    test('should update offer status to all valid statuses: pending, accepted, declined, expired', async () => {
      const candidate = await createTestCandidate();
      const offer = await db.offer.create({
        data: {
          candidateId: candidate.id,
          role: 'Engineer',
          status: 'pending',
        },
      });

      const statuses = ['accepted', 'declined', 'expired', 'pending'];

      for (const status of statuses) {
        const res = await request(app)
          .patch(`/api/offers/${offer.id}`)
          .send({ status });

        expect(res.status).toBe(200);
        expect(res.body.status).toBe(status);
      }
    });

    test('should update offer compensation', async () => {
      const candidate = await createTestCandidate();
      const offer = await db.offer.create({
        data: {
          candidateId: candidate.id,
          role: 'Engineer',
          compensation: '$100,000',
        },
      });

      const res = await request(app)
        .patch(`/api/offers/${offer.id}`)
        .send({ compensation: '$120,000' });

      expect(res.status).toBe(200);
      expect(res.body.compensation).toBe('$120,000');
    });

    test('should update offer startDate', async () => {
      const candidate = await createTestCandidate();
      const offer = await db.offer.create({
        data: {
          candidateId: candidate.id,
          role: 'Engineer',
          startDate: new Date('2026-04-01'),
        },
      });

      const res = await request(app)
        .patch(`/api/offers/${offer.id}`)
        .send({ startDate: '2026-05-01' });

      expect(res.status).toBe(200);
      expect(new Date(res.body.startDate).toISOString().split('T')[0]).toBe('2026-05-01');
    });

    test('should update multiple offer fields at once', async () => {
      const candidate = await createTestCandidate();
      const offer = await db.offer.create({
        data: {
          candidateId: candidate.id,
          role: 'Engineer',
          status: 'pending',
        },
      });

      const res = await request(app)
        .patch(`/api/offers/${offer.id}`)
        .send({
          status: 'accepted',
          compensation: '$150,000',
          startDate: '2026-05-01',
        });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('accepted');
      expect(res.body.compensation).toBe('$150,000');
    });

    test('should return 404 if offer not found', async () => {
      const res = await request(app)
        .patch('/api/offers/non-existent-id')
        .send({ status: 'accepted' });

      expect(res.status).toBe(404);
      expect(res.body.error).toBeTruthy();
    });

    test('should update sentAt and expiresAt dates', async () => {
      const candidate = await createTestCandidate();
      const offer = await db.offer.create({
        data: {
          candidateId: candidate.id,
          role: 'Engineer',
        },
      });

      const sentAt = new Date();
      const expiresAt = new Date(sentAt.getTime() + 7 * 24 * 60 * 60 * 1000);

      const res = await request(app)
        .patch(`/api/offers/${offer.id}`)
        .send({
          sentAt: sentAt.toISOString(),
          expiresAt: expiresAt.toISOString(),
        });

      expect(res.status).toBe(200);
      expect(res.body.sentAt).toBeTruthy();
      expect(res.body.expiresAt).toBeTruthy();
    });
  });

  describe('TASK 4.2: Offer Management - GET /api/candidates/:id/offers', () => {
    test('should return empty array when candidate has no offers', async () => {
      const candidate = await createTestCandidate();

      const res = await request(app)
        .get(`/api/candidates/${candidate.id}/offers`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });

    test('should return all offers for a candidate', async () => {
      const candidate = await createTestCandidate();

      await db.offer.create({
        data: {
          candidateId: candidate.id,
          role: 'Engineer',
          status: 'pending',
        },
      });

      await db.offer.create({
        data: {
          candidateId: candidate.id,
          role: 'Senior Engineer',
          status: 'accepted',
        },
      });

      const res = await request(app)
        .get(`/api/candidates/${candidate.id}/offers`);

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
      expect(res.body[0].role).toBeTruthy();
      expect(res.body[1].role).toBeTruthy();
    });

    test('should return offers sorted by createdAt descending (newest first)', async () => {
      const candidate = await createTestCandidate();

      const offer1 = await db.offer.create({
        data: {
          candidateId: candidate.id,
          role: 'Engineer',
        },
      });

      await new Promise(resolve => setTimeout(resolve, 10));

      const offer2 = await db.offer.create({
        data: {
          candidateId: candidate.id,
          role: 'Senior Engineer',
        },
      });

      const res = await request(app)
        .get(`/api/candidates/${candidate.id}/offers`);

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
      expect(res.body[0].id).toBe(offer2.id); // Newer offer first
      expect(res.body[1].id).toBe(offer1.id);
    });

    test('should return 404 if candidate not found', async () => {
      const res = await request(app)
        .get('/api/candidates/non-existent-id/offers');

      expect(res.status).toBe(404);
      expect(res.body.error).toBeTruthy();
    });

    test('should only return offers for the specified candidate', async () => {
      const candidate1 = await createTestCandidate();
      const candidate2 = await createTestCandidate();

      await db.offer.create({
        data: {
          candidateId: candidate1.id,
          role: 'Engineer',
        },
      });

      await db.offer.create({
        data: {
          candidateId: candidate2.id,
          role: 'Manager',
        },
      });

      const res = await request(app)
        .get(`/api/candidates/${candidate1.id}/offers`);

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0].candidateId).toBe(candidate1.id);
    });
  });

  // ==================== INTEGRATION TESTS ====================

  describe('Integration Tests: Stage Progression + Offer Management', () => {
    test('should create offer when candidate moves to offer stage', async () => {
      const candidate = await createTestCandidate({ stage: 'interview' });

      // Move candidate to offer stage
      const stageRes = await request(app)
        .patch(`/api/candidates/${candidate.id}`)
        .send({ stage: 'offer' });

      expect(stageRes.status).toBe(200);
      expect(stageRes.body.stage).toBe('offer');

      // Create offer for the candidate
      const offerRes = await request(app)
        .post('/api/offers')
        .send({
          candidateId: candidate.id,
          role: 'Senior Engineer',
          compensation: '$150,000',
        });

      expect(offerRes.status).toBe(201);

      // Get offers for candidate
      const offersRes = await request(app)
        .get(`/api/candidates/${candidate.id}/offers`);

      expect(offersRes.status).toBe(200);
      expect(offersRes.body.length).toBe(1);
    });

    test('should handle candidate lifecycle: applied → screening → interview → offer → closed', async () => {
      const candidate = await createTestCandidate();
      const stages = ['screening', 'interview', 'offer', 'closed'];

      for (const stage of stages) {
        const res = await request(app)
          .patch(`/api/candidates/${candidate.id}`)
          .send({ stage });

        expect(res.status).toBe(200);
        expect(res.body.stage).toBe(stage);

        if (stage === 'offer') {
          // Create an offer when in offer stage
          const offerRes = await request(app)
            .post('/api/offers')
            .send({
              candidateId: candidate.id,
              role: 'Engineer',
              compensation: '$100,000',
            });

          expect(offerRes.status).toBe(201);
        }
      }

      // Verify final state
      const offersRes = await request(app)
        .get(`/api/candidates/${candidate.id}/offers`);

      expect(offersRes.status).toBe(200);
      expect(offersRes.body.length).toBe(1);
    });
  });
});
