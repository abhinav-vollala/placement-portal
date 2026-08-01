import {
  Briefcase,
  Building2,
  Globe,
  Plus,
  TrendingUp,
  Users,
  UserCheck,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { ApiError } from '../api/client';
import { fetchJobApplications, fetchMyJobs, type Job } from '../api/jobs';
import { EmptyState } from '../components/ui/EmptyState';
import { RecruiterJobCard } from '../components/ui/RecruiterJobCard';
import { Spinner } from '../components/ui/Spinner';
import { StatCard } from '../components/ui/StatCard';

function friendlyName(email: string): string {
  const local = email.split('@')[0] ?? 'Recruiter';
  return local.charAt(0).toUpperCase() + local.slice(1);
}

export function RecruiterDashboardPage() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<
    { status: string }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const myJobs = await fetchMyJobs();
      const all = await Promise.all(myJobs.map((job) => fetchJobApplications(job.id)));
      setJobs(myJobs);
      setApplications(all.flat());
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load your dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return <Spinner label="Loading your dashboard…" />;
  }

  const companyName = jobs[0]?.company?.name;
  const companyIndustry = jobs[0]?.company?.industry;
  const shortlisted = applications.filter((a) => a.status === 'SHORTLISTED').length;

  return (
    <div>
      {/* Hero */}
      <section className="gradient-brand relative overflow-hidden rounded-3xl px-6 py-10 text-white shadow-lg sm:px-10">
        <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-20 right-28 h-64 w-64 rounded-full bg-white/10" />
        <p className="text-sm font-semibold uppercase tracking-wider text-indigo-100">Recruiter Dashboard</p>
        <h1 className="mt-1 font-display text-3xl font-extrabold sm:text-4xl">
          Welcome, {companyName ?? (user ? friendlyName(user.email) : 'Recruiter')}
        </h1>
        <p className="mt-2 max-w-xl text-sm text-indigo-100">
          Manage your job postings, review applicants and move the best candidates forward.
        </p>
      </section>

      {error && <p className="form-error mt-6">{error}</p>}

      {/* Statistics */}
      <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total Jobs Posted" value={jobs.length} icon={Briefcase} tone="indigo" />
        <StatCard label="Total Applicants" value={applications.length} icon={Users} tone="violet" />
        <StatCard label="Shortlisted Candidates" value={shortlisted} icon={UserCheck} tone="emerald" />
      </section>

      {/* Company profile */}
      <section className="mt-8">
        <div className="card flex flex-col gap-5 p-6 sm:flex-row sm:items-center">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl gradient-brand font-display text-lg font-bold text-white">
            {(companyName ?? 'C').slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-lg font-bold text-slate-900">
              {companyName ?? 'Your Company'}
            </h2>
            <div className="mt-1 flex flex-wrap gap-x-5 gap-y-1 text-sm text-slate-500">
              {companyIndustry && (
                <span className="inline-flex items-center gap-1.5">
                  <Building2 className="h-4 w-4" />
                  {companyIndustry}
                </span>
              )}
              <span className="inline-flex items-center gap-1.5">
                <TrendingUp className="h-4 w-4" />
                {jobs.length} active posting{jobs.length === 1 ? '' : 's'}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Globe className="h-4 w-4" />
                {jobs[0]?.company?.website ?? 'Website not set'}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Job management */}
      <section className="mt-10">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-xl font-bold text-slate-900">Job Management</h2>
            <p className="mt-0.5 text-sm text-slate-500">
              Post openings and review their applicants.
            </p>
          </div>
          <Link to="/my-jobs" className="btn-primary shrink-0">
            <Plus className="h-4 w-4" />
            Post New Job
          </Link>
        </div>

        {jobs.length === 0 ? (
          <EmptyState
            icon={Building2}
            title="No jobs posted yet"
            subtitle="Post your first job to start receiving applications."
          />
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job) => (
              <RecruiterJobCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
