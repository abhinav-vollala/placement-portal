import { Router } from 'express';
import { z } from 'zod';
import { ApiError } from '../lib/apiError.js';
import { prisma } from '../lib/prisma.js';
import { authenticate } from '../middleware/authenticate.js';
import { requireRole } from '../middleware/authorize.js';
import { checkEligibility } from '../services/eligibility.js';
import type { AuthUser } from '../types/auth.js';

export const jobsRouter = Router();

// NOTE: no `.default()` here on purpose. Defaults are applied in the POST
// handler so that PATCH (which uses `createJobSchema.partial()`) does not
// silently reset omitted fields back to their defaults — e.g. a close/reopen
// that only sends `{ status }` must not overwrite minCgpa or workMode.
const createJobSchema = z.object({
  title: z.string().min(1),
  role: z.string().min(1),
  ctc: z.number().nonnegative(),
  location: z.string().min(1),
  description: z.string().min(1),
  minCgpa: z.number().min(0).max(10).optional(),
  maxBacklogs: z.number().int().min(0).optional(),
  allowedBranches: z.array(z.string()).optional(),
  deadline: z.coerce.date(),
  status: z.enum(['OPEN', 'CLOSED']).optional(),
  employmentType: z.enum(['FULL_TIME', 'INTERNSHIP', 'PART_TIME']).optional(),
  openings: z.number().int().positive().optional(),
  eligibleBatch: z.string().optional(),
  responsibilities: z.string().optional(),
  requirements: z.string().optional(),
  preferredSkills: z.string().optional(),
  experience: z.string().optional(),
  duration: z.string().optional(),
  workMode: z.enum(['ONSITE', 'HYBRID', 'REMOTE']).optional(),
});

// Load a job and verify the caller is the owning recruiter's company (or admin).
async function loadOwnedJob(jobId: string, user: AuthUser) {
  const job = await prisma.job.findUnique({ where: { id: jobId } });
  if (!job) {
    throw new ApiError(404, 'Job not found');
  }

  if (user.role !== 'ADMIN') {
    const recruiter = await prisma.recruiter.findUnique({ where: { userId: user.userId } });
    if (!recruiter || recruiter.companyId !== job.companyId) {
      throw new ApiError(403, 'You do not have access to this job');
    }
  }

  return job;
}

// GET /api/jobs — students browse OPEN jobs; admins see everything.
jobsRouter.get('/', authenticate, async (req, res) => {
  const jobs = await prisma.job.findMany({
    where: req.user!.role === 'ADMIN' ? {} : { status: 'OPEN' },
    include: { company: { select: { id: true, name: true, industry: true, logoUrl: true } } },
    orderBy: { createdAt: 'desc' },
  });
  res.json(jobs);
});

// GET /api/jobs/mine — recruiters list their own company's jobs.
jobsRouter.get('/mine', authenticate, requireRole('RECRUITER', 'ADMIN'), async (req, res) => {
  const recruiter = await prisma.recruiter.findUnique({ where: { userId: req.user!.userId } });
  if (!recruiter && req.user!.role !== 'ADMIN') {
    throw new ApiError(404, 'Recruiter profile not found');
  }
  const jobs = await prisma.job.findMany({
    where: recruiter ? { companyId: recruiter.companyId } : {},
    include: { company: { select: { id: true, name: true, logoUrl: true } } },
    orderBy: { createdAt: 'desc' },
  });
  res.json(jobs);
});

// POST /api/jobs — a recruiter creates a job for their company.
jobsRouter.post('/', authenticate, requireRole('RECRUITER'), async (req, res) => {
  const data = createJobSchema.parse(req.body);
  const recruiter = await prisma.recruiter.findUnique({ where: { userId: req.user!.userId } });
  if (!recruiter) {
    throw new ApiError(404, 'Recruiter profile not found');
  }
  const job = await prisma.job.create({
    data: {
      ...data,
      minCgpa: data.minCgpa ?? 0,
      maxBacklogs: data.maxBacklogs ?? 0,
      allowedBranches: data.allowedBranches ?? [],
      status: data.status ?? 'OPEN',
      employmentType: data.employmentType ?? 'FULL_TIME',
      openings: data.openings ?? 1,
      workMode: data.workMode ?? 'ONSITE',
      companyId: recruiter.companyId,
    },
  });
  res.status(201).json(job);
});

// GET /api/jobs/:id — job detail (any authenticated user).
jobsRouter.get('/:id', authenticate, async (req, res) => {
  const job = await prisma.job.findUnique({
    where: { id: String(req.params.id) },
    include: {
      company: {
        select: {
          id: true,
          name: true,
          industry: true,
          website: true,
          description: true,
          logoUrl: true,
          recruiters: { select: { id: true, fullName: true, position: true }, take: 1 },
        },
      },
    },
  });
  if (!job) {
    throw new ApiError(404, 'Job not found');
  }
  res.json(job);
});

// GET /api/jobs/:id/applications — owner or admin sees applicants.
jobsRouter.get('/:id/applications', authenticate, requireRole('RECRUITER', 'ADMIN'), async (req, res) => {
  const job = await loadOwnedJob(String(req.params.id), req.user!);
  const applications = await prisma.application.findMany({
    where: { jobId: job.id },
    include: {
      job: {
        select: {
          id: true,
          title: true,
          role: true,
          companyId: true,
          status: true,
          deadline: true,
        },
      },
      student: {
        select: {
          id: true,
          name: true,
          rollNo: true,
          branch: true,
          batch: true,
          cgpa: true,
          backlogs: true,
          phone: true,
          resumeUrl: true,
          linkedinUrl: true,
          githubUrl: true,
          photoUrl: true,
          user: {
            select: {
              email: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'asc' },
  });
  res.json(applications);
});

// POST /api/jobs/:id/apply — a student applies (with eligibility + no-double-apply checks).
jobsRouter.post('/:id/apply', authenticate, requireRole('STUDENT'), async (req, res) => {
  const job = await prisma.job.findUnique({ where: { id: String(req.params.id) } });
  if (!job) {
    throw new ApiError(404, 'Job not found');
  }

  const student = await prisma.student.findUnique({ where: { userId: req.user!.userId } });
  if (!student) {
    throw new ApiError(404, 'Student profile not found');
  }

  const eligibility = checkEligibility(student, job);
  if (!eligibility.ok) {
    throw new ApiError(400, eligibility.reasons.join(' '));
  }

  const existing = await prisma.application.findUnique({
    where: { studentId_jobId: { studentId: student.id, jobId: job.id } },
  });
  if (existing) {
    throw new ApiError(409, 'You have already applied to this job');
  }

  const application = await prisma.application.create({
    data: { studentId: student.id, jobId: job.id },
  });
  res.status(201).json(application);
});

// PATCH /api/jobs/:id — owner or admin updates the job.
jobsRouter.patch('/:id', authenticate, requireRole('RECRUITER', 'ADMIN'), async (req, res) => {
  const data = createJobSchema.partial().parse(req.body);
  const job = await loadOwnedJob(String(req.params.id), req.user!);

  // Reopening is only allowed while the application window is still open.
  if (data.status === 'OPEN' && new Date(job.deadline) < new Date()) {
    throw new ApiError(400, 'Cannot reopen a job after its application deadline has passed');
  }

  const updated = await prisma.job.update({ where: { id: job.id }, data });
  res.json(updated);
});

// DELETE /api/jobs/:id — owner or admin deletes the job.
jobsRouter.delete('/:id', authenticate, requireRole('RECRUITER', 'ADMIN'), async (req, res) => {
  const job = await loadOwnedJob(String(req.params.id), req.user!);
  await prisma.job.delete({ where: { id: job.id } });
  res.status(204).end();
});
