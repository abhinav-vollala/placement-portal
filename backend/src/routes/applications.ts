import { Router } from 'express';
import { z } from 'zod';
import { ApiError } from '../lib/apiError.js';
import { prisma } from '../lib/prisma.js';
import { authenticate } from '../middleware/authenticate.js';
import { requireRole } from '../middleware/authorize.js';

export const applicationsRouter = Router();

// GET /api/applications/me — a student's own applications.
applicationsRouter.get('/me', authenticate, requireRole('STUDENT'), async (req, res) => {
  const student = await prisma.student.findUnique({ where: { userId: req.user!.userId } });
  if (!student) {
    throw new ApiError(404, 'Student profile not found');
  }
  const applications = await prisma.application.findMany({
    where: { studentId: student.id },
    include: { job: { include: { company: { select: { id: true, name: true } } } } },
    orderBy: { createdAt: 'desc' },
  });
  res.json(applications);
});

// GET /api/applications — admins see every application.
applicationsRouter.get('/', authenticate, requireRole('ADMIN'), async (_req, res) => {
  const applications = await prisma.application.findMany({
    include: {
      student: { select: { id: true, name: true, rollNo: true } },
      job: { select: { id: true, title: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
  res.json(applications);
});

const statusSchema = z.object({
  status: z.enum(['APPLIED', 'SHORTLISTED', 'SELECTED', 'REJECTED']),
});

// PATCH /api/applications/:id — owning recruiter (or admin) moves the status.
applicationsRouter.patch('/:id', authenticate, requireRole('RECRUITER', 'ADMIN'), async (req, res) => {
  const { status } = statusSchema.parse(req.body);

  const application = await prisma.application.findUnique({
    where: { id: String(req.params.id) },
    include: { job: { select: { companyId: true } } },
  });
  if (!application) {
    throw new ApiError(404, 'Application not found');
  }

  if (req.user!.role !== 'ADMIN') {
    const recruiter = await prisma.recruiter.findUnique({ where: { userId: req.user!.userId } });
    if (!recruiter || recruiter.companyId !== application.job.companyId) {
      throw new ApiError(403, 'You cannot modify this application');
    }
  }

  const updated = await prisma.application.update({
    where: { id: application.id },
    data: { status },
  });
  res.json(updated);
});
