import { useEffect, useState } from 'react';
import { fetchMyApplications } from '../api/applications';
import { ApiError } from '../api/client';
import type { Application } from '../api/jobs';
import { StatusBadge } from '../components/StatusBadge';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString();
}

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

  if (loading) return <p>Loading applications…</p>;

  return (
    <div>
      <h1>My Applications</h1>
      {error && <p className="form-error">{error}</p>}
      {applications.length === 0 && <p>You have not applied to any jobs yet.</p>}

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
            <tr key={app.id}>
              <td>{app.job?.title ?? '—'}</td>
              <td>{app.job?.company?.name ?? '—'}</td>
              <td>{app.job?.location ?? '—'}</td>
              <td>{formatDate(app.createdAt)}</td>
              <td>
                <StatusBadge status={app.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
