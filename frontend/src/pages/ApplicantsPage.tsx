import { ExternalLink, FileText, Users } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { updateApplicationStatus } from '../api/applications';
import { ApiError } from '../api/client';
import { fetchJobApplications, type Application, type ApplicationStatus } from '../api/jobs';
import { StatusBadge } from '../components/StatusBadge';
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
        <Link to="/my-jobs" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
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
                  <tr key={app.id} className="hover:bg-slate-50">
                    <td>
                      <p className="font-medium text-slate-900">{app.student?.name ?? '—'}</p>
                      <p className="text-xs text-slate-500">{app.student?.rollNo}</p>
                    </td>
                    <td>{app.student?.branch ?? '—'}</td>
                    <td className="font-medium text-slate-800">{app.student?.cgpa ?? '—'}</td>
                    <td>
                      {app.student?.resumeUrl ? (
                        <a
                          href={app.student.resumeUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 hover:bg-indigo-100"
                        >
                          <FileText className="h-3.5 w-3.5" />
                          View
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : (
                        <span className="text-sm text-slate-400">No resume</span>
                      )}
                    </td>
                    <td className="text-slate-500">{formatDate(app.createdAt)}</td>
                    <td>
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge status={app.status} />
                        <select
                          className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
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
