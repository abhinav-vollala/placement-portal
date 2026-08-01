import { apiFetch } from './client';
import type { Application, ApplicationStatus } from './jobs';

export function fetchMyApplications(): Promise<Application[]> {
  return apiFetch<Application[]>('/applications/me');
}

export function fetchAllApplications(): Promise<Application[]> {
  return apiFetch<Application[]>('/applications');
}

export function updateApplicationStatus(id: string, status: ApplicationStatus): Promise<Application> {
  return apiFetch<Application>(`/applications/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}
