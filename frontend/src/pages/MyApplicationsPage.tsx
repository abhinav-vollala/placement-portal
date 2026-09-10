import { ClipboardList, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { fetchMyApplications } from '../api/applications';
import { ApiError } from '../api/client';
import type { Application, ApplicationStatus } from '../api/jobs';
import { StatusBadge } from '../components/StatusBadge';
import { EmptyState } from '../components/ui/EmptyState';
import { PageHeader } from '../components/ui/PageHeader';
import { Spinner } from '../components/ui/Spinner';
import { formatDate } from '../lib/format';

const statusLabels: Record<string, string> = {
  APPLIED: 'Pending',
  SHORTLISTED: 'Shortlisted',
  SELECTED: 'Selected',
  REJECTED: 'Rejected',
};

export function MyApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchParams] = useSearchParams();

  useEffect(() => {
    fetchMyApplications()
      .then(setApplications)
      .catch((err: unknown) => {
        setError(err instanceof ApiError ? err.message : 'Failed to load applications');
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <Spinner label="Loading applications…" />;
  }

  const statusFilter = searchParams.get('status');
  const filtered =
    statusFilter && statusFilter in statusLabels
      ? applications.filter((a) => a.status === (statusFilter as ApplicationStatus))
      : applications;

  return (
    <div>
      <PageHeader
        title="My Applications"
        subtitle="Track the status of every job you have applied to."
      />

      {error && <p className="form-error mb-6">{error}</p>}

      {statusFilter && statusFilter in statusLabels && (
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Showing <span className="font-semibold text-slate-900 dark:text-white">{statusLabels[statusFilter]}</span>{' '}
            applications ({filtered.length}).
          </p>
          <Link
            to="/applications"
            className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            Clear filter
            <X className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}

      {filtered.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title={
            statusFilter && statusFilter in statusLabels
              ? `No ${statusLabels[statusFilter].toLowerCase()} applications yet`
              : 'No applications yet'
          }
          subtitle={
            statusFilter && statusFilter in statusLabels
              ? 'Applications in this stage will appear here.'
              : 'Browse open jobs and apply — your applications will be tracked here.'
          }
        />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Job</th>
                  <th>Company</th>
                  <th>Location</th>
                  <th>Applied on</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50 transition-colors duration-150 dark:hover:bg-[#1a202c]">
                    <td className="font-medium text-slate-900 dark:text-white">{app.job?.title ?? '—'}</td>
                    <td className="text-slate-700 dark:text-slate-300">{app.job?.company?.name ?? '—'}</td>
                    <td className="text-slate-700 dark:text-slate-300">{app.job?.location ?? '—'}</td>
                    <td className="text-slate-500 dark:text-slate-400">{formatDate(app.createdAt)}</td>
                    <td>
                      <StatusBadge status={app.status} />
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
