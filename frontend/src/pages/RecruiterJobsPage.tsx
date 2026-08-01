import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { ApiError } from '../api/client';
import { createJob, fetchMyJobs, type CreateJobInput, type Job } from '../api/jobs';
import { StatusBadge } from '../components/StatusBadge';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString();
}

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
        ? form.allowedBranches.split(',').map((b) => b.trim()).filter(Boolean)
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

  if (loading) return <p>Loading jobs…</p>;

  return (
    <div>
      <h1>My Jobs</h1>
      {error && <p className="form-error">{error}</p>}

      <form onSubmit={handleSubmit} className="job-form">
        <h2>Post a new job</h2>
        <div className="job-form-row">
          <label>
            Title
            <input value={form.title} onChange={(e) => set('title', e.target.value)} required />
          </label>
          <label>
            Role
            <input value={form.role} onChange={(e) => set('role', e.target.value)} required />
          </label>
          <label>
            CTC (LPA)
            <input
              type="number"
              step="0.1"
              min="0"
              value={form.ctc}
              onChange={(e) => set('ctc', e.target.value)}
              required
            />
          </label>
          <label>
            Location
            <input value={form.location} onChange={(e) => set('location', e.target.value)} required />
          </label>
        </div>
        <div className="job-form-row">
          <label>
            Description
            <textarea value={form.description} onChange={(e) => set('description', e.target.value)} required />
          </label>
          <label>
            Min CGPA
            <input
              type="number"
              step="0.01"
              min="0"
              max="10"
              value={form.minCgpa}
              onChange={(e) => set('minCgpa', e.target.value)}
            />
          </label>
          <label>
            Max backlogs
            <input
              type="number"
              min="0"
              value={form.maxBacklogs}
              onChange={(e) => set('maxBacklogs', e.target.value)}
            />
          </label>
          <label>
            Allowed branches (comma-separated)
            <input
              value={form.allowedBranches}
              onChange={(e) => set('allowedBranches', e.target.value)}
              placeholder="CSE, IT"
            />
          </label>
          <label>
            Deadline
            <input type="date" value={form.deadline} onChange={(e) => set('deadline', e.target.value)} required />
          </label>
        </div>
        <button type="submit" disabled={submitting}>
          {submitting ? 'Posting…' : 'Post job'}
        </button>
      </form>

      <h2>Posted jobs</h2>
      {jobs.length === 0 && <p>No jobs posted yet.</p>}
      <div className="job-grid">
        {jobs.map((job) => (
          <div key={job.id} className="job-card">
            <div className="job-card-header">
              <h3>{job.title}</h3>
              <StatusBadge status={job.status} />
            </div>
            <p>
              {job.role} · {job.location} · ₹{job.ctc} LPA
            </p>
            <p>Apply by {formatDate(job.deadline)}</p>
            <Link to={`/jobs/${job.id}/applicants`}>View applicants</Link>
          </div>
        ))}
      </div>
    </div>
  );
}
