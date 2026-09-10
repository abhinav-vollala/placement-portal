import { AlertCircle, CalendarDays, Clock, MapPin, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Job, ApplicantSummary } from '../../api/jobs';
import { formatDate } from '../../lib/format';
import { StatusBadge } from '../StatusBadge';
import { CompanyLogo } from './CompanyLogo';
import { LpaBadge } from './LpaBadge';

interface JobCardProps {
  job: Job;
  applied: boolean;
  applying: boolean;
  onApply: () => void;
  /** Error message returned by the backend after a failed Apply attempt.
   *  Only set after the student has clicked Apply and the server rejected it.
   *  Must be null/undefined before any Apply attempt so the card stays clean. */
  applyError?: string | null;
  profile?: ApplicantSummary | null;
}

// Student-facing job card: company logo, meta, eligibility chips, Apply button.
// The card body links to the job details page; the button stays separate.
// Layout matches RecruiterJobCard: location + CTC on first row, posted date + deadline on second row.
//
// Eligibility is NEVER shown proactively. It is only surfaced after an Apply
// attempt fails — via the `applyError` prop — and only on that specific card.
export function JobCard({
  job,
  applied,
  applying,
  onApply,
  applyError,
  // profile is kept in the interface for backwards-compat but not used for proactive checks
}: JobCardProps) {
  const branches =
    job.allowedBranches.length > 0 ? job.allowedBranches.join(', ') : 'All branches';

  // Priority:
  //   1. Already applied → Applied ✓ (never overridden by applyError)
  //   2. Currently applying → Applying…
  //   3. Apply failed → Not Eligible (with reason)
  //   4. Default → Apply Now
  const isDisabled = applied || applying || (!!applyError && !applied);
  const buttonLabel = applied
    ? 'Applied ✓'
    : applying
      ? 'Applying…'
      : applyError
        ? 'Not Eligible'
        : 'Apply Now';

  return (
    <div className="card flex flex-col p-5 overflow-hidden transition duration-200 hover:-translate-y-1 hover:shadow-lg dark:hover:border-[#374256] dark:hover:shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
      <Link to={`/jobs/${job.id}`} className="group block flex-1 min-w-0">
        <div className="mb-4 flex items-start justify-between gap-2 overflow-hidden">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <CompanyLogo name={job.company?.name} logoUrl={job.company?.logoUrl} />
            <div className="min-w-0 flex-1">
              <h3
                className="truncate font-display font-bold text-slate-900 transition group-hover:text-indigo-700 dark:text-slate-100 dark:group-hover:text-indigo-400"
                title={job.title}
              >
                {job.title}
              </h3>
              <p className="truncate text-sm text-slate-500 dark:text-slate-400">{job.company?.name ?? 'Company'}</p>
            </div>
          </div>
          <div className="shrink-0 pt-0.5">
            <StatusBadge status={job.status} />
          </div>
        </div>

        <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
          <span className="inline-flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
            <MapPin className="h-4 w-4 text-rose-500 shrink-0" />
            {job.location}
          </span>
          <LpaBadge ctc={job.ctc} className="ml-auto" />
        </div>

        <div className="mb-4 space-y-1.5 text-xs">
          <p className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
            <Clock className="h-3.5 w-3.5 text-sky-500 shrink-0" />
            <span>
              Posted <span className="font-medium text-slate-700 dark:text-slate-200">{formatDate(job.createdAt)}</span>
            </span>
          </p>
          <p className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
            <CalendarDays className="h-3.5 w-3.5 text-amber-500 shrink-0" />
            <span>
              Application Deadline{' '}
              <span className="font-medium text-amber-700 dark:text-amber-400">{formatDate(job.deadline)}</span>
            </span>
          </p>
        </div>

        <div className="mb-5 flex flex-wrap gap-2">
          <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
            CGPA ≥ {job.minCgpa}
          </span>
          <span className="rounded-full bg-violet-50 px-2.5 py-1 text-xs font-medium text-violet-700 dark:bg-violet-950/60 dark:text-violet-300">
            Backlogs ≤ {job.maxBacklogs}
          </span>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            {branches}
          </span>
        </div>

        {/* Eligibility error — shown ONLY after a failed Apply attempt, ONLY if not already applied */}
        {applyError && !applied && (
          <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 p-3 dark:border-rose-900/50 dark:bg-rose-950/40">
            <div className="mb-1.5 flex items-center gap-2 text-sm">
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600 dark:bg-rose-900/60 dark:text-rose-300">
                <XCircle className="h-3 w-3" />
              </div>
              <span className="font-semibold text-rose-700 dark:text-rose-300">Not eligible</span>
            </div>
            <div className="ml-7 flex items-start gap-1.5 text-xs text-rose-600 dark:text-rose-300">
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 flex-shrink-0" />
              <span>{applyError}</span>
            </div>
          </div>
        )}
      </Link>

      <button
        className="btn-primary w-full"
        onClick={onApply}
        disabled={isDisabled}
      >
        {buttonLabel}
      </button>
    </div>
  );
}
