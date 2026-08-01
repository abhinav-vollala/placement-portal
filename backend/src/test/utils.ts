import request from 'supertest';
import { createApp } from '../app.js';
import { prisma } from '../lib/prisma.js';

export const app = createApp();

// Shape accepted by POST /api/jobs (deadline as an ISO date string).
interface JobInput {
  title: string;
  role: string;
  ctc: number;
  location: string;
  description: string;
  minCgpa?: number;
  maxBacklogs?: number;
  allowedBranches?: string[];
  deadline: string;
  status?: 'OPEN' | 'CLOSED';
}

const PASSWORD = 'password123';

// Wipe every table so tests never share state (order-independent).
export async function resetDb(): Promise<void> {
  await prisma.$executeRawUnsafe(
    'TRUNCATE TABLE "User", "Student", "Recruiter", "Company", "Job", "Application", "Announcement" CASCADE',
  );
}

interface StudentOptions {
  email?: string;
  name?: string;
  rollNo?: string;
  branch?: string;
  cgpa?: number;
  backlogs?: number;
}

// Register + login a student over the real endpoints; returns the token.
export async function makeStudent(opts: StudentOptions = {}) {
  const email = opts.email ?? `stu-${Math.random().toString(36).slice(2)}@test.edu`;
  const res = await request(app).post('/api/auth/register').send({
    email,
    password: PASSWORD,
    role: 'STUDENT',
    student: {
      name: opts.name ?? 'Test Student',
      rollNo: opts.rollNo ?? 'CS-100',
      branch: opts.branch ?? 'CSE',
      batch: 2026,
      cgpa: opts.cgpa ?? 8.0,
      backlogs: opts.backlogs ?? 0,
    },
  });
  if (res.status !== 201) {
    throw new Error(`makeStudent failed: ${JSON.stringify(res.body)}`);
  }
  const login = await request(app).post('/api/auth/login').send({ email, password: PASSWORD });
  return { email, userId: res.body.id as string, token: login.body.token as string };
}

interface RecruiterOptions {
  email?: string;
  companyName?: string;
}

// Register + login a recruiter (creates their company too).
export async function makeRecruiter(opts: RecruiterOptions = {}) {
  const email = opts.email ?? `rec-${Math.random().toString(36).slice(2)}@test.com`;
  const companyName = opts.companyName ?? `Company ${Math.random().toString(36).slice(2)}`;
  const res = await request(app).post('/api/auth/register').send({
    email,
    password: PASSWORD,
    role: 'RECRUITER',
    recruiter: { fullName: 'Test Recruiter', position: 'HR', companyName },
  });
  if (res.status !== 201) {
    throw new Error(`makeRecruiter failed: ${JSON.stringify(res.body)}`);
  }
  const login = await request(app).post('/api/auth/login').send({ email, password: PASSWORD });
  return { email, companyName, userId: res.body.id as string, token: login.body.token as string };
}

// Post a job as the given recruiter, with overridable fields.
export async function createJob(token: string, overrides: Partial<JobInput> = {}) {
  const input: JobInput = {
    title: 'Software Engineer',
    role: 'Fresher',
    ctc: 8,
    location: 'Bengaluru',
    description: 'Entry-level engineering role.',
    minCgpa: 0,
    maxBacklogs: 0,
    allowedBranches: [],
    deadline: new Date('2030-12-31').toISOString(),
    ...overrides,
  };
  const res = await request(app).post('/api/jobs').set('Authorization', `Bearer ${token}`).send(input);
  if (res.status !== 201) {
    throw new Error(`createJob failed: ${JSON.stringify(res.body)}`);
  }
  return res.body as { id: string; companyId: string; [key: string]: unknown };
}
