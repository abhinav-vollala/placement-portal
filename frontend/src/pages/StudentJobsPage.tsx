import { useCallback, useEffect, useState } from 'react';
import { ApiError } from '../api/client';
import { applyToJob, fetchJobs, type Job } from '../api/jobs';
import { StatusBadge } from '../components/StatusBadge';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString();
}

export function StudentJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [appliedTo, setAppliedTo] = useState<Set<string>>(new Set());
  const [applying, setApplying] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setJobs(await fetchJobs());
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load jobs');
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
      await applyToJob(job.id);
      setAppliedTo((prev) => new Set(prev).add(job.id));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Application failed');
    } finally {
      setApplying(null);
    }
  }

  if (loading) return <p>Loading jobs…</p>;

  return (
    <div>
      <h1>Open Jobs</h1>
      {error && <p className="form-error">{error}</p>}
      {jobs.length === 0 && <p>No open jobs right now.</p>}

      <div className="job-grid">
        {jobs.map((job) => {
          const applied = appliedTo.has(job.id);
          return (
            <div key={job.id} className="job-card">
              <div className="job-card-header">
                <h2>{job.title}</h2>
                <StatusBadge status={job.status} />
              </div>
              <p className="job-company">{job.company?.name ?? 'Unknown company'}</p>
              <p>
                {job.role} · {job.location}
              </p>
              <p>CTC: ₹{job.ctc} LPA · Min CGPA: {job.minCgpa}</p>
              <p>Apply by {formatDate(job.deadline)}</p>
              <button
                onClick={() => void handleApply(job)}
                disabled={applied || applying === job.id}
              >
                {applied ? 'Applied ✓' : applying === job.id ? 'Applying…' : 'Apply'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
