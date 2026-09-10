import { apiFetch } from './client';

export type JobStatus = 'OPEN' | 'CLOSED';
export type ApplicationStatus = 'APPLIED' | 'SHORTLISTED' | 'SELECTED' | 'REJECTED';
export type EmploymentType = 'FULL_TIME' | 'INTERNSHIP' | 'PART_TIME';
export type WorkMode = 'ONSITE' | 'HYBRID' | 'REMOTE';

export interface CompanySummary {
  id: string;
  name: string;
  industry?: string | null;
  website?: string | null;
  description?: string | null;
  logoUrl?: string | null;
  recruiters?: { id: string; fullName: string; position: string | null }[];
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
  employmentType?: EmploymentType;
  openings?: number;
  eligibleBatch?: string | null;
  responsibilities?: string | null;
  requirements?: string | null;
  preferredSkills?: string | null;
  experience?: string | null;
  duration?: string | null;
  workMode?: WorkMode;
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
  employmentType?: EmploymentType;
  openings?: number;
  eligibleBatch?: string;
  responsibilities?: string;
  requirements?: string;
  preferredSkills?: string;
  experience?: string;
  duration?: string;
  workMode?: WorkMode;
}

export interface ApplicantSummary {
  id: string;
  name: string;
  rollNo: string;
  email?: string | null;
  user?: { email: string };
  branch: string;
  batch?: number | null;
  cgpa: string;
  backlogs: number;
  phone?: string | null;
  resumeUrl?: string | null;
  linkedinUrl?: string | null;
  githubUrl?: string | null;
  photoUrl?: string | null;
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

export function fetchJob(id: string): Promise<Job> {
  return apiFetch<Job>(`/jobs/${id}`);
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
