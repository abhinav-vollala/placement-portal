import { Briefcase } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { ApiError } from '../api/client';
import { applyToJob, fetchJobs, type Job } from '../api/jobs';
import { EmptyState } from '../components/ui/EmptyState';
import { JobCard } from '../components/ui/JobCard';
import { PageHeader } from '../components/ui/PageHeader';
import { Spinner } from '../components/ui/Spinner';

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

  if (loading) {
    return <Spinner label="Loading jobs…" />;
  }

  return (
    <div>
      <PageHeader title="Browse Jobs" subtitle="Open opportunities across all companies." />

      {error && <p className="form-error mb-6">{error}</p>}

      {jobs.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No open jobs right now"
          subtitle="New opportunities will appear here as companies post them."
        />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              applied={appliedTo.has(job.id)}
              applying={applying === job.id}
              onApply={() => void handleApply(job)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
