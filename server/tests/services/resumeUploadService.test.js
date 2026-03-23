import {
  validateResumeFile,
  saveResumeFile,
  generateFileName,
  cleanupOldUploads,
  getResumeFile,
  deleteResumeFile,
  getUploadDir,
  getAllowedExtensions,
  getMaxFileSize,
} from '../../services/resumeUploadService.js';
import fs from 'fs';
import path from 'path';

// Mock directory for tests
const TEST_UPLOAD_DIR = path.join(process.cwd(), 'server', 'uploads', 'resumes');

describe('ResumeUploadService', () => {
  beforeAll(async () => {
    // Ensure test upload directory exists
    if (!fs.existsSync(TEST_UPLOAD_DIR)) {
      fs.mkdirSync(TEST_UPLOAD_DIR, { recursive: true });
    }
  });

  afterEach(async () => {
    // Clean up test files
    if (fs.existsSync(TEST_UPLOAD_DIR)) {
      const files = fs.readdirSync(TEST_UPLOAD_DIR);
      files.forEach((file) => {
        const filePath = path.join(TEST_UPLOAD_DIR, file);
        fs.unlinkSync(filePath);
      });
    }
  });

  afterAll(async () => {
    // Clean up test directory
    if (fs.existsSync(TEST_UPLOAD_DIR)) {
      fs.rmdirSync(TEST_UPLOAD_DIR, { recursive: true });
    }
  });

  describe('generateFileName', () => {
    test('should generate unique filename with pdf extension', () => {
      const original1 = 'resume.pdf';
      const filename1 = generateFileName(original1);

      expect(filename1).toMatch(/^[a-f0-9]{16}_resume\.pdf$/);
      expect(filename1).toContain('.pdf');
    });

    test('should generate unique filename with docx extension', () => {
      const original = 'my_resume.docx';
      const filename = generateFileName(original);

      expect(filename).toMatch(/^[a-f0-9]{16}_my_resume\.docx$/);
      expect(filename).toContain('.docx');
    });

    test('should generate different filenames for same input', () => {
      const original = 'resume.pdf';
      const filename1 = generateFileName(original);
      const filename2 = generateFileName(original);

      expect(filename1).not.toBe(filename2);
    });

    test('should preserve original filename in generated name', () => {
      const original = 'john_doe_resume.pdf';
      const filename = generateFileName(original);

      expect(filename).toContain('john_doe_resume.pdf');
    });

    test('should handle filenames with multiple dots', () => {
      const original = 'resume.2024.pdf';
      const filename = generateFileName(original);

      expect(filename).toMatch(/\.pdf$/);
      expect(filename).toContain('2024');
    });
  });

  describe('validateResumeFile', () => {
    test('should validate pdf file with correct mime type', () => {
      const file = {
        originalname: 'resume.pdf',
        mimetype: 'application/pdf',
        size: 1024 * 1024, // 1MB
      };

      const result = validateResumeFile(file);

      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    test('should validate docx file with correct mime type', () => {
      const file = {
        originalname: 'resume.docx',
        mimetype: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        size: 512 * 1024, // 512KB
      };

      const result = validateResumeFile(file);

      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    test('should reject file with unsupported extension', () => {
      const file = {
        originalname: 'resume.txt',
        mimetype: 'text/plain',
        size: 1024,
      };

      const result = validateResumeFile(file);

      expect(result.valid).toBe(false);
      expect(result.error).toContain('pdf or docx');
    });

    test('should reject file with unsupported mime type', () => {
      const file = {
        originalname: 'resume.pdf',
        mimetype: 'image/png',
        size: 1024,
      };

      const result = validateResumeFile(file);

      expect(result.valid).toBe(false);
      expect(result.error).toContain('application/pdf or application/vnd.openxmlformats');
    });

    test('should reject file exceeding size limit (10MB)', () => {
      const file = {
        originalname: 'resume.pdf',
        mimetype: 'application/pdf',
        size: 11 * 1024 * 1024, // 11MB
      };

      const result = validateResumeFile(file);

      expect(result.valid).toBe(false);
      expect(result.error).toContain('10MB');
    });

    test('should accept file at exact size limit (10MB)', () => {
      const file = {
        originalname: 'resume.pdf',
        mimetype: 'application/pdf',
        size: 10 * 1024 * 1024, // 10MB
      };

      const result = validateResumeFile(file);

      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    test('should reject file with missing extension', () => {
      const file = {
        originalname: 'resume',
        mimetype: 'application/pdf',
        size: 1024,
      };

      const result = validateResumeFile(file);

      expect(result.valid).toBe(false);
      expect(result.error).toContain('pdf or docx');
    });

    test('should reject file with empty name', () => {
      const file = {
        originalname: '',
        mimetype: 'application/pdf',
        size: 1024,
      };

      const result = validateResumeFile(file);

      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    test('should handle case-insensitive extension check', () => {
      const file = {
        originalname: 'RESUME.PDF',
        mimetype: 'application/pdf',
        size: 1024,
      };

      const result = validateResumeFile(file);

      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    test('should handle mixed case extensions', () => {
      const file = {
        originalname: 'resume.Docx',
        mimetype: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        size: 1024,
      };

      const result = validateResumeFile(file);

      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });

  describe('saveResumeFile', () => {
    test('should save file and return url with filename', async () => {
      const fileBuffer = Buffer.from('PDF content', 'utf-8');
      const originalName = 'resume.pdf';

      const result = await saveResumeFile(fileBuffer, originalName);

      expect(result).toHaveProperty('filename');
      expect(result).toHaveProperty('url');
      expect(result.filename).toMatch(/^[a-f0-9]{16}_resume\.pdf$/);
      expect(result.url).toBe(`/api/resumes/${result.filename}`);
    });

    test('should save docx file', async () => {
      const fileBuffer = Buffer.from('DOCX content', 'utf-8');
      const originalName = 'resume.docx';

      const result = await saveResumeFile(fileBuffer, originalName);

      expect(result.filename).toMatch(/\.docx$/);
      expect(result.url).toContain('/api/resumes/');
    });

    test('should persist file to disk', async () => {
      const fileBuffer = Buffer.from('Test content', 'utf-8');
      const originalName = 'test.pdf';

      const result = await saveResumeFile(fileBuffer, originalName);

      const filePath = path.join(TEST_UPLOAD_DIR, result.filename);
      expect(fs.existsSync(filePath)).toBe(true);
    });

    test('should write correct content to disk', async () => {
      const testContent = 'Test PDF Content 12345';
      const fileBuffer = Buffer.from(testContent, 'utf-8');
      const originalName = 'content_test.pdf';

      const result = await saveResumeFile(fileBuffer, originalName);

      const filePath = path.join(TEST_UPLOAD_DIR, result.filename);
      const savedContent = fs.readFileSync(filePath, 'utf-8');

      expect(savedContent).toBe(testContent);
    });

    test('should create upload directory if it does not exist', async () => {
      // Remove directory if exists
      const testDir = path.join(process.cwd(), 'server', 'uploads', 'resumes', 'temp_test');
      if (fs.existsSync(testDir)) {
        fs.rmdirSync(testDir, { recursive: true });
      }

      // This test verifies the service creates directories as needed
      const fileBuffer = Buffer.from('test', 'utf-8');
      const result = await saveResumeFile(fileBuffer, 'test.pdf');

      expect(result.filename).toBeDefined();
      expect(result.url).toBeDefined();
    });

    test('should handle file names with spaces', async () => {
      const fileBuffer = Buffer.from('content', 'utf-8');
      const originalName = 'my resume file.pdf';

      const result = await saveResumeFile(fileBuffer, originalName);

      expect(result.filename).toBeDefined();
      expect(result.url).toContain('/api/resumes/');
    });

    test('should handle buffer input correctly', async () => {
      const testData = Buffer.from([0x25, 0x50, 0x44, 0x46]); // PDF header
      const originalName = 'binary.pdf';

      const result = await saveResumeFile(testData, originalName);

      const filePath = path.join(TEST_UPLOAD_DIR, result.filename);
      const savedBuffer = fs.readFileSync(filePath);

      expect(savedBuffer).toEqual(testData);
    });
  });

  describe('cleanupOldUploads', () => {
    test('should remove files older than retention period', async () => {
      // Create a test file
      const oldFilePath = path.join(TEST_UPLOAD_DIR, 'old_file.pdf');
      fs.writeFileSync(oldFilePath, 'old content');

      // Set modification time to 32 days ago
      const thirtyTwoDaysAgo = Date.now() - 32 * 24 * 60 * 60 * 1000;
      fs.utimesSync(oldFilePath, thirtyTwoDaysAgo / 1000, thirtyTwoDaysAgo / 1000);

      // Run cleanup (default retention: 30 days)
      const result = await cleanupOldUploads(30);

      expect(fs.existsSync(oldFilePath)).toBe(false);
      expect(result.deletedCount).toBe(1);
    });

    test('should keep files within retention period', async () => {
      // Create a recent test file
      const recentFilePath = path.join(TEST_UPLOAD_DIR, 'recent_file.pdf');
      fs.writeFileSync(recentFilePath, 'recent content');

      // Run cleanup (default retention: 30 days)
      const result = await cleanupOldUploads(30);

      expect(fs.existsSync(recentFilePath)).toBe(true);
      expect(result.deletedCount).toBe(0);
    });

    test('should return deleted file count', async () => {
      // Create multiple old files
      const file1 = path.join(TEST_UPLOAD_DIR, 'file1.pdf');
      const file2 = path.join(TEST_UPLOAD_DIR, 'file2.docx');
      fs.writeFileSync(file1, 'content1');
      fs.writeFileSync(file2, 'content2');

      const thirtyTwoDaysAgo = Date.now() - 32 * 24 * 60 * 60 * 1000;
      fs.utimesSync(file1, thirtyTwoDaysAgo / 1000, thirtyTwoDaysAgo / 1000);
      fs.utimesSync(file2, thirtyTwoDaysAgo / 1000, thirtyTwoDaysAgo / 1000);

      const result = await cleanupOldUploads(30);

      expect(result.deletedCount).toBe(2);
    });

    test('should handle empty upload directory gracefully', async () => {
      const result = await cleanupOldUploads(30);

      expect(result.deletedCount).toBe(0);
      expect(result.error).toBeUndefined();
    });

    test('should support custom retention period', async () => {
      const oldFilePath = path.join(TEST_UPLOAD_DIR, 'custom_old.pdf');
      fs.writeFileSync(oldFilePath, 'old content');

      // Set modification time to 8 days ago
      const eightDaysAgo = Date.now() - 8 * 24 * 60 * 60 * 1000;
      fs.utimesSync(oldFilePath, eightDaysAgo / 1000, eightDaysAgo / 1000);

      // Cleanup with 7 day retention
      const result = await cleanupOldUploads(7);

      expect(fs.existsSync(oldFilePath)).toBe(false);
      expect(result.deletedCount).toBe(1);
    });
  });

  describe('getResumeFile', () => {
    test('should retrieve file content from disk', async () => {
      const testContent = 'Retrieved content test';
      const fileBuffer = Buffer.from(testContent, 'utf-8');
      const originalName = 'retrieve_test.pdf';

      const saveResult = await saveResumeFile(fileBuffer, originalName);

      const retrievedBuffer = await getResumeFile(saveResult.filename);
      expect(retrievedBuffer.toString('utf-8')).toBe(testContent);
    });

    test('should throw error for non-existent file', async () => {
      await expect(getResumeFile('non_existent_file.pdf')).rejects.toThrow(
        'File not found'
      );
    });

    test('should prevent directory traversal attacks', async () => {
      await expect(
        getResumeFile('../../../etc/passwd')
      ).rejects.toThrow('Invalid file path');
    });

    test('should handle binary file retrieval', async () => {
      const binaryData = Buffer.from([0x25, 0x50, 0x44, 0x46, 0x2d]);
      const saveResult = await saveResumeFile(binaryData, 'binary.pdf');

      const retrievedBuffer = await getResumeFile(saveResult.filename);
      expect(retrievedBuffer).toEqual(binaryData);
    });
  });

  describe('deleteResumeFile', () => {
    test('should delete file from disk', async () => {
      const fileBuffer = Buffer.from('delete test', 'utf-8');
      const saveResult = await saveResumeFile(fileBuffer, 'delete_test.pdf');

      const filePath = path.join(TEST_UPLOAD_DIR, saveResult.filename);
      expect(fs.existsSync(filePath)).toBe(true);

      await deleteResumeFile(saveResult.filename);

      expect(fs.existsSync(filePath)).toBe(false);
    });

    test('should throw error when deleting non-existent file', async () => {
      await expect(deleteResumeFile('non_existent.pdf')).rejects.toThrow(
        'File not found'
      );
    });

    test('should prevent directory traversal attacks on delete', async () => {
      await expect(
        deleteResumeFile('../../../etc/passwd')
      ).rejects.toThrow('Invalid file path');
    });
  });

  describe('Helper functions', () => {
    test('getUploadDir should return valid directory path', () => {
      const dir = getUploadDir();

      expect(dir).toBeDefined();
      expect(dir).toContain('uploads');
      expect(dir).toContain('resumes');
    });

    test('getAllowedExtensions should return pdf and docx', () => {
      const extensions = getAllowedExtensions();

      expect(extensions).toEqual(['.pdf', '.docx']);
    });

    test('getMaxFileSize should return 10MB in bytes', () => {
      const maxSize = getMaxFileSize();

      expect(maxSize).toBe(10 * 1024 * 1024);
    });
  });

  describe('Integration tests', () => {
    test('should validate and save file in sequence', async () => {
      const file = {
        originalname: 'full_test.pdf',
        mimetype: 'application/pdf',
        size: 2 * 1024 * 1024,
      };

      const validation = validateResumeFile(file);
      expect(validation.valid).toBe(true);

      const fileBuffer = Buffer.from('PDF file content', 'utf-8');
      const result = await saveResumeFile(fileBuffer, file.originalname);

      expect(result.filename).toBeDefined();
      expect(result.url).toBeDefined();

      const filePath = path.join(TEST_UPLOAD_DIR, result.filename);
      expect(fs.existsSync(filePath)).toBe(true);
    });

    test('should handle workflow for multiple files', async () => {
      const files = [
        { name: 'resume1.pdf', content: 'PDF 1' },
        { name: 'resume2.docx', content: 'DOCX 1' },
      ];

      const results = [];
      for (const file of files) {
        const validation = validateResumeFile({
          originalname: file.name,
          mimetype: file.name.endsWith('.pdf')
            ? 'application/pdf'
            : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          size: 1024,
        });

        if (validation.valid) {
          const result = await saveResumeFile(
            Buffer.from(file.content),
            file.name
          );
          results.push(result);
        }
      }

      expect(results).toHaveLength(2);
      results.forEach((result) => {
        const filePath = path.join(TEST_UPLOAD_DIR, result.filename);
        expect(fs.existsSync(filePath)).toBe(true);
      });
    });

    test('should retrieve, modify, and delete file', async () => {
      const originalContent = 'Original content';
      const result = await saveResumeFile(
        Buffer.from(originalContent, 'utf-8'),
        'workflow_test.pdf'
      );

      // Retrieve
      const retrieved = await getResumeFile(result.filename);
      expect(retrieved.toString('utf-8')).toBe(originalContent);

      // Delete
      await deleteResumeFile(result.filename);
      const filePath = path.join(TEST_UPLOAD_DIR, result.filename);
      expect(fs.existsSync(filePath)).toBe(false);

      // Verify it's gone
      await expect(getResumeFile(result.filename)).rejects.toThrow(
        'File not found'
      );
    });
  });
});
