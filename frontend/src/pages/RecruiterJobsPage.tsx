import { Briefcase, Plus } from 'lucide-react';
import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { ApiError } from '../api/client';
import { createJob, fetchMyJobs, type CreateJobInput, type Job } from '../api/jobs';
import { EmptyState } from '../components/ui/EmptyState';
import { PageHeader } from '../components/ui/PageHeader';
import { RecruiterJobCard } from '../components/ui/RecruiterJobCard';
import { Spinner } from '../components/ui/Spinner';

const emptyForm = {
  title: '',
  role: '',
  ctc: '',
  location: '',
  description: '',
  minCgpa: '',
  maxBacklogs: '',
  allowedBranches: '',
  deadline: '',
};

export function RecruiterJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState(emptyForm);
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

    const input: CreateJobInput = {
      title: form.title,
      role: form.role,
      ctc: Number(form.ctc),
      location: form.location,
      description: form.description,
      minCgpa: form.minCgpa ? Number(form.minCgpa) : 0,
      maxBacklogs: form.maxBacklogs ? Number(form.maxBacklogs) : 0,
      allowedBranches: form.allowedBranches
        ? form.allowedBranches
            .split(',')
            .map((b) => b.trim())
            .filter(Boolean)
        : [],
      deadline: new Date(form.deadline).toISOString(),
    };

    try {
      await createJob(input);
      setForm(emptyForm);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to create job');
    } finally {
      setSubmitting(false);
    }
  }

  function set(field: keyof typeof emptyForm, value: string) {
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
        <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-bold text-slate-900">
          <Plus className="h-5 w-5 text-indigo-600" />
          Post a new job
        </h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="label" htmlFor="job-title">
                Title
              </label>
              <input
                id="job-title"
                className="input"
                value={form.title}
                onChange={(e) => set('title', e.target.value)}
                required
                placeholder="Software Engineer Intern"
              />
            </div>
            <div>
              <label className="label" htmlFor="job-role">
                Role
              </label>
              <input
                id="job-role"
                className="input"
                value={form.role}
                onChange={(e) => set('role', e.target.value)}
                required
                placeholder="Intern / Fresher"
              />
            </div>
            <div>
              <label className="label" htmlFor="job-ctc">
                CTC (LPA)
              </label>
              <input
                id="job-ctc"
                className="input"
                type="number"
                step="0.1"
                min="0"
                value={form.ctc}
                onChange={(e) => set('ctc', e.target.value)}
                required
              />
            </div>
            <div>
              <label className="label" htmlFor="job-location">
                Location
              </label>
              <input
                id="job-location"
                className="input"
                value={form.location}
                onChange={(e) => set('location', e.target.value)}
                required
                placeholder="Bengaluru"
              />
            </div>
            <div>
              <label className="label" htmlFor="job-deadline">
                Deadline
              </label>
              <input
                id="job-deadline"
                className="input"
                type="date"
                value={form.deadline}
                onChange={(e) => set('deadline', e.target.value)}
                required
              />
            </div>
            <div>
              <label className="label" htmlFor="job-mincgpa">
                Min CGPA
              </label>
              <input
                id="job-mincgpa"
                className="input"
                type="number"
                step="0.01"
                min="0"
                max="10"
                value={form.minCgpa}
                onChange={(e) => set('minCgpa', e.target.value)}
              />
            </div>
            <div>
              <label className="label" htmlFor="job-backlogs">
                Max backlogs
              </label>
              <input
                id="job-backlogs"
                className="input"
                type="number"
                min="0"
                value={form.maxBacklogs}
                onChange={(e) => set('maxBacklogs', e.target.value)}
              />
            </div>
            <div>
              <label className="label" htmlFor="job-branches">
                Allowed branches
              </label>
              <input
                id="job-branches"
                className="input"
                value={form.allowedBranches}
                onChange={(e) => set('allowedBranches', e.target.value)}
                placeholder="CSE, IT (blank = all)"
              />
            </div>
          </div>
          <div>
            <label className="label" htmlFor="job-description">
              Description
            </label>
            <textarea
              id="job-description"
              className="input min-h-24"
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              required
              placeholder="Describe the role and responsibilities…"
            />
          </div>
          <div className="flex justify-end">
            <button type="submit" className="btn-primary" disabled={submitting}>
              <Plus className="h-4 w-4" />
              {submitting ? 'Posting…' : 'Post job'}
            </button>
          </div>
        </form>
      </div>

      {/* Posted jobs */}
      <h2 className="mb-4 font-display text-xl font-bold text-slate-900">Posted jobs</h2>
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
