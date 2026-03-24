import request from 'supertest';
import express from 'express';
import { PrismaClient } from '@prisma/client';
import dashboardRouter from '../../routes/dashboard.js';
import { errorHandler } from '../../middleware/errorHandler.js';

const prisma = new PrismaClient();

const app = express();
app.use(express.json());
app.use('/api/dashboard', dashboardRouter);
app.use(errorHandler);

describe('Dashboard Routes', () => {
  let testEmployee;
  let testCandidate;
  let testOffer;
  let testDevice;
  let testDeviceAssignment;
  let testOnboardingRun;
  let testTrack;

  beforeAll(async () => {
    // Create test data
    const testClient = await prisma.client.create({
      data: { name: 'Dashboard Test Client' }
    });

    testEmployee = await prisma.employee.create({
      data: {
        name: 'Test Employee',
        email: 'test-emp@example.com',
        title: 'Engineer',
        department: 'Engineering',
        status: 'active',
        startDate: new Date('2026-01-15'),
        clientId: testClient.id,
      }
    });

    testCandidate = await prisma.candidate.create({
      data: {
        name: 'Test Candidate',
        email: 'candidate@example.com',
        roleApplied: 'Senior Engineer',
        stage: 'interview',
        status: 'active',
        clientId: testClient.id,
      }
    });

    testOffer = await prisma.offer.create({
      data: {
        candidateId: testCandidate.id,
        role: 'Senior Engineer',
        compensation: '$150k - $180k',
        startDate: new Date('2026-04-01'),
        status: 'pending',
      }
    });

    testDevice = await prisma.device.create({
      data: {
        serial: 'TEST-DEVICE-001',
        type: 'laptop',
        make: 'Apple',
        model: 'MacBook Pro',
        condition: 'good',
        status: 'assigned',
      }
    });

    testDeviceAssignment = await prisma.deviceAssignment.create({
      data: {
        deviceId: testDevice.id,
        employeeId: testEmployee.id,
        assignedDate: new Date('2026-02-01'),
      }
    });

    testTrack = await prisma.trackTemplate.create({
      data: {
        name: 'Onboarding',
        type: 'company',
        autoApply: true,
        tasks: {
          create: [
            {
              name: 'Setup laptop',
              ownerRole: 'ops',
              dueDaysOffset: 0,
              order: 1,
            },
            {
              name: 'Complete training',
              ownerRole: 'pm',
              dueDaysOffset: 7,
              order: 2,
            }
          ]
        }
      }
    });

    testOnboardingRun = await prisma.onboardingRun.create({
      data: {
        employeeId: testEmployee.id,
        trackId: testTrack.id,
        type: 'onboarding',
        status: 'in_progress',
      }
    });
  });

  afterAll(async () => {
    // Cleanup
    await prisma.deviceAssignment.deleteMany({});
    await prisma.device.deleteMany({});
    await prisma.offer.deleteMany({});
    await prisma.onboardingRun.deleteMany({});
    await prisma.taskTemplate.deleteMany({});
    await prisma.trackTemplate.deleteMany({});
    await prisma.candidate.deleteMany({});
    await prisma.employee.deleteMany({});
    await prisma.client.deleteMany({});
    await prisma.$disconnect();
  });

  describe('GET /api/dashboard/metrics', () => {
    it('should return dashboard metrics', async () => {
      const res = await request(app)
        .get('/api/dashboard/metrics')
        .expect(200);

      expect(res.body).toBeDefined();
      expect(res.body.data).toBeDefined();
      expect(res.body.data.openPositions).toBeDefined();
      expect(res.body.data.candidatesInPipeline).toBeDefined();
      expect(res.body.data.onboardingInProgress).toBeDefined();
      expect(res.body.data.deviceAssignments).toBeDefined();
    });

    it('should count open candidates correctly', async () => {
      const res = await request(app)
        .get('/api/dashboard/metrics')
        .expect(200);

      expect(res.body.data.candidatesInPipeline).toBeGreaterThanOrEqual(1);
    });

    it('should count onboarding runs in progress', async () => {
      const res = await request(app)
        .get('/api/dashboard/metrics')
        .expect(200);

      expect(res.body.data.onboardingInProgress).toBeGreaterThanOrEqual(1);
    });

    it('should count device assignments', async () => {
      const res = await request(app)
        .get('/api/dashboard/metrics')
        .expect(200);

      expect(res.body.data.deviceAssignments).toBeGreaterThanOrEqual(1);
    });
  });

  describe('GET /api/dashboard/activity-feed', () => {
    it('should return activity feed with defaults', async () => {
      const res = await request(app)
        .get('/api/dashboard/activity-feed')
        .expect(200);

      expect(res.body).toBeDefined();
      expect(res.body.activities).toBeDefined();
      expect(Array.isArray(res.body.activities)).toBe(true);
      expect(res.body.limit).toBeDefined();
      expect(res.body.offset).toBeDefined();
    });

    it('should support pagination', async () => {
      const res = await request(app)
        .get('/api/dashboard/activity-feed?limit=5&offset=0')
        .expect(200);

      expect(res.body.limit).toBe(5);
      expect(res.body.offset).toBe(0);
    });

    it('should support type filtering', async () => {
      const res = await request(app)
        .get('/api/dashboard/activity-feed?type=onboarding')
        .expect(200);

      expect(res.body).toBeDefined();
      expect(Array.isArray(res.body.activities)).toBe(true);
    });
  });

  describe('POST /api/dashboard/log-activity', () => {
    it('should create an activity log entry', async () => {
      const res = await request(app)
        .post('/api/dashboard/log-activity')
        .send({
          type: 'hire',
          description: 'Offer accepted for Test Candidate',
          candidateId: testCandidate.id,
          employeeId: testEmployee.id,
        })
        .expect(201);

      expect(res.body).toBeDefined();
      expect(res.body.data).toBeDefined();
      expect(res.body.data.type).toBe('hire');
    });

    it('should require type and description', async () => {
      const res = await request(app)
        .post('/api/dashboard/log-activity')
        .send({
          type: 'hire',
          // missing description
        })
        .expect(400);

      expect(res.body.error).toBeDefined();
    });

    it('should support different activity types', async () => {
      const types = ['hire', 'onboarding', 'device', 'task', 'promotion'];

      for (const type of types) {
        const res = await request(app)
          .post('/api/dashboard/log-activity')
          .send({
            type,
            description: `Test ${type} activity`,
          })
          .expect(201);

        expect(res.body.data.type).toBe(type);
      }
    });
  });

  describe('GET /api/dashboard/widgets/candidate-stage', () => {
    it('should return candidate stage distribution', async () => {
      const res = await request(app)
        .get('/api/dashboard/widgets/candidate-stage')
        .expect(200);

      expect(res.body).toBeDefined();
      expect(res.body.data).toBeDefined();
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should include stage counts', async () => {
      const res = await request(app)
        .get('/api/dashboard/widgets/candidate-stage')
        .expect(200);

      const stageData = res.body.data;
      if (stageData.length > 0) {
        expect(stageData[0]).toHaveProperty('stage');
        expect(stageData[0]).toHaveProperty('count');
      }
    });
  });

  describe('GET /api/dashboard/widgets/onboarding-progress', () => {
    it('should return onboarding runs', async () => {
      const res = await request(app)
        .get('/api/dashboard/widgets/onboarding-progress')
        .expect(200);

      expect(res.body).toBeDefined();
      expect(res.body.data).toBeDefined();
    });

    it('should include in-progress runs', async () => {
      const res = await request(app)
        .get('/api/dashboard/widgets/onboarding-progress')
        .expect(200);

      expect(res.body.data.inProgress).toBeDefined();
      expect(res.body.data.inProgress).toBeGreaterThanOrEqual(1);
    });
  });

  describe('GET /api/dashboard/widgets/device-inventory', () => {
    it('should return device inventory stats', async () => {
      const res = await request(app)
        .get('/api/dashboard/widgets/device-inventory')
        .expect(200);

      expect(res.body).toBeDefined();
      expect(res.body.data).toBeDefined();
      expect(res.body.data.total).toBeDefined();
      expect(res.body.data.available).toBeDefined();
      expect(res.body.data.assigned).toBeDefined();
    });
  });

  describe('GET /api/dashboard/widgets/team-activity', () => {
    it('should return team activity summary', async () => {
      const res = await request(app)
        .get('/api/dashboard/widgets/team-activity')
        .expect(200);

      expect(res.body).toBeDefined();
      expect(res.body.data).toBeDefined();
      expect(res.body.data.recentActions).toBeDefined();
    });
  });
});
