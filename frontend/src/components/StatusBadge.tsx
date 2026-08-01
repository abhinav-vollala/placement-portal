import type { ApplicationStatus, JobStatus } from '../api/jobs';

// One label + color mapping for every status, shared across all pages.
const config: Record<string, { label: string; className: string }> = {
  OPEN: { label: 'Open', className: 'badge-open' },
  CLOSED: { label: 'Closed', className: 'badge-closed' },
  APPLIED: { label: 'Applied', className: 'badge-applied' },
  SHORTLISTED: { label: 'Shortlisted', className: 'badge-shortlisted' },
  SELECTED: { label: 'Selected', className: 'badge-selected' },
  REJECTED: { label: 'Rejected', className: 'badge-rejected' },
};

export function StatusBadge({ status }: { status: ApplicationStatus | JobStatus }) {
  const c = config[status] ?? { label: status, className: '' };
  return <span className={`badge ${c.className}`}>{c.label}</span>;
}
