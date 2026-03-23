import express from 'express';
import cors from 'cors';
import { db } from './db.js';
import { errorHandler } from './middleware/errorHandler.js';

// Routes
import healthRouter from './routes/health.js';
import candidatesRouter from './routes/candidates.js';
import employeesRouter from './routes/employees.js';
import devicesRouter from './routes/devices.js';
import assignmentsRouter from './routes/assignments.js';
import activitiesRouter from './routes/activities.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use('/api/health', healthRouter);
app.use('/api/candidates', candidatesRouter);
app.use('/api/employees', employeesRouter);
app.use('/api/devices', devicesRouter);
app.use('/api/assignments', assignmentsRouter);
app.use('/api/activities', activitiesRouter);

// Error handling
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`✓ V.Two Ops server running on http://localhost:${PORT}`);
  console.log(`✓ API docs available at http://localhost:${PORT}/api/health`);
});

export default app;
