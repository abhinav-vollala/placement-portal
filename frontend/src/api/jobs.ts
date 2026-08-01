import { apiFetch } from './client';

export type JobStatus = 'OPEN' | 'CLOSED';
export type ApplicationStatus = 'APPLIED' | 'SHORTLISTED' | 'SELECTED' | 'REJECTED';

export interface CompanySummary {
  id: string;
  name: string;
  industry?: string | null;
  website?: string | null;
  description?: string | null;
}

// Prisma serializes Decimal fields (ctc, minCgpa, cgpa) as strings in JSON.
export interface Job {
  id: string;
  companyId: string;
  title: string;
  role: string;
  ctc: string;
  location: string;
  description: string;
  minCgpa: string;
  maxBacklogs: number;
  allowedBranches: string[];
  deadline: string;
  status: JobStatus;
  company?: CompanySummary;
  createdAt: string;
  updatedAt: string;
}

export interface CreateJobInput {
  title: string;
  role: string;
  ctc: number;
  location: string;
  description: string;
  minCgpa?: number;
  maxBacklogs?: number;
  allowedBranches?: string[];
  deadline: string; // ISO date
  status?: JobStatus;
}

export interface ApplicantSummary {
  id: string;
  name: string;
  rollNo: string;
  branch: string;
  cgpa: string;
  backlogs: number;
  resumeUrl?: string | null;
}

export interface Application {
  id: string;
  studentId: string;
  jobId: string;
  status: ApplicationStatus;
  createdAt: string;
  updatedAt: string;
  job?: Job;
  student?: ApplicantSummary;
}

export function fetchJobs(): Promise<Job[]> {
  return apiFetch<Job[]>('/jobs');
}

export function fetchMyJobs(): Promise<Job[]> {
  return apiFetch<Job[]>('/jobs/mine');
}

export function createJob(input: CreateJobInput): Promise<Job> {
  return apiFetch<Job>('/jobs', { method: 'POST', body: JSON.stringify(input) });
}

export function updateJob(id: string, input: Partial<CreateJobInput>): Promise<Job> {
  return apiFetch<Job>(`/jobs/${id}`, { method: 'PATCH', body: JSON.stringify(input) });
}

export function deleteJob(id: string): Promise<void> {
  return apiFetch<void>(`/jobs/${id}`, { method: 'DELETE' });
}

export function applyToJob(id: string): Promise<Application> {
  return apiFetch<Application>(`/jobs/${id}/apply`, { method: 'POST' });
}

export function fetchJobApplications(id: string): Promise<Application[]> {
  return apiFetch<Application[]>(`/jobs/${id}/applications`);
}
