# Resume Upload Service - Usage Guide

## Quick Start

### 1. Import the Service

```javascript
import {
  validateResumeFile,
  saveResumeFile,
  getResumeFile,
  deleteResumeFile
} from './services/resumeUploadService.js';
import { uploadResume } from './middleware/upload.js';
```

### 2. Use in Express Routes

```javascript
import express from 'express';
import { uploadResume } from './middleware/upload.js';
import { saveResumeFile } from './services/resumeUploadService.js';

const router = express.Router();

// POST endpoint for resume upload
router.post('/upload', uploadResume, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const result = await saveResumeFile(req.file.buffer, req.file.originalname);

    res.json({
      success: true,
      filename: result.filename,
      url: result.url
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
```

---

## API Methods

### validateResumeFile(file)

Validates a file object before upload.

```javascript
const file = {
  originalname: 'resume.pdf',
  mimetype: 'application/pdf',
  size: 1024 * 1024 // 1MB
};

const validation = validateResumeFile(file);

if (validation.valid) {
  console.log('File is valid');
} else {
  console.log('Error:', validation.error);
}
```

**Returns:**
```javascript
{
  valid: true,           // or false
  error: undefined       // or error message string
}
```

**Validation Rules:**
- ✅ File must be .pdf or .docx
- ✅ MIME type must match file type
- ✅ File size must not exceed 10MB

---

### saveResumeFile(fileBuffer, originalName)

Saves a file to disk and returns the URL.

```javascript
const fileBuffer = req.file.buffer; // from multer
const originalName = req.file.originalname;

const result = await saveResumeFile(fileBuffer, originalName);

console.log(result);
// {
//   filename: '8a2f3c6e4b1d9e5a_resume.pdf',
//   url: '/api/resumes/8a2f3c6e4b1d9e5a_resume.pdf'
// }
```

**Stored Location:**
```
server/uploads/resumes/{hash}_{originalname}
```

**Returns:**
```javascript
{
  filename: string,  // e.g., '8a2f3c6e4b1d9e5a_resume.pdf'
  url: string        // e.g., '/api/resumes/8a2f3c6e4b1d9e5a_resume.pdf'
}
```

---

### getResumeFile(filename)

Retrieves a file from disk.

```javascript
const filename = '8a2f3c6e4b1d9e5a_resume.pdf';
const fileBuffer = await getResumeFile(filename);

res.setHeader('Content-Type', 'application/octet-stream');
res.send(fileBuffer);
```

**Security:**
- Prevents directory traversal attacks
- Throws error if file not found

**Throws:**
```javascript
Error('Invalid file path')   // if path traversal detected
Error('File not found')      // if file doesn't exist
```

---

### deleteResumeFile(filename)

Removes a file from disk.

```javascript
const filename = '8a2f3c6e4b1d9e5a_resume.pdf';
await deleteResumeFile(filename);
```

**Throws:**
```javascript
Error('Invalid file path')   // if path traversal detected
Error('File not found')      // if file doesn't exist
```

---

### cleanupOldUploads(retentionDays = 30)

Removes files older than the retention period.

```javascript
// Remove files older than 30 days (default)
let result = await cleanupOldUploads();

// Or specify custom retention period
result = await cleanupOldUploads(7); // Remove files older than 7 days

console.log(result);
// {
//   deletedCount: 5,
//   error: undefined
// }
```

**Usage Example (scheduled cleanup):**
```javascript
// Run cleanup daily using a cron job
import cron from 'node-cron';
import { cleanupOldUploads } from './services/resumeUploadService.js';

// Every day at 2 AM
cron.schedule('0 2 * * *', async () => {
  const result = await cleanupOldUploads(30);
  console.log(`Cleanup complete: ${result.deletedCount} files deleted`);
});
```

---

### Helper Functions

```javascript
import {
  getUploadDir,
  getAllowedExtensions,
  getMaxFileSize
} from './services/resumeUploadService.js';

// Get upload directory path
const dir = getUploadDir();
// => /Users/oliver/OliverRepo/.../server/uploads/resumes

// Get allowed file extensions
const extensions = getAllowedExtensions();
// => ['.pdf', '.docx']

// Get max file size in bytes
const maxSize = getMaxFileSize();
// => 10485760 (10MB)
```

---

## Multer Middleware

### Single File Upload

```javascript
import { uploadResume } from './middleware/upload.js';

router.post('/resume/upload', uploadResume, (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file provided' });
  }

  console.log('File received:', req.file.originalname);
  console.log('File size:', req.file.size);
  res.json({ message: 'File received' });
});
```

**Client Form:**
```html
<form enctype="multipart/form-data">
  <input type="file" name="resume" accept=".pdf,.docx" />
  <button type="submit">Upload Resume</button>
</form>
```

---

### Multiple File Upload

```javascript
import { uploadResumes } from './middleware/upload.js';

router.post('/resumes/upload', uploadResumes, (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'No files provided' });
  }

  const fileNames = req.files.map(f => f.originalname);
  res.json({ message: `${req.files.length} files received`, files: fileNames });
});
```

**Client Form:**
```html
<form enctype="multipart/form-data">
  <input type="file" name="resumes" multiple accept=".pdf,.docx" />
  <button type="submit">Upload Resumes</button>
</form>
```

---

## Complete Example Route

```javascript
import express from 'express';
import { uploadResume } from '../middleware/upload.js';
import {
  saveResumeFile,
  getResumeFile,
  deleteResumeFile
} from '../services/resumeUploadService.js';

const router = express.Router();

// Upload resume
router.post('/candidates/:id/resume', uploadResume, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const result = await saveResumeFile(
      req.file.buffer,
      req.file.originalname
    );

    // Save URL to database
    await db.candidate.update({
      where: { id: req.params.id },
      data: { resumeUrl: result.url }
    });

    res.json({
      success: true,
      filename: result.filename,
      url: result.url
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Download resume
router.get('/resumes/:filename', async (req, res) => {
  try {
    const fileBuffer = await getResumeFile(req.params.filename);
    res.setHeader('Content-Type', 'application/octet-stream');
    res.send(fileBuffer);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

// Delete resume
router.delete('/resumes/:filename', async (req, res) => {
  try {
    await deleteResumeFile(req.params.filename);
    res.json({ success: true });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

export default router;
```

---

## Error Handling

### File Too Large

```javascript
const file = {
  originalname: 'resume.pdf',
  mimetype: 'application/pdf',
  size: 11 * 1024 * 1024 // 11MB (exceeds 10MB limit)
};

const validation = validateResumeFile(file);
// {
//   valid: false,
//   error: 'File size exceeds 10MB limit. Your file is 11.00MB.'
// }
```

### Invalid File Type

```javascript
const file = {
  originalname: 'resume.txt',
  mimetype: 'text/plain',
  size: 1024
};

const validation = validateResumeFile(file);
// {
//   valid: false,
//   error: 'Invalid file type. Only pdf or docx files are allowed.'
// }
```

### Missing File

```javascript
const validation = validateResumeFile(null);
// {
//   valid: false,
//   error: 'File name is required'
// }
```

---

## Testing

Run the test suite:

```bash
npm test -- server/tests/services/resumeUploadService.test.js
```

Run with coverage:

```bash
npm run test:coverage -- server/tests/services/resumeUploadService.test.js
```

---

## File Storage Location

```
project-root/
├── server/
│   └── uploads/
│       └── resumes/
│           ├── 8a2f3c6e4b1d9e5a_john_resume.pdf
│           ├── c5e1f3a8b2d4c9e7_jane_resume.docx
│           └── ...
```

Files are stored with a 16-character hex prefix to ensure uniqueness.

---

## Performance Tips

1. **Use async/await** - Always use async functions to avoid blocking
2. **Validate early** - Check file validity before saving
3. **Handle errors** - Wrap in try/catch blocks
4. **Schedule cleanup** - Run `cleanupOldUploads()` regularly
5. **Monitor disk space** - Track uploads directory size

---

## Security Best Practices

1. ✅ Always validate file type and size
2. ✅ Use unique filenames (already handled)
3. ✅ Store outside web root (yes, in `/uploads/`)
4. ✅ Validate against directory traversal (implemented)
5. ✅ Use HTTPS in production
6. ⚠️ Consider adding rate limiting per user
7. ⚠️ Consider virus scanning for production

---

## Troubleshooting

**Q: Files not being saved**
- Check that `server/uploads/resumes/` directory exists
- Verify write permissions on directory
- Check disk space availability

**Q: Can't retrieve uploaded files**
- Ensure filename is correct (copy from response)
- Check file exists in `server/uploads/resumes/`
- Verify no directory traversal attempts in filename

**Q: File validation failing unexpectedly**
- Check file MIME type matches extension
- Verify file size doesn't exceed 10MB
- Ensure filename has proper extension

---

## FAQ

**Q: Can I change the file size limit?**
A: Yes, edit `MAX_FILE_SIZE` in `resumeUploadService.js`:
```javascript
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
```

**Q: Can I add more file types?**
A: Yes, update arrays in `resumeUploadService.js`:
```javascript
const ALLOWED_EXTENSIONS = ['.pdf', '.docx', '.doc'];
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  // ...
];
```

**Q: Where are old files deleted?**
A: Use `cleanupOldUploads(days)` manually or in a cron job.

---

## Support

For issues or questions, refer to:
- Test file: `server/tests/services/resumeUploadService.test.js`
- Completion report: `CHUNK_2_COMPLETION_REPORT.md`
