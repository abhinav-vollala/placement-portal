import { Briefcase, Building2, ClipboardList, GraduationCap, Users } from 'lucide-react';
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
import { PageHeader } from '../components/ui/PageHeader';
import { Spinner } from '../components/ui/Spinner';
import { StatCard } from '../components/ui/StatCard';

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

  if (loading) {
    return <Spinner label="Loading overview…" />;
  }

  return (
    <div>
      <PageHeader title="Admin Overview" subtitle="A snapshot of activity across the portal." />

      {error && <p className="form-error mb-6">{error}</p>}

      {stats && (
        <section className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          <StatCard label="Students" value={stats.students} icon={GraduationCap} tone="indigo" />
          <StatCard label="Recruiters" value={stats.recruiters} icon={Users} tone="violet" />
          <StatCard label="Companies" value={stats.companies} icon={Building2} tone="amber" />
          <StatCard label="Jobs" value={stats.jobs} icon={Briefcase} tone="emerald" />
          <StatCard label="Applications" value={stats.applications} icon={ClipboardList} tone="rose" />
        </section>
      )}

      <section className="mt-10">
        <h2 className="mb-4 font-display text-xl font-bold text-slate-900">Students</h2>
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
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
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="font-medium text-slate-900">{s.name}</td>
                    <td>{s.rollNo}</td>
                    <td>{s.branch}</td>
                    <td>{s.batch}</td>
                    <td>{s.cgpa}</td>
                    <td className="text-slate-500">{s.user?.email ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="mb-4 font-display text-xl font-bold text-slate-900">Companies</h2>
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
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
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="font-medium text-slate-900">{c.name}</td>
                    <td>{c.industry ?? '—'}</td>
                    <td>{c.jobs?.length ?? 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
