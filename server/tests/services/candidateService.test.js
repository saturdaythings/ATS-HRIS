import {
  createCandidate,
  getCandidateById,
  updateCandidate,
  deleteCandidate,
  listCandidates,
  associateResumeWithCandidate,
  getCandidateWithResume,
  updateCandidateResume,
  deleteCandidateResume,
  listCandidatesWithResumes,
} from '../../services/candidateService.js';
import { db } from '../../db.js';
import fs from 'fs';
import path from 'path';

// Mock directory for tests
const TEST_UPLOAD_DIR = path.join(process.cwd(), 'server', 'uploads', 'resumes');

describe('CandidateService', () => {
  beforeAll(async () => {
    // Ensure test upload directory exists
    if (!fs.existsSync(TEST_UPLOAD_DIR)) {
      fs.mkdirSync(TEST_UPLOAD_DIR, { recursive: true });
    }
  });

  beforeEach(async () => {
    // Clean up test data
    await db.candidate.deleteMany({});
  });

  afterEach(async () => {
    // Clean up test files
    if (fs.existsSync(TEST_UPLOAD_DIR)) {
      const files = fs.readdirSync(TEST_UPLOAD_DIR);
      files.forEach((file) => {
        const filePath = path.join(TEST_UPLOAD_DIR, file);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });
    }
  });

  afterAll(async () => {
    // Clean up test directory
    if (fs.existsSync(TEST_UPLOAD_DIR)) {
      fs.rmdirSync(TEST_UPLOAD_DIR, { recursive: true });
    }
    await db.$disconnect();
  });

  // ==================== BASIC CRUD TESTS ====================

  describe('createCandidate', () => {
    test('should create a candidate with minimal fields', async () => {
      const candidate = await createCandidate({
        name: 'John Doe',
        email: 'john@example.com',
        role: 'Software Engineer',
      });

      expect(candidate.id).toBeDefined();
      expect(candidate.name).toBe('John Doe');
      expect(candidate.email).toBe('john@example.com');
      expect(candidate.role).toBe('Software Engineer');
      expect(candidate.status).toBe('active');
      expect(candidate.stage).toBe('sourced');
      expect(candidate.resumeUrl).toBeNull();
      expect(candidate.notes).toBeNull();
    });

    test('should create a candidate with all fields', async () => {
      const candidate = await createCandidate({
        name: 'Jane Smith',
        email: 'jane@example.com',
        role: 'Product Manager',
        status: 'active',
        stage: 'interview',
        notes: 'Great culture fit',
      });

      expect(candidate.name).toBe('Jane Smith');
      expect(candidate.status).toBe('active');
      expect(candidate.stage).toBe('interview');
      expect(candidate.notes).toBe('Great culture fit');
    });

    test('should require name', async () => {
      await expect(
        createCandidate({
          email: 'test@example.com',
          role: 'Engineer',
        })
      ).rejects.toThrow('Candidate name is required');
    });

    test('should require email', async () => {
      await expect(
        createCandidate({
          name: 'Test User',
          role: 'Engineer',
        })
      ).rejects.toThrow('Candidate email is required');
    });

    test('should require role', async () => {
      await expect(
        createCandidate({
          name: 'Test User',
          email: 'test@example.com',
        })
      ).rejects.toThrow('Candidate role is required');
    });

    test('should reject duplicate email', async () => {
      await createCandidate({
        name: 'John Doe',
        email: 'john@example.com',
        role: 'Engineer',
      });

      await expect(
        createCandidate({
          name: 'Different Name',
          email: 'john@example.com',
          role: 'Manager',
        })
      ).rejects.toThrow();
    });
  });

  describe('getCandidateById', () => {
    test('should retrieve a candidate by ID', async () => {
      const created = await createCandidate({
        name: 'Test User',
        email: 'test@example.com',
        role: 'Engineer',
      });

      const retrieved = await getCandidateById(created.id);
      expect(retrieved.id).toBe(created.id);
      expect(retrieved.name).toBe('Test User');
      expect(retrieved.email).toBe('test@example.com');
    });

    test('should throw error when candidate not found', async () => {
      await expect(getCandidateById('nonexistent-id')).rejects.toThrow(
        'Candidate not found'
      );
    });
  });

  describe('updateCandidate', () => {
    test('should update candidate fields', async () => {
      const created = await createCandidate({
        name: 'John Doe',
        email: 'john@example.com',
        role: 'Engineer',
      });

      const updated = await updateCandidate(created.id, {
        status: 'rejected',
        stage: 'screening',
        notes: 'Updated notes',
      });

      expect(updated.status).toBe('rejected');
      expect(updated.stage).toBe('screening');
      expect(updated.notes).toBe('Updated notes');
      expect(updated.name).toBe('John Doe'); // unchanged
    });

    test('should throw error when candidate not found', async () => {
      await expect(
        updateCandidate('nonexistent-id', { status: 'hired' })
      ).rejects.toThrow('Candidate not found');
    });
  });

  describe('deleteCandidate', () => {
    test('should delete a candidate', async () => {
      const created = await createCandidate({
        name: 'Test User',
        email: 'test@example.com',
        role: 'Engineer',
      });

      await deleteCandidate(created.id);

      // Verify deletion
      const retrieved = await db.candidate.findUnique({
        where: { id: created.id },
      });
      expect(retrieved).toBeNull();
    });

    test('should throw error when candidate not found', async () => {
      await expect(deleteCandidate('nonexistent-id')).rejects.toThrow(
        'Candidate not found'
      );
    });
  });

  describe('listCandidates', () => {
    test('should list all candidates', async () => {
      await createCandidate({
        name: 'John Doe',
        email: 'john@example.com',
        role: 'Engineer',
      });

      await createCandidate({
        name: 'Jane Smith',
        email: 'jane@example.com',
        role: 'Manager',
      });

      const candidates = await listCandidates();
      expect(candidates.length).toBe(2);
    });

    test('should filter candidates by status', async () => {
      await createCandidate({
        name: 'Active User',
        email: 'active@example.com',
        role: 'Engineer',
        status: 'active',
      });

      await createCandidate({
        name: 'Rejected User',
        email: 'rejected@example.com',
        role: 'Engineer',
        status: 'rejected',
      });

      const active = await listCandidates({ status: 'active' });
      expect(active.length).toBe(1);
      expect(active[0].status).toBe('active');
    });

    test('should filter candidates by stage', async () => {
      await createCandidate({
        name: 'Sourced User',
        email: 'sourced@example.com',
        role: 'Engineer',
        stage: 'sourced',
      });

      await createCandidate({
        name: 'Interview User',
        email: 'interview@example.com',
        role: 'Engineer',
        stage: 'interview',
      });

      const interview = await listCandidates({ stage: 'interview' });
      expect(interview.length).toBe(1);
      expect(interview[0].stage).toBe('interview');
    });

    test('should return empty array when no candidates match', async () => {
      const candidates = await listCandidates({ status: 'hired' });
      expect(candidates).toEqual([]);
    });
  });

  // ==================== RESUME OPERATIONS TESTS ====================

  describe('associateResumeWithCandidate', () => {
    test('should upload resume and associate with candidate', async () => {
      const candidate = await createCandidate({
        name: 'John Doe',
        email: 'john@example.com',
        role: 'Engineer',
      });

      const mockBuffer = Buffer.from('PDF content');
      const mockFileName = 'resume.pdf';

      const updated = await associateResumeWithCandidate(
        candidate.id,
        mockBuffer,
        mockFileName
      );

      expect(updated.resumeUrl).toBeDefined();
      expect(updated.resumeUrl).toMatch(/^\/api\/resumes\/[a-f0-9]{16}_resume\.pdf$/);
    });

    test('should throw error when candidate not found', async () => {
      await expect(
        associateResumeWithCandidate(
          'nonexistent-id',
          Buffer.from('PDF'),
          'resume.pdf'
        )
      ).rejects.toThrow('Candidate not found');
    });

    test('should create resume file on disk', async () => {
      const candidate = await createCandidate({
        name: 'John Doe',
        email: 'john@example.com',
        role: 'Engineer',
      });

      const mockBuffer = Buffer.from('PDF content for testing');
      const mockFileName = 'resume.pdf';

      const updated = await associateResumeWithCandidate(
        candidate.id,
        mockBuffer,
        mockFileName
      );

      // Verify file exists on disk
      const filename = updated.resumeUrl.split('/').pop();
      const filePath = path.join(TEST_UPLOAD_DIR, filename);
      expect(fs.existsSync(filePath)).toBe(true);
    });
  });

  describe('getCandidateWithResume', () => {
    test('should retrieve candidate with resume URL', async () => {
      const candidate = await createCandidate({
        name: 'John Doe',
        email: 'john@example.com',
        role: 'Engineer',
      });

      // Associate resume
      const updated = await associateResumeWithCandidate(
        candidate.id,
        Buffer.from('PDF'),
        'resume.pdf'
      );

      const withResume = await getCandidateWithResume(candidate.id);
      expect(withResume.resumeUrl).toBe(updated.resumeUrl);
      expect(withResume.name).toBe('John Doe');
    });

    test('should return candidate even without resume', async () => {
      const candidate = await createCandidate({
        name: 'Jane Smith',
        email: 'jane@example.com',
        role: 'Manager',
      });

      const retrieved = await getCandidateWithResume(candidate.id);
      expect(retrieved.id).toBe(candidate.id);
      expect(retrieved.resumeUrl).toBeNull();
    });

    test('should throw error when candidate not found', async () => {
      await expect(
        getCandidateWithResume('nonexistent-id')
      ).rejects.toThrow('Candidate not found');
    });
  });

  describe('updateCandidateResume', () => {
    test('should replace candidate resume', async () => {
      const candidate = await createCandidate({
        name: 'John Doe',
        email: 'john@example.com',
        role: 'Engineer',
      });

      // Associate initial resume
      const initial = await associateResumeWithCandidate(
        candidate.id,
        Buffer.from('PDF'),
        'resume.pdf'
      );

      const initialUrl = initial.resumeUrl;

      // Update resume
      const updated = await updateCandidateResume(
        candidate.id,
        Buffer.from('Updated PDF'),
        'resume_updated.pdf'
      );

      expect(updated.resumeUrl).toBeDefined();
      expect(updated.resumeUrl).not.toBe(initialUrl);
      expect(updated.resumeUrl).toMatch(/^\/api\/resumes\/[a-f0-9]{16}_resume_updated\.pdf$/);
    });

    test('should throw error when candidate not found', async () => {
      await expect(
        updateCandidateResume(
          'nonexistent-id',
          Buffer.from('PDF'),
          'resume.pdf'
        )
      ).rejects.toThrow('Candidate not found');
    });
  });

  describe('deleteCandidateResume', () => {
    test('should clear resume URL from candidate', async () => {
      const candidate = await createCandidate({
        name: 'John Doe',
        email: 'john@example.com',
        role: 'Engineer',
      });

      // Associate resume
      await associateResumeWithCandidate(
        candidate.id,
        Buffer.from('PDF'),
        'resume.pdf'
      );

      // Delete resume
      const updated = await deleteCandidateResume(candidate.id);
      expect(updated.resumeUrl).toBeNull();
    });

    test('should succeed even if candidate has no resume', async () => {
      const candidate = await createCandidate({
        name: 'Jane Smith',
        email: 'jane@example.com',
        role: 'Manager',
      });

      const updated = await deleteCandidateResume(candidate.id);
      expect(updated.resumeUrl).toBeNull();
    });

    test('should throw error when candidate not found', async () => {
      await expect(
        deleteCandidateResume('nonexistent-id')
      ).rejects.toThrow('Candidate not found');
    });
  });

  describe('listCandidatesWithResumes', () => {
    test('should list candidates filtered by hasResume', async () => {
      // Create candidate without resume
      await createCandidate({
        name: 'No Resume User',
        email: 'noresume@example.com',
        role: 'Engineer',
      });

      // Create candidate with resume
      const withResume = await createCandidate({
        name: 'Resume User',
        email: 'withresume@example.com',
        role: 'Manager',
      });

      await associateResumeWithCandidate(
        withResume.id,
        Buffer.from('PDF'),
        'resume.pdf'
      );

      // List candidates with resumes
      const withResumes = await listCandidatesWithResumes({ hasResume: true });
      expect(withResumes.length).toBe(1);
      expect(withResumes[0].name).toBe('Resume User');
      expect(withResumes[0].resumeUrl).toBeDefined();
    });

    test('should list candidates without resumes', async () => {
      await createCandidate({
        name: 'No Resume User 1',
        email: 'noresume1@example.com',
        role: 'Engineer',
      });

      await createCandidate({
        name: 'No Resume User 2',
        email: 'noresume2@example.com',
        role: 'Manager',
      });

      const withoutResumes = await listCandidatesWithResumes({
        hasResume: false,
      });
      expect(withoutResumes.length).toBe(2);
    });

    test('should filter by status and hasResume', async () => {
      await createCandidate({
        name: 'Active No Resume',
        email: 'active1@example.com',
        role: 'Engineer',
        status: 'active',
      });

      const candidate = await createCandidate({
        name: 'Active With Resume',
        email: 'active2@example.com',
        role: 'Manager',
        status: 'active',
      });

      await associateResumeWithCandidate(
        candidate.id,
        Buffer.from('PDF'),
        'resume.pdf'
      );

      const results = await listCandidatesWithResumes({
        hasResume: true,
        status: 'active',
      });

      expect(results.length).toBe(1);
      expect(results[0].name).toBe('Active With Resume');
      expect(results[0].status).toBe('active');
    });

    test('should filter by stage', async () => {
      await createCandidate({
        name: 'Sourced',
        email: 'sourced@example.com',
        role: 'Engineer',
        stage: 'sourced',
      });

      await createCandidate({
        name: 'Interview',
        email: 'interview@example.com',
        role: 'Manager',
        stage: 'interview',
      });

      const interview = await listCandidatesWithResumes({ stage: 'interview' });
      expect(interview.length).toBe(1);
      expect(interview[0].stage).toBe('interview');
    });

    test('should return empty array when no candidates match', async () => {
      await createCandidate({
        name: 'Test User',
        email: 'test@example.com',
        role: 'Engineer',
        status: 'active',
      });

      const results = await listCandidatesWithResumes({
        hasResume: true,
        status: 'hired',
      });

      expect(results).toEqual([]);
    });
  });
});
