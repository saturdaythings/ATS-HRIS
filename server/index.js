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
import tracksRouter from './routes/tracks.js';
import trackTemplatesRouter from './routes/trackTemplates.js';
import configListsRouter from './routes/configLists.js';
import exportsRouter from './routes/exports.js';
import searchRouter from './routes/search.js';
import assistantRouter from './routes/assistant.js';
import templatesRouter from './routes/admin/templates.js';
import adminSettingsRouter from './routes/admin/settings.js';
import featureRequestsRouter from './routes/admin/featureRequests.js';
import adminHealthRouter from './routes/admin/health.js';

const app = express();
const PORT = process.env.PORT || 3001;

// CORS Configuration for different environments
const getCorsOptions = () => {
  const NODE_ENV = process.env.NODE_ENV || 'development';
  const origins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:5173',
    'http://localhost:8000',
    'http://localhost:8080',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
    'http://127.0.0.1:5173',
  ];

  if (NODE_ENV === 'production') {
    // Add production frontend URLs
    if (process.env.FRONTEND_URL) {
      origins.push(process.env.FRONTEND_URL);
    }
    // Support GitHub Pages and Vercel deployments
    origins.push(/github\.io$/);
    origins.push(/vercel\.app$/);
  }

  return {
    origin: origins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  };
};

// Middleware
app.use(express.json());
app.use(cors(getCorsOptions()));

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
app.use('/api/admin/templates', templatesRouter);
app.use('/api/admin/settings', adminSettingsRouter);
app.use('/api/admin/feature-requests', featureRequestsRouter);
app.use('/api/admin/health', adminHealthRouter);
app.use('/api/claude', claudeRouter);
app.use('/api/tracks', tracksRouter);
app.use('/api/track-templates', trackTemplatesRouter);
app.use('/api/config-lists', configListsRouter);
app.use('/api/exports', exportsRouter);
app.use('/api/search', searchRouter);
app.use('/api/assistant', assistantRouter);

// Error handling
app.use(errorHandler);

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✓ Server running on http://0.0.0.0:${PORT}`);
  console.log(`✓ Local access: http://localhost:${PORT}`);
  console.log(`✓ Network access: http://<your-ip>:${PORT}`);
  console.log(`✓ API docs available at http://localhost:${PORT}/api/health`);
});

export default app;
