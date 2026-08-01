import { describe, expect, it } from 'vitest';
import { Prisma } from '../generated/prisma/client.js';
import type { Job, Student } from '../generated/prisma/client.js';
import { checkEligibility } from '../services/eligibility.js';

function makeStudent(overrides: Partial<Student> = {}): Student {
  return {
    id: 's1',
    userId: 'u1',
    name: 'Test Student',
    rollNo: 'CS-001',
    branch: 'CSE',
    batch: 2026,
    cgpa: new Prisma.Decimal(8.0),
    backlogs: 0,
    phone: null,
    resumeUrl: null,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    ...overrides,
  } as unknown as Student;
}

function makeJob(overrides: Partial<Job> = {}): Job {
  return {
    id: 'j1',
    companyId: 'c1',
    title: 'Software Engineer',
    role: 'Fresher',
    ctc: new Prisma.Decimal(8),
    location: 'Bengaluru',
    description: 'Entry-level role.',
    minCgpa: new Prisma.Decimal(0),
    maxBacklogs: 0,
    allowedBranches: [],
    deadline: new Date('2030-12-31'),
    status: 'OPEN',
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    ...overrides,
  } as unknown as Job;
}

describe('checkEligibility', () => {
  it('allows a fully eligible student', () => {
    const result = checkEligibility(makeStudent(), makeJob());
    expect(result.ok).toBe(true);
    expect(result.reasons).toEqual([]);
  });

  it('blocks applications to a CLOSED job', () => {
    const result = checkEligibility(makeStudent(), makeJob({ status: 'CLOSED' }));
    expect(result.ok).toBe(false);
    expect(result.reasons).toContain('This job is not open for applications');
  });

  it('blocks applications after the deadline', () => {
    const job = makeJob({ deadline: new Date('2020-01-01') });
    const result = checkEligibility(makeStudent(), job);
    expect(result.ok).toBe(false);
    expect(result.reasons).toContain('The application deadline has passed');
  });

  it('blocks students below the minimum CGPA', () => {
    const job = makeJob({ minCgpa: new Prisma.Decimal(9.5) });
    const result = checkEligibility(makeStudent({ cgpa: new Prisma.Decimal(8.0) }), job);
    expect(result.ok).toBe(false);
    expect(result.reasons[0]).toMatch(/Minimum CGPA required/);
  });

  it('blocks students with too many backlogs', () => {
    const job = makeJob({ maxBacklogs: 0 });
    const result = checkEligibility(makeStudent({ backlogs: 3 }), job);
    expect(result.ok).toBe(false);
    expect(result.reasons).toContain('Maximum backlogs allowed: 0');
  });

  it('blocks students from disallowed branches', () => {
    const job = makeJob({ allowedBranches: ['CSE', 'IT'] });
    const result = checkEligibility(makeStudent({ branch: 'ECE' }), job);
    expect(result.ok).toBe(false);
    expect(result.reasons).toContain('Only branches CSE, IT are eligible');
  });

  it('treats an empty allowedBranches list as no branch restriction', () => {
    const job = makeJob({ allowedBranches: [] });
    const result = checkEligibility(makeStudent({ branch: 'ECE' }), job);
    expect(result.ok).toBe(true);
  });

  it('accumulates every violation as a separate reason', () => {
    const job = makeJob({ status: 'CLOSED', minCgpa: new Prisma.Decimal(9.5), maxBacklogs: 0 });
    const student = makeStudent({ cgpa: new Prisma.Decimal(6.0), backlogs: 2, branch: 'MECH' });
    const result = checkEligibility(student, job);
    expect(result.reasons).toHaveLength(3);
  });
});
