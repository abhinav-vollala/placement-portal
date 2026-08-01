import { ClipboardList } from 'lucide-react';
import { useEffect, useState } from 'react';
import { fetchMyApplications } from '../api/applications';
import { ApiError } from '../api/client';
import type { Application } from '../api/jobs';
import { StatusBadge } from '../components/StatusBadge';
import { EmptyState } from '../components/ui/EmptyState';
import { PageHeader } from '../components/ui/PageHeader';
import { Spinner } from '../components/ui/Spinner';
import { formatDate } from '../lib/format';

export function MyApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  return (
    <div>
      <PageHeader
        title="My Applications"
        subtitle="Track the status of every job you have applied to."
      />

      {error && <p className="form-error mb-6">{error}</p>}

      {applications.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No applications yet"
          subtitle="Browse open jobs and apply — your applications will be tracked here."
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
                {applications.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50">
                    <td className="font-medium text-slate-900">{app.job?.title ?? '—'}</td>
                    <td>{app.job?.company?.name ?? '—'}</td>
                    <td>{app.job?.location ?? '—'}</td>
                    <td className="text-slate-500">{formatDate(app.createdAt)}</td>
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
