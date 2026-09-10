import { CalendarDays, Clock, MapPin, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Job } from '../../api/jobs';
import { formatDate } from '../../lib/format';
import { StatusBadge } from '../StatusBadge';
import { CompanyLogo } from './CompanyLogo';
import { LpaBadge } from './LpaBadge';

// Recruiter-facing job card with a "View applicants" action. The card body
// links to the shared job details page and shows the same key details as the
// View All Jobs page: location, CTC, posted date and application deadline.
export function RecruiterJobCard({ job }: { job: Job }) {
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
              <p className="truncate text-sm text-slate-500 dark:text-slate-400">{job.role}</p>
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
      </Link>

      <Link to={`/jobs/${job.id}/applicants`} className="btn-secondary w-full">
        <Users className="h-4 w-4" />
        View applicants
      </Link>
    </div>
  );
}
