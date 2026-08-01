import cors from 'cors';
import express from 'express';
import { env } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import { adminRouter } from './routes/admin.js';
import { applicationsRouter } from './routes/applications.js';
import { authRouter } from './routes/auth.js';
import { healthRouter } from './routes/health.js';
import { jobsRouter } from './routes/jobs.js';
import { studentsRouter } from './routes/students.js';

// Builds the Express app without binding to a port, so tests can use it too.
export function createApp() {
  const app = express();

  // Parse incoming JSON request bodies.
  app.use(express.json());

  // Allow the frontend origin to call this API from the browser.
  app.use(cors({ origin: env.CLIENT_URL }));

  // Routes.
  app.use('/api/health', healthRouter);
  app.use('/api/auth', authRouter);
  app.use('/api/students', studentsRouter);
  app.use('/api/jobs', jobsRouter);
  app.use('/api/applications', applicationsRouter);
  app.use('/api/admin', adminRouter);

  // 404 for unknown routes.
  app.use((_req, res) => {
    res.status(404).json({ message: 'Route not found' });
  });

  // Central error handler — always registered last.
  app.use(errorHandler);

  return app;
}
