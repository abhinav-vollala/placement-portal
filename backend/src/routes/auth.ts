import { Router } from 'express';
import { z } from 'zod';
import { ApiError } from '../lib/apiError.js';
import { signToken } from '../lib/jwt.js';
import { hashPassword, verifyPassword } from '../lib/password.js';
import { prisma } from '../lib/prisma.js';
import { authenticate } from '../middleware/authenticate.js';

export const authRouter = Router();

// --- Validation schemas ---

const registerSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    role: z.enum(['STUDENT', 'RECRUITER']),
    student: z
      .object({
        name: z.string().min(1),
        rollNo: z.string().min(1),
        branch: z.string().min(1),
        batch: z.number().int().min(2000).max(2100),
        cgpa: z.number().min(0).max(10),
        backlogs: z.number().int().min(0).default(0),
        phone: z.string().optional(),
        resumeUrl: z.string().url().optional(),
      })
      .optional(),
    recruiter: z
      .object({
        fullName: z.string().min(1),
        position: z.string().optional(),
        companyName: z.string().min(1),
      })
      .optional(),
  })
  .refine((d) => d.role !== 'STUDENT' || d.student, {
    message: 'A student profile is required for the STUDENT role',
    path: ['student'],
  })
  .refine((d) => d.role !== 'RECRUITER' || d.recruiter, {
    message: 'A recruiter profile is required for the RECRUITER role',
    path: ['recruiter'],
  });

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password is required'),
});

// --- Routes ---

// POST /api/auth/register
// Creates a user account and its role-specific profile in one transaction.
authRouter.post('/register', async (req, res) => {
  const data = registerSchema.parse(req.body);

  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) {
    throw new ApiError(409, 'Email is already registered');
  }

  const passwordHash = await hashPassword(data.password);

  const user = await prisma.$transaction(async (tx) => {
    const created = await tx.user.create({
      data: { email: data.email, passwordHash, role: data.role },
    });

    if (data.role === 'STUDENT') {
      const profile = data.student; // guaranteed present by registerSchema
      if (!profile) throw new ApiError(400, 'Student profile required');
      await tx.student.create({ data: { userId: created.id, ...profile } });
    } else {
      const profile = data.recruiter; // guaranteed present by registerSchema
      if (!profile) throw new ApiError(400, 'Recruiter profile required');
      const company = await tx.company.upsert({
        where: { name: profile.companyName },
        update: {},
        create: { name: profile.companyName },
      });
      await tx.recruiter.create({
        data: {
          userId: created.id,
          companyId: company.id,
          fullName: profile.fullName,
          position: profile.position,
        },
      });
    }

    return created;
  });

  res.status(201).json({ id: user.id, email: user.email, role: user.role });
});

// POST /api/auth/login
// Verifies credentials and returns a JWT for the Authorization header.
authRouter.post('/login', async (req, res) => {
  const data = loginSchema.parse(req.body);

  const user = await prisma.user.findUnique({ where: { email: data.email } });
  if (!user) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const valid = await verifyPassword(data.password, user.passwordHash);
  if (!valid) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const token = signToken({ userId: user.id, role: user.role });
  res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
});

// GET /api/auth/me — protected: returns the current user from the token.
authRouter.get('/me', authenticate, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.userId },
    select: { id: true, email: true, role: true },
  });
  if (!user) {
    throw new ApiError(404, 'User not found');
  }
  res.json(user);
});
