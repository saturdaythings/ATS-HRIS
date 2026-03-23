import request from 'supertest';
import express from 'express';
import claudeRouter from '../../routes/claude.js';

/**
 * Tests for Claude API routes
 * Basic validation tests - full integration tests would require Claude API mock
 */

const app = express();
app.use(express.json());
app.use('/api/claude', claudeRouter);

// Error handler middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

describe('Claude Routes', () => {
  describe('POST /api/claude/chat', () => {
    it('should return 400 if content is missing', async () => {
      const res = await request(app)
        .post('/api/claude/chat')
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.error).toBeDefined();
    });
  });

  describe('POST /api/claude/create-field', () => {
    it('should return 400 if featureRequestId is missing', async () => {
      const res = await request(app)
        .post('/api/claude/create-field')
        .send({
          fieldData: {
            name: 'test',
          },
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toBeDefined();
    });

    it('should return 400 if fieldData is missing', async () => {
      const res = await request(app)
        .post('/api/claude/create-field')
        .send({
          featureRequestId: 'req-1',
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toBeDefined();
    });
  });

  describe('PATCH /api/claude/feature-requests/:id/status', () => {
    it('should return 400 if status is missing', async () => {
      const res = await request(app)
        .patch('/api/claude/feature-requests/req-1/status')
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.error).toBeDefined();
    });
  });

  // Route structure tests
  it('should have GET /api/claude/conversations/:id endpoint', async () => {
    const res = await request(app).get('/api/claude/conversations/invalid-id');
    // Should not be 404 (route exists)
    expect(res.status).not.toBe(404);
  });

  it('should have GET /api/claude/feature-requests endpoint', async () => {
    const res = await request(app).get('/api/claude/feature-requests');
    // Should not be 404 (route exists)
    expect(res.status).not.toBe(404);
  });

  it('should have GET /api/claude/feature-requests/:id endpoint', async () => {
    const res = await request(app).get('/api/claude/feature-requests/invalid-id');
    // Should not be 404 (route exists)
    expect(res.status).not.toBe(404);
  });
});
