import type { Job, Student } from '../generated/prisma/client.js';

export interface EligibilityResult {
  ok: boolean;
  reasons: string[];
}

// Pure business logic: can this student apply to this job?
// No database access, no side effects — easy to unit test.
export function checkEligibility(student: Student, job: Job): EligibilityResult {
  const reasons: string[] = [];

  if (job.status !== 'OPEN') {
    reasons.push('This job is not open for applications');
  }

  if (job.deadline.getTime() < Date.now()) {
    reasons.push('The application deadline has passed');
  }

  // CGPA is stored as Decimal; wrap in Number() so `>` compares numerically.
  if (Number(student.cgpa) < Number(job.minCgpa)) {
    reasons.push(`Minimum CGPA required: ${job.minCgpa}`);
  }

  if (student.backlogs > job.maxBacklogs) {
    reasons.push(`Maximum backlogs allowed: ${job.maxBacklogs}`);
  }

  if (job.allowedBranches.length > 0 && !job.allowedBranches.includes(student.branch)) {
    reasons.push(`Only branches ${job.allowedBranches.join(', ')} are eligible`);
  }

  return { ok: reasons.length === 0, reasons };
}
