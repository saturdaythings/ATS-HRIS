import express from 'express';
import cors from 'cors';
import session from 'express-session';
import { db } from './db.js';
import { errorHandler } from './middleware/errorHandler.js';

// Routes
import healthRouter from './routes/health.js';
import authRouter from './routes/auth.js';
import settingsRouter from './routes/settings.js';
import candidatesRouter from './routes/candidates.js';
import employeesRouter from './routes/employees.js';
import interviewsRouter from './routes/interviews.js';
import offersRouter from './routes/offers.js';
import devicesRouter from './routes/devices.js';
import onboardingRouter from './routes/onboarding.js';
import dashboardRouter from './routes/dashboard.js';
import assignmentsRouter from './routes/assignments.js';
import activitiesRouter from './routes/activities.js';
import notificationsRouter from './routes/notifications.js';
import customFieldsRouter from './routes/admin/customFields.js';
import claudeRouter from './routes/claude.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(cors());

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-secret-change-in-prod',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 1000 * 60 * 60 * 24 } // 24 hours
}));

// Routes
app.use('/api/health', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/candidates', candidatesRouter);
app.use('/api/employees', employeesRouter);
app.use('/api/interviews', interviewsRouter);
app.use('/api/offers', offersRouter);
app.use('/api/devices', devicesRouter);
app.use('/api/onboarding', onboardingRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/assignments', assignmentsRouter);
app.use('/api/activities', activitiesRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/admin/custom-fields', customFieldsRouter);
app.use('/api/claude', claudeRouter);

// Error handling
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`✓ V.Two Ops server running on http://localhost:${PORT}`);
  console.log(`✓ API docs available at http://localhost:${PORT}/api/health`);
});

export default app;
