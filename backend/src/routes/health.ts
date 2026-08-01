import { Router } from 'express';
import { prisma } from '../lib/prisma.js';

export const healthRouter = Router();

// GET /api/health
// Verifies the API is up AND the database is reachable.
healthRouter.get('/', async (_req, res, next) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    next(error);
  }
});
