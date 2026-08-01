import { Building2, CalendarDays, IndianRupee, MapPin } from 'lucide-react';
import type { Job } from '../../api/jobs';
import { formatDate } from '../../lib/format';
import { StatusBadge } from '../StatusBadge';

// Student-facing job card: company, meta, eligibility chips, Apply button.
export function JobCard({
  job,
  applied,
  applying,
  onApply,
}: {
  job: Job;
  applied: boolean;
  applying: boolean;
  onApply: () => void;
}) {
  const branches =
    job.allowedBranches.length > 0 ? job.allowedBranches.join(', ') : 'All branches';

  return (
    <div className="card flex flex-col p-5 transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl gradient-brand text-white">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-display font-bold text-slate-900">{job.title}</h3>
            <p className="text-sm text-slate-500">{job.company?.name ?? 'Company'}</p>
          </div>
        </div>
        <StatusBadge status={job.status} />
      </div>

      <div className="mb-4 flex flex-wrap gap-x-5 gap-y-1 text-sm text-slate-600">
        <span className="inline-flex items-center gap-1.5">
          <MapPin className="h-4 w-4 text-slate-400" />
          {job.location}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <IndianRupee className="h-4 w-4 text-slate-400" />
          {job.ctc} LPA
        </span>
        <span className="inline-flex items-center gap-1.5">
          <CalendarDays className="h-4 w-4 text-slate-400" />
          Apply by {formatDate(job.deadline)}
        </span>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700">
          CGPA ≥ {job.minCgpa}
        </span>
        <span className="rounded-full bg-violet-50 px-2.5 py-1 text-xs font-medium text-violet-700">
          Backlogs ≤ {job.maxBacklogs}
        </span>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
          {branches}
        </span>
      </div>

      <button className="btn-primary mt-auto w-full" onClick={onApply} disabled={applied || applying}>
        {applied ? 'Applied ✓' : applying ? 'Applying…' : 'Apply Now'}
      </button>
    </div>
  );
}
