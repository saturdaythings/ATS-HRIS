import request from 'supertest';
import express from 'express';
import { db } from '../../db.js';
import candidatesRouter from '../../routes/candidates.js';
import multer from 'multer';
import { Readable } from 'stream';

/**
 * Resume API Tests
 * Tests for resume upload, versioning, and management endpoints
 */

describe('Resume API Endpoints', () => {
  let app;
  let testCandidateId;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/candidates', candidatesRouter);

    // Error handler - handles multer and other errors
    app.use((err, req, res, next) => {
      // Handle multer errors
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res
          .status(400)
          .json({
            error: `File size exceeds maximum limit (${(err.limit / 1024 / 1024).toFixed(1)}MB).`,
          });
      }

      if (err.code === 'LIMIT_PART_COUNT') {
        return res
          .status(400)
          .json({ error: 'Too many parts in the request.' });
      }

      if (
        err.message &&
        (err.message.includes('file type') ||
          err.message.includes('Invalid file'))
      ) {
        return res.status(400).json({ error: err.message });
      }

      // Default error response
      res.status(500).json({ error: err.message || 'Server error' });
    });
  });

  describe('Setup: Create test candidate', () => {
    it('should create a candidate for resume tests', async () => {
      const timestamp = Date.now();
      const res = await request(app)
        .post('/api/candidates')
        .send({
          name: 'John Doe',
          email: `john${timestamp}@example.com`,
          phone: '555-1234',
          location: 'San Francisco, CA',
          roleApplied: 'Software Engineer',
          stage: 'applied',
          status: 'active',
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.name).toBe('John Doe');
      testCandidateId = res.body.id;
    });
  });

  describe('POST /api/candidates/:id/resumes - Upload Resume', () => {
    beforeEach(async () => {
      // Ensure we have a candidate
      if (!testCandidateId) {
        const timestamp = Date.now();
        const res = await request(app)
          .post('/api/candidates')
          .send({
            name: 'Jane Smith',
            email: `jane${timestamp}@example.com`,
            phone: '555-5678',
            location: 'New York, NY',
            roleApplied: 'Product Manager',
            stage: 'screening',
            status: 'active',
          });
        testCandidateId = res.body.id;
      }
    });

    it('should upload a resume with version = 1 and isActive = true', async () => {
      const fileBuffer = Buffer.from('PDF content for resume v1', 'utf-8');

      const res = await request(app)
        .post(`/api/candidates/${testCandidateId}/resumes`)
        .field('fileName', 'resume_v1.pdf')
        .attach('file', fileBuffer, 'resume_v1.pdf');

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.candidateId).toBe(testCandidateId);
      expect(res.body.version).toBe(1);
      expect(res.body.isActive).toBe(true);
      expect(res.body.fileUrl).toBeDefined();
      expect(res.body.uploadedAt).toBeDefined();
    });

    it('should return 400 if file is missing', async () => {
      const res = await request(app)
        .post(`/api/candidates/${testCandidateId}/resumes`)
        .field('fileName', 'resume.pdf');

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('File is required');
    });

    it('should return 404 if candidate does not exist', async () => {
      const fileBuffer = Buffer.from('PDF content', 'utf-8');

      const res = await request(app)
        .post('/api/candidates/nonexistent/resumes')
        .field('fileName', 'resume.pdf')
        .attach('file', fileBuffer, 'resume.pdf');

      expect(res.status).toBe(404);
      expect(res.body.error).toContain('Candidate not found');
    });

    it('should auto-increment version on subsequent uploads', async () => {
      // Create a new candidate for this test
      const timestamp = Date.now();
      const newCandidateRes = await request(app)
        .post('/api/candidates')
        .send({
          name: 'Version Test Candidate',
          email: `versiontest${timestamp}@example.com`,
          phone: '555-3333',
          location: 'Austin, TX',
          roleApplied: 'Backend Engineer',
          stage: 'applied',
          status: 'active',
        });

      const candidateId = newCandidateRes.body.id;
      const fileBuffer1 = Buffer.from('PDF content v1', 'utf-8');
      const fileBuffer2 = Buffer.from('PDF content v2', 'utf-8');

      // Upload first resume
      const res1 = await request(app)
        .post(`/api/candidates/${candidateId}/resumes`)
        .field('fileName', 'resume_v1.pdf')
        .attach('file', fileBuffer1, 'resume_v1.pdf');

      expect(res1.status).toBe(201);
      const resumeId1 = res1.body.id;
      expect(res1.body.version).toBe(1);

      // Upload second resume
      const res2 = await request(app)
        .post(`/api/candidates/${candidateId}/resumes`)
        .field('fileName', 'resume_v2.pdf')
        .attach('file', fileBuffer2, 'resume_v2.pdf');

      expect(res2.status).toBe(201);
      expect(res2.body.version).toBe(2);
      expect(res2.body.isActive).toBe(true);
      expect(res2.body.id).not.toBe(resumeId1);
    });

    it('should reject invalid file types', async () => {
      const fileBuffer = Buffer.from('text content', 'utf-8');

      const res = await request(app)
        .post(`/api/candidates/${testCandidateId}/resumes`)
        .field('fileName', 'file.txt')
        .attach('file', fileBuffer, 'file.txt');

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/file type|invalid/i);
    });

    it('should reject files exceeding size limit', async () => {
      // Create a large file buffer (mock)
      const largeBuffer = Buffer.alloc(11 * 1024 * 1024); // 11MB

      const res = await request(app)
        .post(`/api/candidates/${testCandidateId}/resumes`)
        .field('fileName', 'large.pdf')
        .attach('file', largeBuffer, 'large.pdf');

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/size|limit/i);
    });
  });

  describe('GET /api/candidates/:id/resumes - List Resumes', () => {
    it('should list all resumes for a candidate with isActive status', async () => {
      // Upload two resumes
      const fileBuffer1 = Buffer.from('PDF content v1', 'utf-8');
      const fileBuffer2 = Buffer.from('PDF content v2', 'utf-8');

      await request(app)
        .post(`/api/candidates/${testCandidateId}/resumes`)
        .field('fileName', 'resume_v1.pdf')
        .attach('file', fileBuffer1, 'resume_v1.pdf');

      await request(app)
        .post(`/api/candidates/${testCandidateId}/resumes`)
        .field('fileName', 'resume_v2.pdf')
        .attach('file', fileBuffer2, 'resume_v2.pdf');

      const res = await request(app).get(
        `/api/candidates/${testCandidateId}/resumes`
      );

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(2);

      // Check that resumes have expected fields
      const resume = res.body[0];
      expect(resume).toHaveProperty('id');
      expect(resume).toHaveProperty('version');
      expect(resume).toHaveProperty('isActive');
      expect(resume).toHaveProperty('fileUrl');
      expect(resume).toHaveProperty('fileName');
      expect(resume).toHaveProperty('uploadedAt');
      expect(resume).toHaveProperty('candidateId');
    });

    it('should return empty array if candidate has no resumes', async () => {
      // Create a new candidate without resumes
      const newCandidateRes = await request(app)
        .post('/api/candidates')
        .send({
          name: `No Resume Candidate ${Date.now()}`,
          email: `noresume${Date.now()}@example.com`,
          phone: '555-9999',
          location: 'Boston, MA',
          roleApplied: 'Designer',
          stage: 'applied',
          status: 'active',
        });

      if (newCandidateRes.status !== 201) {
        console.log('Failed to create candidate:', newCandidateRes.body);
      }

      const newCandidateId = newCandidateRes.body.id;

      const res = await request(app).get(
        `/api/candidates/${newCandidateId}/resumes`
      );

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(0);
    });

    it('should return 404 if candidate does not exist', async () => {
      const res = await request(app).get('/api/candidates/nonexistent/resumes');

      expect(res.status).toBe(404);
      expect(res.body.error).toContain('Candidate not found');
    });

    it('should show only one active resume per candidate', async () => {
      // Upload resumes to set up test state
      const fileBuffer1 = Buffer.from('PDF v1', 'utf-8');
      const fileBuffer2 = Buffer.from('PDF v2', 'utf-8');

      await request(app)
        .post(`/api/candidates/${testCandidateId}/resumes`)
        .field('fileName', 'resume_v1.pdf')
        .attach('file', fileBuffer1, 'resume_v1.pdf');

      const res2 = await request(app)
        .post(`/api/candidates/${testCandidateId}/resumes`)
        .field('fileName', 'resume_v2.pdf')
        .attach('file', fileBuffer2, 'resume_v2.pdf');

      const resume2Id = res2.body.id;

      // List resumes
      const listRes = await request(app).get(
        `/api/candidates/${testCandidateId}/resumes`
      );

      expect(listRes.status).toBe(200);
      const activeResumes = listRes.body.filter((r) => r.isActive);
      expect(activeResumes.length).toBe(1);
      expect(activeResumes[0].id).toBe(resume2Id);
    });
  });

  describe('PATCH /api/candidates/:id/resumes/:resumeId - Set Active Resume', () => {
    let resumeId1, resumeId2;

    beforeEach(async () => {
      // Upload two resumes
      const fileBuffer1 = Buffer.from('PDF v1', 'utf-8');
      const fileBuffer2 = Buffer.from('PDF v2', 'utf-8');

      const res1 = await request(app)
        .post(`/api/candidates/${testCandidateId}/resumes`)
        .field('fileName', 'resume_v1.pdf')
        .attach('file', fileBuffer1, 'resume_v1.pdf');

      resumeId1 = res1.body.id;

      const res2 = await request(app)
        .post(`/api/candidates/${testCandidateId}/resumes`)
        .field('fileName', 'resume_v2.pdf')
        .attach('file', fileBuffer2, 'resume_v2.pdf');

      resumeId2 = res2.body.id;
    });

    it('should set resume as active and unset others', async () => {
      // Set resume1 as active (resume2 is currently active)
      const res = await request(app)
        .patch(`/api/candidates/${testCandidateId}/resumes/${resumeId1}`)
        .send({ isActive: true });

      expect(res.status).toBe(200);
      expect(res.body.isActive).toBe(true);

      // Verify resume2 is now inactive
      const listRes = await request(app).get(
        `/api/candidates/${testCandidateId}/resumes`
      );

      const resume1 = listRes.body.find((r) => r.id === resumeId1);
      const resume2 = listRes.body.find((r) => r.id === resumeId2);

      expect(resume1.isActive).toBe(true);
      expect(resume2.isActive).toBe(false);
    });

    it('should return 404 if resume does not exist', async () => {
      const res = await request(app)
        .patch(`/api/candidates/${testCandidateId}/resumes/nonexistent`)
        .send({ isActive: true });

      expect(res.status).toBe(404);
      expect(res.body.error).toContain('Resume not found');
    });

    it('should return 404 if candidate does not exist', async () => {
      const res = await request(app)
        .patch(`/api/candidates/nonexistent/resumes/${resumeId1}`)
        .send({ isActive: true });

      expect(res.status).toBe(404);
      expect(res.body.error).toContain('Candidate not found');
    });

    it('should verify resume belongs to candidate', async () => {
      // Create another candidate with a resume
      const timestamp = Date.now();
      const newCandidateRes = await request(app)
        .post('/api/candidates')
        .send({
          name: 'Other Candidate',
          email: `other${timestamp}@example.com`,
          phone: '555-0000',
          location: 'Chicago, IL',
          roleApplied: 'Engineer',
          stage: 'applied',
          status: 'active',
        });

      const otherCandidateId = newCandidateRes.body.id;

      // Try to set a resume belonging to testCandidateId as active on otherCandidateId
      const res = await request(app)
        .patch(`/api/candidates/${otherCandidateId}/resumes/${resumeId1}`)
        .send({ isActive: true });

      expect(res.status).toBe(404);
      expect(res.body.error).toMatch(/Resume not found|does not belong/i);
    });
  });

  describe('DELETE /api/candidates/:id/resumes/:resumeId - Delete Resume', () => {
    let resumeId1, resumeId2;

    beforeEach(async () => {
      // Upload two resumes
      const fileBuffer1 = Buffer.from('PDF v1', 'utf-8');
      const fileBuffer2 = Buffer.from('PDF v2', 'utf-8');

      const res1 = await request(app)
        .post(`/api/candidates/${testCandidateId}/resumes`)
        .field('fileName', 'resume_v1.pdf')
        .attach('file', fileBuffer1, 'resume_v1.pdf');

      resumeId1 = res1.body.id;

      const res2 = await request(app)
        .post(`/api/candidates/${testCandidateId}/resumes`)
        .field('fileName', 'resume_v2.pdf')
        .attach('file', fileBuffer2, 'resume_v2.pdf');

      resumeId2 = res2.body.id;
    });

    it('should delete a specific resume version', async () => {
      const res = await request(app).delete(
        `/api/candidates/${testCandidateId}/resumes/${resumeId1}`
      );

      expect(res.status).toBe(204);

      // Verify it's deleted
      const listRes = await request(app).get(
        `/api/candidates/${testCandidateId}/resumes`
      );

      const deleted = listRes.body.find((r) => r.id === resumeId1);
      expect(deleted).toBeUndefined();
    });

    it('should return 404 if resume does not exist', async () => {
      const res = await request(app).delete(
        `/api/candidates/${testCandidateId}/resumes/nonexistent`
      );

      expect(res.status).toBe(404);
      expect(res.body.error).toContain('Resume not found');
    });

    it('should return 404 if candidate does not exist', async () => {
      const res = await request(app).delete(
        `/api/candidates/nonexistent/resumes/${resumeId1}`
      );

      expect(res.status).toBe(404);
      expect(res.body.error).toContain('Candidate not found');
    });

    it('should verify resume belongs to candidate before deletion', async () => {
      // Create another candidate with a resume
      const timestamp = Date.now();
      const newCandidateRes = await request(app)
        .post('/api/candidates')
        .send({
          name: 'Another Candidate',
          email: `another${timestamp}@example.com`,
          phone: '555-1111',
          location: 'Seattle, WA',
          roleApplied: 'Data Scientist',
          stage: 'applied',
          status: 'active',
        });

      const otherCandidateId = newCandidateRes.body.id;

      // Try to delete a resume belonging to testCandidateId from otherCandidateId
      const res = await request(app).delete(
        `/api/candidates/${otherCandidateId}/resumes/${resumeId1}`
      );

      expect(res.status).toBe(404);
      expect(res.body.error).toMatch(/Resume not found|does not belong/i);
    });

    it('should allow deletion even if resume is active', async () => {
      // resume2 should be active
      const res = await request(app).delete(
        `/api/candidates/${testCandidateId}/resumes/${resumeId2}`
      );

      expect(res.status).toBe(204);

      // Verify it's deleted
      const listRes = await request(app).get(
        `/api/candidates/${testCandidateId}/resumes`
      );

      const deleted = listRes.body.find((r) => r.id === resumeId2);
      expect(deleted).toBeUndefined();
    });
  });

  describe('Integration: Resume versioning workflow', () => {
    it('should handle full resume lifecycle', async () => {
      // 1. Create candidate
      const timestamp = Date.now();
      const candidateRes = await request(app)
        .post('/api/candidates')
        .send({
          name: 'Resume Workflow Candidate',
          email: `workflow${timestamp}@example.com`,
          phone: '555-2222',
          location: 'Denver, CO',
          roleApplied: 'DevOps Engineer',
          stage: 'applied',
          status: 'active',
        });

      const candidateId = candidateRes.body.id;

      // 2. Upload v1 (auto active)
      const fileBuffer1 = Buffer.from('PDF v1', 'utf-8');
      const res1 = await request(app)
        .post(`/api/candidates/${candidateId}/resumes`)
        .field('fileName', 'resume_v1.pdf')
        .attach('file', fileBuffer1, 'resume_v1.pdf');

      const resumeId1 = res1.body.id;
      expect(res1.body.version).toBe(1);
      expect(res1.body.isActive).toBe(true);

      // 3. Upload v2 (auto active)
      const fileBuffer2 = Buffer.from('PDF v2', 'utf-8');
      const res2 = await request(app)
        .post(`/api/candidates/${candidateId}/resumes`)
        .field('fileName', 'resume_v2.pdf')
        .attach('file', fileBuffer2, 'resume_v2.pdf');

      const resumeId2 = res2.body.id;
      expect(res2.body.version).toBe(2);
      expect(res2.body.isActive).toBe(true);

      // 4. Verify v1 is now inactive
      let listRes = await request(app).get(
        `/api/candidates/${candidateId}/resumes`
      );
      expect(listRes.body.find((r) => r.id === resumeId1).isActive).toBe(false);

      // 5. Upload v3 (auto active)
      const fileBuffer3 = Buffer.from('PDF v3', 'utf-8');
      const res3 = await request(app)
        .post(`/api/candidates/${candidateId}/resumes`)
        .field('fileName', 'resume_v3.pdf')
        .attach('file', fileBuffer3, 'resume_v3.pdf');

      const resumeId3 = res3.body.id;
      expect(res3.body.version).toBe(3);
      expect(res3.body.isActive).toBe(true);

      // 6. Verify only v3 is active
      listRes = await request(app).get(
        `/api/candidates/${candidateId}/resumes`
      );
      expect(listRes.body.filter((r) => r.isActive).length).toBe(1);
      expect(listRes.body.find((r) => r.id === resumeId3).isActive).toBe(true);

      // 7. Reactivate v1
      const reactivateRes = await request(app)
        .patch(`/api/candidates/${candidateId}/resumes/${resumeId1}`)
        .send({ isActive: true });

      expect(reactivateRes.status).toBe(200);
      expect(reactivateRes.body.isActive).toBe(true);

      // 8. Verify only v1 is now active
      listRes = await request(app).get(
        `/api/candidates/${candidateId}/resumes`
      );
      expect(listRes.body.filter((r) => r.isActive).length).toBe(1);
      expect(listRes.body.find((r) => r.id === resumeId1).isActive).toBe(true);

      // 9. Delete v2
      const deleteRes = await request(app).delete(
        `/api/candidates/${candidateId}/resumes/${resumeId2}`
      );

      expect(deleteRes.status).toBe(204);

      // 10. Verify v2 is gone
      listRes = await request(app).get(
        `/api/candidates/${candidateId}/resumes`
      );
      expect(listRes.body.find((r) => r.id === resumeId2)).toBeUndefined();
      expect(listRes.body.length).toBe(2); // v1 and v3 remain
    });
  });
});
