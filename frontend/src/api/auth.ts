import { apiFetch } from './client';

export type Role = 'STUDENT' | 'RECRUITER' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  role: Role;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface StudentProfile {
  name: string;
  rollNo: string;
  branch: string;
  batch: number;
  cgpa: number;
  backlogs?: number;
  phone?: string;
  resumeUrl?: string;
}

export interface RecruiterProfile {
  fullName: string;
  position?: string;
  companyName: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  role: 'STUDENT' | 'RECRUITER';
  student?: StudentProfile;
  recruiter?: RecruiterProfile;
}

export function loginRequest(email: string, password: string): Promise<LoginResponse> {
  return apiFetch<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export function registerRequest(input: RegisterInput): Promise<User> {
  return apiFetch<User>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function fetchMe(): Promise<User> {
  return apiFetch<User>('/auth/me');
}
