import { Router } from 'express';
import { z } from 'zod';
import { ApiError } from '../lib/apiError.js';
import { prisma } from '../lib/prisma.js';
import { authenticate } from '../middleware/authenticate.js';
import { requireRole } from '../middleware/authorize.js';

export const studentsRouter = Router();

// Every route below requires an authenticated STUDENT.
studentsRouter.use(authenticate, requireRole('STUDENT'));

// All fields optional: PATCH only changes what the client sends.
const updateSchema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().optional(),
  resumeUrl: z.string().url().optional(),
  cgpa: z.number().min(0).max(10).optional(),
  backlogs: z.number().int().min(0).optional(),
});

// GET /api/students/me — the caller's own profile.
studentsRouter.get('/me', async (req, res) => {
  const student = await prisma.student.findUnique({
    where: { userId: req.user!.userId },
    include: { user: { select: { email: true } } },
  });
  if (!student) {
    throw new ApiError(404, 'Student profile not found');
  }
  res.json(student);
});

// PATCH /api/students/me — update own profile.
studentsRouter.patch('/me', async (req, res) => {
  const data = updateSchema.parse(req.body);
  const student = await prisma.student.update({
    where: { userId: req.user!.userId },
    data,
  });
  res.json(student);
});
