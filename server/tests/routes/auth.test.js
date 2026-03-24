import request from 'supertest';
import express from 'express';
import session from 'express-session';
import { PrismaClient } from '@prisma/client';
import authRouter from '../../routes/auth.js';
import { errorHandler } from '../../middleware/errorHandler.js';
import bcrypt from 'bcrypt';

/**
 * Tests for Auth Routes
 * Tests login, logout, and session management
 */

const prisma = new PrismaClient();

// Setup app with session and auth routes
const app = express();
app.use(express.json());
app.use(session({
  secret: 'test-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));
app.use('/api/auth', authRouter);
app.use(errorHandler);

describe('Auth Routes', () => {
  let testUserId;
  const testUser = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123'
  };

  beforeAll(async () => {
    // Create a test user
    const hashedPassword = await bcrypt.hash(testUser.password, 10);
    const user = await prisma.user.create({
      data: {
        name: testUser.name,
        email: testUser.email,
        password: hashedPassword,
        role: 'viewer',
        active: true
      }
    });
    testUserId = user.id;
  });

  afterAll(async () => {
    // Clean up test user
    await prisma.user.deleteMany({
      where: { email: { in: [testUser.email] } }
    });
    await prisma.$disconnect();
  });

  describe('POST /api/auth/login', () => {
    it('should return 400 if email is missing', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ password: 'password123' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Email and password required');
    });

    it('should return 400 if password is missing', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: testUser.email });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Email and password required');
    });

    it('should return 401 if email does not exist', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123'
        });

      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Invalid credentials');
    });

    it('should return 401 if password is incorrect', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword'
        });

      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Invalid credentials');
    });

    it('should return 403 if user account is inactive', async () => {
      // Create an inactive user
      const inactiveUser = await prisma.user.create({
        data: {
          name: 'Inactive User',
          email: 'inactive@example.com',
          password: await bcrypt.hash('password123', 10),
          role: 'viewer',
          active: false
        }
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'inactive@example.com',
          password: 'password123'
        });

      expect(res.status).toBe(403);
      expect(res.body.error).toBe('User account is inactive');

      // Clean up
      await prisma.user.delete({ where: { id: inactiveUser.id } });
    });

    it('should login successfully with correct credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Logged in');
      expect(res.body.user).toBeDefined();
      expect(res.body.user.email).toBe(testUser.email);
      expect(res.body.user.role).toBe('viewer');
      expect(res.headers['set-cookie']).toBeDefined();
    });

    it('should set session cookie after login', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });

      expect(res.headers['set-cookie']).toBeDefined();
      expect(res.headers['set-cookie'][0]).toMatch(/connect.sid/);
    });
  });

  describe('GET /api/auth/session', () => {
    it('should return 401 if not authenticated', async () => {
      const res = await request(app)
        .get('/api/auth/session');

      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Not authenticated');
    });

    it('should return user info when authenticated', async () => {
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });

      const cookie = loginRes.headers['set-cookie'];

      const sessionRes = await request(app)
        .get('/api/auth/session')
        .set('Cookie', cookie);

      expect(sessionRes.status).toBe(200);
      expect(sessionRes.body.user).toBeDefined();
      expect(sessionRes.body.user.email).toBe(testUser.email);
      expect(sessionRes.body.user.name).toBe(testUser.name);
      expect(sessionRes.body.user.role).toBe('viewer');
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout successfully', async () => {
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });

      const cookie = loginRes.headers['set-cookie'];

      const logoutRes = await request(app)
        .post('/api/auth/logout')
        .set('Cookie', cookie);

      expect(logoutRes.status).toBe(200);
      expect(logoutRes.body.message).toBe('Logged out');
    });

    it('should prevent access to protected routes after logout', async () => {
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });

      const cookie = loginRes.headers['set-cookie'];

      // Logout
      await request(app)
        .post('/api/auth/logout')
        .set('Cookie', cookie);

      // Try to access protected route
      const sessionRes = await request(app)
        .get('/api/auth/session')
        .set('Cookie', cookie);

      expect(sessionRes.status).toBe(401);
      expect(sessionRes.body.error).toBe('Not authenticated');
    });
  });

  describe('Admin role verification', () => {
    let adminUserId;

    beforeAll(async () => {
      const admin = await prisma.user.create({
        data: {
          name: 'Admin User',
          email: 'admin-test@example.com',
          password: await bcrypt.hash('adminpass', 10),
          role: 'admin',
          active: true
        }
      });
      adminUserId = admin.id;
    });

    afterAll(async () => {
      await prisma.user.delete({ where: { id: adminUserId } });
    });

    it('should allow admin login', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin-test@example.com',
          password: 'adminpass'
        });

      expect(res.status).toBe(200);
      expect(res.body.user.role).toBe('admin');
    });
  });
});
