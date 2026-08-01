import { apiFetch } from './client';

export interface StudentProfile {
  id: string;
  userId: string;
  name: string;
  rollNo: string;
  branch: string;
  batch: number;
  cgpa: string;
  backlogs: number;
  phone: string | null;
  resumeUrl: string | null;
  user?: { email: string };
  createdAt: string;
  updatedAt: string;
}

// All fields optional: PATCH only sends what the user changed.
export interface UpdateStudentInput {
  name?: string;
  phone?: string;
  resumeUrl?: string;
  cgpa?: number;
  backlogs?: number;
}

export function fetchMyProfile(): Promise<StudentProfile> {
  return apiFetch<StudentProfile>('/students/me');
}

export function updateMyProfile(input: UpdateStudentInput): Promise<StudentProfile> {
  return apiFetch<StudentProfile>('/students/me', {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}
