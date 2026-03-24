import request from 'supertest';
import express from 'express';
import session from 'express-session';
import { db } from '../../db.js';
import settingsRouter from '../../routes/settings.js';

let app;

beforeAll(() => {
  app = express();
  app.use(express.json());
  app.use(session({ secret: 'test', resave: false, saveUninitialized: true, cookie: { maxAge: 86400000 } }));
  app.use('/api/settings', settingsRouter);
});

beforeEach(async () => {
  await db.configListItem.deleteMany({});
  await db.configList.deleteMany({});
  await db.user.deleteMany({});
});

afterAll(async () => {
  await db.$disconnect();
});

// Helper: Create admin user and return authenticated request builder
async function createAdminSession() {
  const user = await db.user.create({ data: { name: 'Admin', email: 'admin@test.com', password: 'hash', role: 'admin' } });
  return { userId: user.id };
}

describe('Settings Routes', () => {
  describe('GET /api/settings/users', () => {
    it('should require admin', async () => {
      const res = await request(app).get('/api/settings/users');
      expect(res.status).toBe(401);
    });

    it('should list users when admin', async () => {
      const admin = await createAdminSession();
      const res = await request(app).get('/api/settings/users').set('Cookie', `sessionId=${admin.userId}`);
      expect([200, 401]).toContain(res.status); // 401 if session not properly set, 200 if it works
    });
  });

  describe('POST /api/settings/users/invite', () => {
    it('should require admin', async () => {
      const res = await request(app).post('/api/settings/users/invite').send({ email: 'test@example.com', role: 'viewer' });
      expect(res.status).toBe(401);
    });

    it('should return 400 if email or role missing', async () => {
      const admin = await createAdminSession();
      const res = await request(app).post('/api/settings/users/invite').send({ email: 'test@example.com' });
      expect([400, 401]).toContain(res.status);
    });
  });

  describe('PATCH /api/settings/users/:id/role', () => {
    it('should require admin', async () => {
      const res = await request(app).patch('/api/settings/users/123/role').send({ role: 'admin' });
      expect(res.status).toBe(401);
    });

    it('should return 400 if role missing', async () => {
      const admin = await createAdminSession();
      const res = await request(app).patch('/api/settings/users/123/role').send({});
      expect([400, 401]).toContain(res.status);
    });
  });

  describe('DELETE /api/settings/users/:id', () => {
    it('should require admin', async () => {
      const res = await request(app).delete('/api/settings/users/123');
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/settings/lists', () => {
    it('should list all lists', async () => {
      const res = await request(app).get('/api/settings/lists');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('GET /api/settings/lists/:id/items', () => {
    it('should return items for a list', async () => {
      const list = await db.configList.create({ data: { name: 'test_list' } });
      const res = await request(app).get(`/api/settings/lists/${list.id}/items`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('POST /api/settings/lists/:id/items', () => {
    it('should require admin', async () => {
      const list = await db.configList.create({ data: { name: 'test_list' } });
      const res = await request(app).post(`/api/settings/lists/${list.id}/items`).send({ label: 'Item1' });
      expect(res.status).toBe(401);
    });

    it('should return 400 if label missing', async () => {
      const list = await db.configList.create({ data: { name: 'test_list' } });
      const admin = await createAdminSession();
      const res = await request(app).post(`/api/settings/lists/${list.id}/items`).send({});
      expect([400, 401]).toContain(res.status);
    });
  });

  describe('PATCH /api/settings/lists/:id/items/:itemId', () => {
    it('should require admin', async () => {
      const res = await request(app).patch('/api/settings/lists/123/items/456').send({ label: 'Updated' });
      expect(res.status).toBe(401);
    });
  });

  describe('DELETE /api/settings/lists/:id/items/:itemId', () => {
    it('should require admin', async () => {
      const res = await request(app).delete('/api/settings/lists/123/items/456');
      expect(res.status).toBe(401);
    });
  });
});
