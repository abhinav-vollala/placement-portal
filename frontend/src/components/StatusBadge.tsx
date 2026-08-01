import type { ApplicationStatus, JobStatus } from '../api/jobs';

type Status = ApplicationStatus | JobStatus;

// Friendly label per status (kept stable so tests and markup stay intact).
const labels: Record<Status, string> = {
  OPEN: 'Open',
  CLOSED: 'Closed',
  APPLIED: 'Applied',
  SHORTLISTED: 'Shortlisted',
  SELECTED: 'Selected',
  REJECTED: 'Rejected',
};

// Tailwind pill styles per status.
const styles: Record<Status, string> = {
  OPEN: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  CLOSED: 'bg-slate-100 text-slate-600 ring-slate-500/20',
  APPLIED: 'bg-indigo-50 text-indigo-700 ring-indigo-600/20',
  SHORTLISTED: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  SELECTED: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  REJECTED: 'bg-rose-50 text-rose-700 ring-rose-600/20',
};

export function StatusBadge({ status }: { status: Status }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${
        styles[status] ?? 'bg-slate-100 text-slate-600 ring-slate-500/20'
      }`}
    >
      {labels[status] ?? status}
    </span>
  );
}
