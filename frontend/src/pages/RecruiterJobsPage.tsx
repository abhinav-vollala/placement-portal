import { Briefcase, Plus } from 'lucide-react';
import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { ApiError } from '../api/client';
import { createJob, fetchMyJobs, type Job } from '../api/jobs';
import { EmptyState } from '../components/ui/EmptyState';
import { PageHeader } from '../components/ui/PageHeader';
import { RecruiterJobCard } from '../components/ui/RecruiterJobCard';
import { Spinner } from '../components/ui/Spinner';
import { buildJobInput, emptyJobForm, JobFormFields } from '../components/recruiter/JobFormFields';

export function RecruiterJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState(emptyJobForm);
  const [submitting, setSubmitting] = useState(false);

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

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    const input = buildJobInput(form);

    try {
      await createJob(input);
      setForm(emptyJobForm);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to create job');
    } finally {
      setSubmitting(false);
    }
  }

  function set(field: keyof typeof emptyJobForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  if (loading) {
    return <Spinner label="Loading your jobs…" />;
  }

  return (
    <div>
      <PageHeader title="My Jobs" subtitle="Post new openings and manage existing ones." />

      {error && <p className="form-error mb-6">{error}</p>}

      {/* Post a new job */}
      <div className="card mb-8 p-6">
        <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-bold text-slate-900 dark:text-white">
          <Plus className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          Post a new job
        </h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <JobFormFields form={form} set={set} idPrefix="create" />
          <div className="flex justify-end">
            <button type="submit" className="btn-primary" disabled={submitting}>
              <Plus className="h-4 w-4" />
              {submitting ? 'Posting…' : 'Post job'}
            </button>
          </div>
        </form>
      </div>

      {/* Posted jobs */}
      <h2 className="mb-4 font-display text-xl font-bold text-slate-900 dark:text-white">Posted jobs</h2>
      {jobs.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No jobs posted yet"
          subtitle="Use the form above to post your first job."
        />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job) => (
            <RecruiterJobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </div>
  );
}
