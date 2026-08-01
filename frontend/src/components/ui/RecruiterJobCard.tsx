import { Building2, CalendarDays, IndianRupee, MapPin, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Job } from '../../api/jobs';
import { formatDate } from '../../lib/format';
import { StatusBadge } from '../StatusBadge';

// Recruiter-facing job card with a "View applicants" action.
export function RecruiterJobCard({ job }: { job: Job }) {
  return (
    <div className="card flex flex-col p-5 transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl gradient-brand text-white">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-display font-bold text-slate-900">{job.title}</h3>
            <p className="text-sm text-slate-500">{job.role}</p>
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

      <Link to={`/jobs/${job.id}/applicants`} className="btn-secondary mt-auto w-full">
        <Users className="h-4 w-4" />
        View applicants
      </Link>
    </div>
  );
}
