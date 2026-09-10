import { apiFetch, apiFormFetch } from './client';

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
  linkedinUrl: string | null;
  githubUrl: string | null;
  photoUrl: string | null;
  user?: { email: string };
  createdAt: string;
  updatedAt: string;
}

// All fields optional: PATCH only sends what the user changed.
export interface UpdateStudentInput {
  name?: string;
  phone?: string;
  resumeUrl?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  branch?: string;
  batch?: number;
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

// Upload (or replace) the profile photo. The server stores the file and returns
// the updated profile with the new photoUrl.
export function uploadMyPhoto(file: File): Promise<StudentProfile> {
  const form = new FormData();
  form.append('photo', file);
  return apiFormFetch<StudentProfile>('/students/me/photo', form);
}

// Remove the profile photo and return the updated profile.
export function removeMyPhoto(): Promise<StudentProfile> {
  return apiFetch<StudentProfile>('/students/me/photo', { method: 'DELETE' });
}
