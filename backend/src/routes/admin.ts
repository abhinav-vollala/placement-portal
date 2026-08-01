import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticate } from '../middleware/authenticate.js';
import { requireRole } from '../middleware/authorize.js';

export const adminRouter = Router();

// Every route in this router requires an authenticated ADMIN.
adminRouter.use(authenticate, requireRole('ADMIN'));

// GET /api/admin/stats — dashboard counts.
adminRouter.get('/stats', async (_req, res) => {
  const [students, recruiters, companies, jobs, applications] = await Promise.all([
    prisma.student.count(),
    prisma.recruiter.count(),
    prisma.company.count(),
    prisma.job.count(),
    prisma.application.count(),
  ]);
  res.json({ students, recruiters, companies, jobs, applications });
});

// GET /api/admin/students
adminRouter.get('/students', async (_req, res) => {
  const students = await prisma.student.findMany({
    include: { user: { select: { email: true } } },
    orderBy: { rollNo: 'asc' },
  });
  res.json(students);
});

// GET /api/admin/companies
adminRouter.get('/companies', async (_req, res) => {
  const companies = await prisma.company.findMany({
    include: { jobs: { select: { id: true, title: true } } },
    orderBy: { name: 'asc' },
  });
  res.json(companies);
});
