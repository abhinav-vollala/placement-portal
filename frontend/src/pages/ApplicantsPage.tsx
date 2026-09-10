import { ExternalLink, Users } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { updateApplicationStatus } from '../api/applications';
import { ApiError } from '../api/client';
import { fetchJobApplications, type Application, type ApplicationStatus } from '../api/jobs';
import { StatusBadge } from '../components/StatusBadge';
import { CvResumeIcon } from '../components/ui/BrandIcons';
import { EmptyState } from '../components/ui/EmptyState';
import { PageHeader } from '../components/ui/PageHeader';
import { Spinner } from '../components/ui/Spinner';
import { formatDate } from '../lib/format';

const STATUSES: ApplicationStatus[] = ['APPLIED', 'SHORTLISTED', 'SELECTED', 'REJECTED'];

export function ApplicantsPage() {
  const { id } = useParams<{ id: string }>();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      setApplications(await fetchJobApplications(id));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load applicants');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleStatusChange(applicationId: string, status: ApplicationStatus) {
    setUpdating(applicationId);
    try {
      await updateApplicationStatus(applicationId, status);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to update status');
    } finally {
      setUpdating(null);
    }
  }

  if (loading) {
    return <Spinner label="Loading applicants…" />;
  }

  return (
    <div>
      <p className="mb-4">
        <Link to="/my-jobs" className="text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300">
          ← Back to my jobs
        </Link>
      </p>

      <PageHeader
        title="Applicants"
        subtitle="Review candidates and move them through the pipeline."
      />

      {error && <p className="form-error mb-6">{error}</p>}

      {applications.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No applications yet"
          subtitle="When students apply to this job, their profiles will appear here."
        />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Branch</th>
                  <th>CGPA</th>
                  <th>Resume</th>
                  <th>Applied on</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50 dark:hover:bg-[#1a202c]">
                    <td>
                      <p className="font-medium text-slate-900 dark:text-white">{app.student?.name ?? '—'}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{app.student?.rollNo}</p>
                    </td>
                    <td>{app.student?.branch ?? '—'}</td>
                    <td className="font-medium text-slate-800 dark:text-slate-200">{app.student?.cgpa ?? '—'}</td>
                    <td>
                      {app.student?.resumeUrl ? (
                        <a
                          href={app.student.resumeUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:border-emerald-800/60 dark:text-emerald-300 dark:hover:bg-emerald-900/60"
                        >
                          <CvResumeIcon className="h-4 w-4" />
                          View
                          <ExternalLink className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                        </a>
                      ) : (
                        <span className="text-sm text-slate-400 dark:text-slate-500">No resume</span>
                      )}
                    </td>
                    <td className="text-slate-500 dark:text-slate-400">{formatDate(app.createdAt)}</td>
                    <td>
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge status={app.status} />
                        <select
                          className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-[#262e3d] dark:bg-[#1a202c] dark:text-white"
                          value={app.status}
                          disabled={updating === app.id}
                          onChange={(e) => void handleStatusChange(app.id, e.target.value as ApplicationStatus)}
                        >
                          {STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
