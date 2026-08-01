import { useEffect, useState } from 'react';
import {
  fetchCompanies,
  fetchStats,
  fetchStudents,
  type AdminStats,
  type CompanyRecord,
  type StudentRecord,
} from '../api/admin';
import { ApiError } from '../api/client';

export function AdminPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [companies, setCompanies] = useState<CompanyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([fetchStats(), fetchStudents(), fetchCompanies()])
      .then(([s, st, c]) => {
        setStats(s);
        setStudents(st);
        setCompanies(c);
      })
      .catch((err: unknown) => {
        setError(err instanceof ApiError ? err.message : 'Failed to load admin data');
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading overview…</p>;

  return (
    <div>
      <h1>Admin Overview</h1>
      {error && <p className="form-error">{error}</p>}

      {stats && (
        <div className="stat-grid">
          <div className="stat-card">
            <strong>{stats.students}</strong>
            <span>Students</span>
          </div>
          <div className="stat-card">
            <strong>{stats.recruiters}</strong>
            <span>Recruiters</span>
          </div>
          <div className="stat-card">
            <strong>{stats.companies}</strong>
            <span>Companies</span>
          </div>
          <div className="stat-card">
            <strong>{stats.jobs}</strong>
            <span>Jobs</span>
          </div>
          <div className="stat-card">
            <strong>{stats.applications}</strong>
            <span>Applications</span>
          </div>
        </div>
      )}

      <h2>Students</h2>
      <table className="data-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Roll no</th>
            <th>Branch</th>
            <th>Batch</th>
            <th>CGPA</th>
            <th>Email</th>
          </tr>
        </thead>
        <tbody>
          {students.map((s) => (
            <tr key={s.id}>
              <td>{s.name}</td>
              <td>{s.rollNo}</td>
              <td>{s.branch}</td>
              <td>{s.batch}</td>
              <td>{s.cgpa}</td>
              <td>{s.user?.email ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Companies</h2>
      <table className="data-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Industry</th>
            <th>Open jobs</th>
          </tr>
        </thead>
        <tbody>
          {companies.map((c) => (
            <tr key={c.id}>
              <td>{c.name}</td>
              <td>{c.industry ?? '—'}</td>
              <td>{c.jobs?.length ?? 0}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
