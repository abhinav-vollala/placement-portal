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

// Tailwind pill styles per status (light + dark mode).
const styles: Record<Status, string> = {
  OPEN: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-950/60 dark:text-emerald-300 dark:ring-emerald-500/30',
  CLOSED: 'bg-slate-100 text-slate-600 ring-slate-500/20 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700/50',
  APPLIED: 'bg-indigo-50 text-indigo-700 ring-indigo-600/20 dark:bg-indigo-950/60 dark:text-indigo-300 dark:ring-indigo-500/30',
  SHORTLISTED: 'bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-950/60 dark:text-amber-300 dark:ring-amber-500/30',
  SELECTED: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-950/60 dark:text-emerald-300 dark:ring-emerald-500/30',
  REJECTED: 'bg-rose-50 text-rose-700 ring-rose-600/20 dark:bg-rose-950/60 dark:text-rose-300 dark:ring-rose-500/30',
};

export function StatusBadge({ status }: { status: Status }) {
  return (
    <span
      className={`inline-flex shrink-0 whitespace-nowrap items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${
        styles[status] ?? 'bg-slate-100 text-slate-600 ring-slate-500/20 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700/50'
      }`}
    >
      {labels[status] ?? status}
    </span>
  );
}
