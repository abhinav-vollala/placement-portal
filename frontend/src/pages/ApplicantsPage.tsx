import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { updateApplicationStatus } from '../api/applications';
import { ApiError } from '../api/client';
import { fetchJobApplications, type Application, type ApplicationStatus } from '../api/jobs';
import { StatusBadge } from '../components/StatusBadge';

const STATUSES: ApplicationStatus[] = ['APPLIED', 'SHORTLISTED', 'SELECTED', 'REJECTED'];

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString();
}

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

  if (loading) return <p>Loading applicants…</p>;

  return (
    <div>
      <p>
        <Link to="/my-jobs">← Back to my jobs</Link>
      </p>
      <h1>Applicants</h1>
      {error && <p className="form-error">{error}</p>}
      {applications.length === 0 && <p>No applications for this job yet.</p>}

      <table className="data-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Roll no</th>
            <th>Branch</th>
            <th>CGPA</th>
            <th>Backlogs</th>
            <th>Applied on</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {applications.map((app) => (
            <tr key={app.id}>
              <td>{app.student?.name ?? '—'}</td>
              <td>{app.student?.rollNo ?? '—'}</td>
              <td>{app.student?.branch ?? '—'}</td>
              <td>{app.student?.cgpa ?? '—'}</td>
              <td>{app.student?.backlogs ?? '—'}</td>
              <td>{formatDate(app.createdAt)}</td>
              <td>
                <div className="status-control">
                  <StatusBadge status={app.status} />
                  <select
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
  );
}
