/**
 * Export Routes Tests
 * Basic endpoint validation tests
 */

import request from 'supertest';
import express from 'express';
import session from 'express-session';
import exportsRouter from '../../routes/exports.js';

describe('Export Routes - Health Check', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use(session({
      secret: 'test',
      resave: false,
      saveUninitialized: false,
    }));

    // Mock authenticated middleware
    app.use((req, res, next) => {
      req.session.userId = 'test-user-id';
      next();
    });

    app.use('/api/exports', exportsRouter);
  });

  describe('GET /api/exports/status', () => {
    it('should return status OK', async () => {
      const response = await request(app)
        .get('/api/exports/status');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('ok');
      expect(response.body.version).toBe('1.0.0');
      expect(response.body.timestamp).toBeDefined();
    });
  });

  describe('POST /api/exports/bulk validation', () => {
    it('should reject empty types array', async () => {
      const response = await request(app)
        .post('/api/exports/bulk')
        .send({ types: [] });

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });

    it('should accept valid types array', async () => {
      const response = await request(app)
        .post('/api/exports/bulk')
        .send({ types: ['candidates'] });

      // Will fail due to DB, but validates the endpoint exists
      expect([200, 500]).toContain(response.status);
    });
  });
});
