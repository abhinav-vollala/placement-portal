import type { EmploymentType, WorkMode } from '../api/jobs';

// Friendly display labels for the job enums, shared by forms and the details page.
export const employmentTypeLabels: Record<EmploymentType, string> = {
  FULL_TIME: 'Full-time',
  INTERNSHIP: 'Internship',
  PART_TIME: 'Part-time',
};

export const workModeLabels: Record<WorkMode, string> = {
  ONSITE: 'Onsite',
  HYBRID: 'Hybrid',
  REMOTE: 'Remote',
};
