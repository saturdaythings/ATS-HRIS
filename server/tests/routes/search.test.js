/**
 * Search Routes Tests
 * Basic endpoint validation tests
 */

import request from 'supertest';
import express from 'express';
import session from 'express-session';
import searchRouter from '../../routes/search.js';

describe('Search Routes - Health Check', () => {
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

    app.use('/api/search', searchRouter);
  });

  describe('GET /api/search - Validation', () => {
    it('should require search query parameter', async () => {
      const response = await request(app)
        .get('/api/search');

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });

    it('should reject empty query', async () => {
      const response = await request(app)
        .get('/api/search')
        .query({ q: '' });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/search/suggestions', () => {
    it('should require minimum prefix length', async () => {
      const response = await request(app)
        .get('/api/search/suggestions')
        .query({ prefix: 'a' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('GET /api/search/status', () => {
    it('should return status OK', async () => {
      const response = await request(app)
        .get('/api/search/status');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('ok');
      expect(response.body.version).toBe('1.0.0');
    });
  });
});
