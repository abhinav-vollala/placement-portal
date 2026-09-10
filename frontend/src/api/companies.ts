import { apiFetch, apiFormFetch } from './client';

export interface Company {
  id: string;
  name: string;
  industry: string | null;
  website: string | null;
  description: string | null;
  logoUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

// All fields optional: PATCH only sends what the recruiter changed.
export interface UpdateCompanyInput {
  name?: string;
  industry?: string;
  website?: string;
  description?: string;
  logoUrl?: string;
}

// GET /companies/me — the calling recruiter's own company.
export function fetchMyCompany(): Promise<Company> {
  return apiFetch<Company>('/companies/me');
}

// PATCH /companies/me — update the recruiter's company details.
export function updateMyCompany(input: UpdateCompanyInput): Promise<Company> {
  return apiFetch<Company>('/companies/me', {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

// Upload (or replace) the company profile photo / logo. The server stores the file and returns
// the updated company with the new logoUrl.
export function uploadMyCompanyLogo(file: File): Promise<Company> {
  const form = new FormData();
  form.append('photo', file);
  return apiFormFetch<Company>('/companies/me/logo', form);
}

// Remove the company profile photo / logo and return the updated company.
export function removeMyCompanyLogo(): Promise<Company> {
  return apiFetch<Company>('/companies/me/logo', { method: 'DELETE' });
}

