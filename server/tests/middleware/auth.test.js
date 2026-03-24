import { hashPassword, verifyPassword } from '../../middleware/auth.js';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

/**
 * Tests for Auth Middleware Functions
 */

const prisma = new PrismaClient();

describe('Auth Middleware', () => {
  let adminUser;

  beforeAll(async () => {
    // Create test user
    adminUser = await prisma.user.create({
      data: {
        name: 'Admin',
        email: 'middleware-admin@example.com',
        password: await bcrypt.hash('adminpass', 10),
        role: 'admin',
        active: true
      }
    });
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: {
        email: 'middleware-admin@example.com'
      }
    });
    await prisma.$disconnect();
  });

  describe('hashPassword', () => {
    it('should hash password correctly', async () => {
      const password = 'mypassword123';
      const hash = await hashPassword(password);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(20); // bcrypt hashes are long
    });

    it('should produce different hashes for the same password', async () => {
      const password = 'mypassword123';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);

      expect(hash1).not.toBe(hash2); // bcrypt includes salt
    });
  });

  describe('verifyPassword', () => {
    it('should verify correct password', async () => {
      const password = 'correctpassword';
      const hash = await hashPassword(password);

      const isValid = await verifyPassword(password, hash);
      expect(isValid).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const password = 'correctpassword';
      const hash = await hashPassword(password);

      const isValid = await verifyPassword('wrongpassword', hash);
      expect(isValid).toBe(false);
    });

    it('should verify real user passwords from database', async () => {
      const isValid = await verifyPassword('adminpass', adminUser.password);
      expect(isValid).toBe(true);

      const isInvalid = await verifyPassword('wrongpass', adminUser.password);
      expect(isInvalid).toBe(false);
    });
  });
});
