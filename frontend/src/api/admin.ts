import { apiFetch } from './client';
import type { Job } from './jobs';

export interface AdminStats {
  students: number;
  recruiters: number;
  companies: number;
  jobs: number;
  applications: number;
}

export interface StudentRecord {
  id: string;
  userId: string;
  name: string;
  rollNo: string;
  branch: string;
  batch: number;
  cgpa: string;
  backlogs: number;
  phone?: string | null;
  resumeUrl?: string | null;
  user?: { email: string };
}

export interface CompanyRecord {
  id: string;
  name: string;
  industry?: string | null;
  website?: string | null;
  description?: string | null;
  jobs?: Pick<Job, 'id' | 'title'>[];
}

export function fetchStats(): Promise<AdminStats> {
  return apiFetch<AdminStats>('/admin/stats');
}

export function fetchStudents(): Promise<StudentRecord[]> {
  return apiFetch<StudentRecord[]>('/admin/students');
}

export function fetchCompanies(): Promise<CompanyRecord[]> {
  return apiFetch<CompanyRecord[]>('/admin/companies');
}
