import {
  Award,
  Briefcase,
  Building2,
  CalendarDays,
  FileText,
  GraduationCap,
  Hourglass,
  Inbox,
  Phone,
  Send,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchMyApplications } from '../api/applications';
import { ApiError } from '../api/client';
import { applyToJob, fetchJobs, type Application, type Job } from '../api/jobs';
import { fetchMyProfile, type StudentProfile } from '../api/students';
import { EmptyState } from '../components/ui/EmptyState';
import { JobCard } from '../components/ui/JobCard';
import { Spinner } from '../components/ui/Spinner';
import { StatCard } from '../components/ui/StatCard';
import { yearOfStudy } from '../lib/format';

function initials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function StudentDashboardPage() {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [applying, setApplying] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [profileData, applicationsData, jobsData] = await Promise.all([
        fetchMyProfile(),
        fetchMyApplications(),
        fetchJobs(),
      ]);
      setProfile(profileData);
      setApplications(applicationsData);
      setJobs(jobsData);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load your dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleApply(job: Job) {
    if (applying) return;
    setApplying(job.id);
    try {
      const application = await applyToJob(job.id);
      // Optimistically reflect the new application without a full refetch.
      setApplications((prev) => [...prev, application]);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Application failed');
    } finally {
      setApplying(null);
    }
  }

  if (loading) {
    return <Spinner label="Loading your dashboard…" />;
  }

  const appliedJobs = new Set(applications.map((a) => a.jobId));
  const stats = {
    applied: applications.length,
    shortlisted: applications.filter((a) => a.status === 'SHORTLISTED').length,
    pending: applications.filter((a) => a.status === 'APPLIED').length,
    available: jobs.length,
  };

  return (
    <div>
      {/* Hero */}
      <section className="gradient-brand relative overflow-hidden rounded-3xl px-6 py-10 text-white shadow-lg sm:px-10">
        <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-20 right-28 h-64 w-64 rounded-full bg-white/10" />
        <p className="text-sm font-semibold uppercase tracking-wider text-indigo-100">Placement Portal</p>
        <h1 className="mt-1 font-display text-3xl font-extrabold sm:text-4xl">
          Welcome{profile ? `, ${profile.name}` : ''}
        </h1>
        <p className="mt-2 max-w-xl text-sm text-indigo-100">
          Explore open opportunities, track your applications and keep your profile ready for
          recruiters.
        </p>
      </section>

      {error && <p className="form-error mt-6">{error}</p>}

      {/* Statistics */}
      <section className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Applications Applied" value={stats.applied} icon={Send} tone="indigo" />
        <StatCard label="Shortlisted" value={stats.shortlisted} icon={Award} tone="emerald" />
        <StatCard label="Pending" value={stats.pending} icon={Hourglass} tone="amber" />
        <StatCard label="Available Jobs" value={stats.available} icon={Briefcase} tone="violet" />
      </section>

      {/* Profile + Resume */}
      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl gradient-brand font-display text-lg font-bold text-white">
              {profile ? initials(profile.name) : '?'}
            </div>
            <div className="min-w-0">
              <h2 className="font-display text-lg font-bold text-slate-900">
                {profile?.name ?? 'Student'}
              </h2>
              <p className="truncate text-sm text-slate-500">{profile?.user?.email}</p>
            </div>
          </div>

          <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
            <div className="col-span-2 flex items-center gap-2">
              <Phone className="h-4 w-4 shrink-0 text-slate-400" />
              <span className="text-slate-500">Phone</span>
              <span className="ml-auto font-medium text-slate-800">{profile?.phone ?? 'Not set'}</span>
            </div>
            <div className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4 shrink-0 text-slate-400" />
              <span className="text-slate-500">Branch</span>
              <span className="ml-auto font-medium text-slate-800">{profile?.branch ?? '—'}</span>
            </div>
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 shrink-0 text-slate-400" />
              <span className="text-slate-500">Year</span>
              <span className="ml-auto font-medium text-slate-800">
                {profile ? yearOfStudy(profile.batch) : '—'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 shrink-0 text-slate-400" />
              <span className="text-slate-500">CGPA</span>
              <span className="ml-auto font-medium text-slate-800">{profile?.cgpa ?? '—'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Inbox className="h-4 w-4 shrink-0 text-slate-400" />
              <span className="text-slate-500">Backlogs</span>
              <span className="ml-auto font-medium text-slate-800">{profile?.backlogs ?? '—'}</span>
            </div>
          </dl>
        </div>

        {/* Resume card */}
        <div className="card flex flex-col p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-slate-900">Resume</h2>
              <p className="text-sm text-slate-500">
                {profile?.resumeUrl ? 'Your resume link is active' : 'No resume added yet'}
              </p>
            </div>
          </div>

          <div className="mt-4">
            {profile?.resumeUrl ? (
              <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                Resume uploaded
              </span>
            ) : (
              <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 ring-1 ring-inset ring-amber-600/20">
                Not uploaded
              </span>
            )}
          </div>

          <p className="mt-3 text-sm text-slate-500">
            {profile?.resumeUrl
              ? 'Recruiters can view your resume when reviewing your applications.'
              : 'Add a resume link so recruiters can review your profile. Update it from your profile page.'}
          </p>
          <Link to="/profile" className="btn-secondary mt-4 w-full">
            Manage profile
          </Link>
        </div>
      </section>

      {/* Available jobs */}
      <section className="mt-10">
        <div className="mb-5 flex items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-xl font-bold text-slate-900">Available Jobs</h2>
            <p className="mt-0.5 text-sm text-slate-500">
              {jobs.length} open {jobs.length === 1 ? 'opportunity' : 'opportunities'} for you
            </p>
          </div>
          <Link to="/jobs" className="btn-secondary shrink-0">
            View all jobs
          </Link>
        </div>

        {jobs.length === 0 ? (
          <EmptyState
            icon={Building2}
            title="No open jobs right now"
            subtitle="New opportunities will appear here as companies post them."
          />
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                applied={appliedJobs.has(job.id)}
                applying={applying === job.id}
                onApply={() => void handleApply(job)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
