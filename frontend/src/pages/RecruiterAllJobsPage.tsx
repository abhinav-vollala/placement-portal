import { Briefcase, Check, Pencil } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { ApiError } from '../api/client';
import { fetchMyJobs, type Job } from '../api/jobs';
import { EmptyState } from '../components/ui/EmptyState';
import { ManageJobCard, type JobCardMode } from '../components/ui/ManageJobCard';
import { PageHeader } from '../components/ui/PageHeader';
import { Spinner } from '../components/ui/Spinner';

function isExpired(job: Job): boolean {
  return new Date(job.deadline).getTime() < Date.now();
}

function JobSection({
  title,
  mode,
  jobs,
  onChanged,
  editMode,
  emptyTitle,
  emptySubtitle,
}: {
  title: string;
  mode: JobCardMode;
  jobs: Job[];
  onChanged: () => void;
  editMode: boolean;
  emptyTitle: string;
  emptySubtitle: string;
}) {
  return (
    <section className="mt-8">
      <div className="mb-4 flex items-center gap-2">
        <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">{title}</h2>
        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          {jobs.length}
        </span>
      </div>
      {jobs.length === 0 ? (
        <EmptyState icon={Briefcase} title={emptyTitle} subtitle={emptySubtitle} />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job) => (
            <ManageJobCard
              key={job.id}
              job={job}
              mode={mode}
              onChanged={onChanged}
              editMode={editMode}
            />
          ))}
        </div>
      )}
    </section>
  );
}

// All jobs for the recruiter's company, split into Open / Closed / Expired.
// Applicant management is the default; edit / close / delete actions are only
// revealed when the recruiter explicitly toggles into Edit mode.
export function RecruiterAllJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);

  const load = useCallback(async () => {
    try {
      setJobs(await fetchMyJobs());
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load jobs');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return <Spinner label="Loading your jobs…" />;
  }

  const open = jobs.filter((j) => !isExpired(j) && j.status === 'OPEN');
  const closed = jobs.filter((j) => !isExpired(j) && j.status === 'CLOSED');
  const expired = jobs.filter((j) => isExpired(j));

  return (
    <div>
      <PageHeader
        title="All Jobs"
        subtitle="Review applicants, then manage or close your postings."
      >
        <button
          type="button"
          className={editMode ? 'btn-primary' : 'btn-secondary'}
          onClick={() => setEditMode((v) => !v)}
          aria-pressed={editMode}
        >
          {editMode ? <Check className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
          {editMode ? 'Done' : 'Edit Jobs'}
        </button>
      </PageHeader>

      {editMode && (
        <div className="mb-6 flex animate-fade-in items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm font-medium text-indigo-700 dark:border-indigo-900/50 dark:bg-indigo-950/40 dark:text-indigo-300">
          <Pencil className="h-4 w-4 shrink-0" />
          Editing Jobs — management actions are now visible on each card. Click
          &ldquo;Done&rdquo; to hide them.
        </div>
      )}

      {error && <p className="form-error mb-6">{error}</p>}

      <JobSection
        title="Open Jobs"
        mode="open"
        jobs={open}
        onChanged={load}
        editMode={editMode}
        emptyTitle="No open jobs"
        emptySubtitle="Jobs past their deadline or closed won't appear here."
      />
      <JobSection
        title="Closed Jobs"
        mode="closed"
        jobs={closed}
        onChanged={load}
        editMode={editMode}
        emptyTitle="No closed jobs"
        emptySubtitle="Jobs you have manually closed appear here."
      />
      <JobSection
        title="Expired Jobs"
        mode="expired"
        jobs={expired}
        onChanged={load}
        editMode={editMode}
        emptyTitle="No expired jobs"
        emptySubtitle="Jobs past their application deadline appear here."
      />
    </div>
  );
}
