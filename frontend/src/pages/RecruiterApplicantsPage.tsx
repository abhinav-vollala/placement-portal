import {
  ArrowLeft,
  Briefcase,
  CalendarDays,
  ChevronRight,
  Clock,
  Search,
  Users,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ApiError } from '../api/client';
import { fetchJobApplications, fetchMyJobs, type Application, type Job } from '../api/jobs';
import { StatusBadge } from '../components/StatusBadge';
import { EmptyState } from '../components/ui/EmptyState';
import { PageHeader } from '../components/ui/PageHeader';
import { Spinner } from '../components/ui/Spinner';
import { StudentAvatar } from '../components/ui/StudentAvatar';
import { formatDate } from '../lib/format';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function matchesSearch(app: Application, q: string): boolean {
  if (!q) return true;
  const lq = q.toLowerCase();
  return (
    (app.student?.name ?? '').toLowerCase().includes(lq) ||
    (app.student?.rollNo ?? '').toLowerCase().includes(lq)
  );
}

// ─── Applicant table row (desktop) ───────────────────────────────────────────

function ApplicantRow({
  app,
  jobTitle,
}: {
  app: Application;
  jobTitle: string;
}) {
  return (
    <tr className="group transition-colors duration-150 hover:bg-slate-50 dark:hover:bg-[#1a202c]">
      {/* Candidate */}
      <td className="border-t border-slate-100 px-4 py-3 dark:border-[#262e3d]">
        <Link
          to={`/my-jobs/applicants/${app.id}`}
          className="flex items-center gap-3 transition-opacity hover:opacity-75"
        >
          <StudentAvatar photoUrl={app.student?.photoUrl} className="h-9 w-9 shrink-0" />
          <div className="min-w-0">
            <p className="truncate font-semibold text-slate-900 dark:text-white">
              {app.student?.name ?? 'Unknown'}
            </p>
            {app.student?.rollNo && (
              <p className="truncate text-xs text-slate-400 dark:text-slate-500">{app.student.rollNo}</p>
            )}
          </div>
        </Link>
      </td>

      {/* Education */}
      <td className="border-t border-slate-100 px-4 py-3 dark:border-[#262e3d]">
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{app.student?.branch ?? '—'}</p>
        <p className="text-xs text-slate-400 dark:text-slate-500">Batch {app.student?.batch ?? '—'}</p>
      </td>

      {/* CGPA */}
      <td className="border-t border-slate-100 px-4 py-3 text-sm font-semibold text-slate-800 dark:border-[#262e3d] dark:text-slate-200">
        {app.student?.cgpa ?? '—'}
      </td>

      {/* Job */}
      <td className="border-t border-slate-100 px-4 py-3 dark:border-[#262e3d]">
        <p className="max-w-[200px] truncate text-sm font-medium text-slate-700 dark:text-slate-300">{jobTitle}</p>
      </td>

      {/* Applied date */}
      <td className="border-t border-slate-100 px-4 py-3 text-sm text-slate-500 dark:border-[#262e3d] dark:text-slate-400">
        {formatDate(app.createdAt)}
      </td>

      {/* Status */}
      <td className="border-t border-slate-100 px-4 py-3 dark:border-[#262e3d]">
        <StatusBadge status={app.status} />
      </td>

      {/* Actions — View only */}
      <td className="border-t border-slate-100 px-4 py-3 dark:border-[#262e3d]">
        <Link
          to={`/my-jobs/applicants/${app.id}`}
          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 dark:border-[#262e3d] dark:bg-[#1a202c] dark:text-slate-300 dark:hover:border-indigo-800 dark:hover:bg-indigo-950/40 dark:hover:text-indigo-300"
        >
          View
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </td>
    </tr>
  );
}

// ─── Mobile applicant card (< md) ─────────────────────────────────────────────

function ApplicantCard({
  app,
  jobTitle,
}: {
  app: Application;
  jobTitle: string;
}) {
  return (
    <div className="card p-4 transition duration-200 hover:shadow-md">
      <div className="flex items-center gap-3">
        <StudentAvatar photoUrl={app.student?.photoUrl} className="h-10 w-10 shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-slate-900 dark:text-white">
            {app.student?.name ?? 'Unknown'}
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500">{app.student?.rollNo}</p>
        </div>
        <StatusBadge status={app.status} />
      </div>

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
        <span>
          {app.student?.branch ?? '—'} · Batch {app.student?.batch ?? '—'}
        </span>
        <span>CGPA {app.student?.cgpa ?? '—'}</span>
        <span className="truncate font-medium text-slate-600 dark:text-slate-300">{jobTitle}</span>
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {formatDate(app.createdAt)}
        </span>
      </div>

      <div className="mt-3 flex justify-end">
        <Link
          to={`/my-jobs/applicants/${app.id}`}
          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 dark:border-[#262e3d] dark:bg-[#1a202c] dark:text-slate-300 dark:hover:border-indigo-800 dark:hover:bg-indigo-950/40 dark:hover:text-indigo-300"
        >
          View Profile
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}

// ─── Job summary bar ──────────────────────────────────────────────────────────

function JobSummaryBar({ job, count }: { job: Job; count: number }) {
  return (
    <div className="card mb-5 flex flex-wrap items-center gap-x-6 gap-y-2 px-5 py-3.5">
      <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">{job.title}</h2>
      <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300">
        <Users className="h-3.5 w-3.5" />
        {count} applicant{count === 1 ? '' : 's'}
      </span>
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${
          job.status === 'OPEN'
            ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-950/50 dark:text-emerald-400 dark:ring-emerald-500/30'
            : 'bg-slate-100 text-slate-600 ring-slate-500/20 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700'
        }`}
      >
        {job.status === 'OPEN' ? 'Open' : 'Closed'}
      </span>
      <span className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
        <CalendarDays className="h-3.5 w-3.5" />
        Deadline {formatDate(job.deadline)}
      </span>
    </div>
  );
}

// ─── Flat record type ─────────────────────────────────────────────────────────

interface FlatApplication {
  app: Application;
  job: Job;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function RecruiterApplicantsPage() {
  const { id } = useParams<{ id?: string }>();
  const [searchParams] = useSearchParams();
  const initialJobId = id ?? searchParams.get('jobId') ?? 'all';

  const [groups, setGroups] = useState<{ job: Job; applications: Application[] }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedJobId, setSelectedJobId] = useState<string>(initialJobId);
  const [search, setSearch] = useState('');

  // Sync selected job if URL param changes
  useEffect(() => {
    const targetJobId = id ?? searchParams.get('jobId') ?? 'all';
    setSelectedJobId(targetJobId);
  }, [id, searchParams]);

  const load = useCallback(async () => {
    try {
      const jobs = await fetchMyJobs();
      const withApplications = await Promise.all(
        jobs.map(async (job) => ({
          job,
          applications: await fetchJobApplications(job.id),
        })),
      );
      setGroups(withApplications);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load applicants');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const flatApplications = useMemo<FlatApplication[]>(
    () => groups.flatMap(({ job, applications }) => applications.map((app) => ({ app, job }))),
    [groups],
  );

  const visibleApplications = useMemo<FlatApplication[]>(
    () =>
      flatApplications.filter(({ app, job }) => {
        if (selectedJobId !== 'all' && job.id !== selectedJobId) return false;
        if (!matchesSearch(app, search)) return false;
        return true;
      }),
    [flatApplications, selectedJobId, search],
  );

  const selectedJob = useMemo<Job | null>(
    () =>
      selectedJobId === 'all'
        ? null
        : (groups.find((g) => g.job.id === selectedJobId)?.job ?? null),
    [groups, selectedJobId],
  );

  const totalApplicants = flatApplications.length;

  if (loading) return <Spinner label="Loading applicants…" />;

  return (
    <div>
      {/* Back button when scoped to a specific job */}
      {selectedJobId !== 'all' && (
        <p className="mb-4">
          <Link
            to="/my-jobs/all"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 transition hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to my jobs
          </Link>
        </p>
      )}

      <PageHeader
        title={selectedJob ? 'Applicants' : 'All Applicants'}
        subtitle={
          selectedJob
            ? 'Review candidates and move them through the pipeline.'
            : 'Select a job to view and manage its applicants.'
        }
      />

      {error && <p className="form-error mb-6">{error}</p>}

      {/* ── Controls (only on All Applicants view) ── */}
      {selectedJobId === 'all' && (
        <div className="mb-5 flex flex-wrap items-end gap-3">
          <div className="min-w-[200px] flex-1 max-w-xs">
            <label className="label" htmlFor="job-selector">
              Select Job
            </label>
            <select
              id="job-selector"
              className="input"
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
            >
              <option value="all">All Jobs ({totalApplicants} applicants)</option>
              {groups.map(({ job, applications }) => (
                <option key={job.id} value={job.id}>
                  {job.title} ({applications.length})
                </option>
              ))}
            </select>
          </div>

          <div className="min-w-[200px] flex-1 max-w-sm">
            <label className="label" htmlFor="applicant-search">
              Search
            </label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="applicant-search"
                type="text"
                className="input pl-9"
                placeholder="Name or Student ID…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Selected job summary ── */}
      {selectedJob && <JobSummaryBar job={selectedJob} count={visibleApplications.length} />}

      {/* ── Content ── */}
      {visibleApplications.length === 0 ? (
        <EmptyState
          icon={selectedJobId === 'all' ? Users : Briefcase}
          title={search ? 'No applicants match your search' : 'No applicants yet'}
          subtitle={
            search
              ? 'Try a different name or student ID.'
              : selectedJobId === 'all'
                ? 'Applicants will appear here once students apply to your jobs.'
                : 'Applicants who apply for this job will appear here.'
          }
        />
      ) : (
        <>
          {/* Desktop table */}
          <div className="card hidden overflow-hidden md:block">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="px-4 py-3">Candidate</th>
                  <th className="px-4 py-3">Education</th>
                  <th className="px-4 py-3">CGPA</th>
                  <th className="px-4 py-3">Job</th>
                  <th className="px-4 py-3">Applied Date</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visibleApplications.map(({ app, job }) => (
                  <ApplicantRow
                    key={app.id}
                    app={app}
                    jobTitle={job.title}
                  />
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="grid gap-3 md:hidden">
            {visibleApplications.map(({ app, job }) => (
              <ApplicantCard
                key={app.id}
                app={app}
                jobTitle={job.title}
              />
            ))}
          </div>

          <p className="mt-4 text-right text-xs text-slate-400">
            {selectedJobId !== 'all'
              ? `Showing ${visibleApplications.length} applicant${visibleApplications.length === 1 ? '' : 's'}`
              : `Showing ${visibleApplications.length} of ${flatApplications.length} applicant${flatApplications.length === 1 ? '' : 's'}`}
          </p>
        </>
      )}
    </div>
  );
}
