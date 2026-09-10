import { Briefcase, UserCheck } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ApiError } from '../api/client';
import { applyToJob, fetchJobs, type Job } from '../api/jobs';
import { fetchMyApplications } from '../api/applications';
import { fetchMyProfile, type StudentProfile } from '../api/students';
import { EmptyState } from '../components/ui/EmptyState';
import { JobCard } from '../components/ui/JobCard';
import { PageHeader } from '../components/ui/PageHeader';
import { Spinner } from '../components/ui/Spinner';

// Check if a job is eligible for a student based on their profile.
// Used exclusively for the "Eligible" filter button — never for displaying warnings on cards.
function isJobEligible(job: Job, profile: StudentProfile | null): boolean {
  if (!profile) return false;

  // Check CGPA
  const studentCgpa = parseFloat(profile.cgpa);
  const jobMinCgpa = parseFloat(job.minCgpa);
  if (isNaN(studentCgpa) || isNaN(jobMinCgpa) || studentCgpa < jobMinCgpa) {
    return false;
  }

  // Check backlogs
  if (profile.backlogs > job.maxBacklogs) {
    return false;
  }

  // Check branch (if job has specific allowed branches)
  if (job.allowedBranches.length > 0 && !job.allowedBranches.includes(profile.branch)) {
    return false;
  }

  // Check batch (if job has eligibleBatch specified).
  // eligibleBatch is a comma-separated string (e.g. "2026, 2027").
  // Parse into individual trimmed values before comparing.
  if (job.eligibleBatch) {
    const allowedBatches = job.eligibleBatch.split(',').map((b) => b.trim());
    if (!allowedBatches.includes(String(profile.batch))) {
      return false;
    }
  }

  return true;
}

export function StudentJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [appliedTo, setAppliedTo] = useState<Set<string>>(new Set());
  const [applying, setApplying] = useState<string | null>(null);
  // Per-job eligibility error: only set after a failed Apply attempt on that job.
  const [applyErrors, setApplyErrors] = useState<Record<string, string>>({});
  const [filter, setFilter] = useState<'all' | 'eligible'>('all');

  const load = useCallback(async () => {
    try {
      const [jobsData, applicationsData, profileData] = await Promise.all([
        fetchJobs(),
        fetchMyApplications(),
        fetchMyProfile(),
      ]);
      setJobs(jobsData);
      setProfile(profileData);
      // Populate appliedTo set with job IDs from existing applications
      const appliedJobIds = new Set(applicationsData.map((app) => app.jobId));
      setAppliedTo(appliedJobIds);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load jobs');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  // Filter jobs based on selected filter
  const filteredJobs = useMemo(() => {
    if (filter === 'eligible') {
      // Include jobs that are eligible OR already applied to
      return jobs.filter((job) => isJobEligible(job, profile) || appliedTo.has(job.id));
    }
    return jobs;
  }, [jobs, profile, filter, appliedTo]);

  async function handleApply(job: Job) {
    if (applying) return;
    setApplying(job.id);
    try {
      await applyToJob(job.id);
      setAppliedTo((prev) => new Set(prev).add(job.id));
      // Clear any previous eligibility error for this job on success.
      setApplyErrors((prev) => {
        const next = { ...prev };
        delete next[job.id];
        return next;
      });
    } catch (err) {
      if (err instanceof ApiError) {
        // Store error against the specific job — not globally.
        setApplyErrors((prev) => ({ ...prev, [job.id]: err.message }));
      } else {
        setError('Application failed');
      }
    } finally {
      setApplying(null);
    }
  }

  if (loading) {
    return <Spinner label="Loading jobs…" />;
  }

  const eligibleCount = jobs.filter((job) => isJobEligible(job, profile) || appliedTo.has(job.id)).length;

  return (
    <div>
      <PageHeader
        title="Browse Jobs"
        subtitle="Open opportunities across all companies."
        children={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`btn-secondary flex items-center gap-2 ${filter === 'all' ? 'bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-600 dark:text-white dark:hover:bg-indigo-500' : ''}`}
            >
              <Briefcase className="h-4 w-4" />
              All Jobs ({jobs.length})
            </button>
            <button
              onClick={() => setFilter('eligible')}
              className={`btn-secondary flex items-center gap-2 ${filter === 'eligible' ? 'bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-600 dark:text-white dark:hover:bg-emerald-500' : ''}`}
              disabled={!profile}
            >
              <UserCheck className="h-4 w-4" />
              Eligible ({eligibleCount})
            </button>
          </div>
        }
      />

      {error && <p className="form-error mb-6">{error}</p>}

      {filteredJobs.length === 0 ? (
        <EmptyState
          icon={filter === 'eligible' ? UserCheck : Briefcase}
          title={filter === 'eligible' ? 'No eligible jobs found' : 'No open jobs right now'}
          subtitle={
            filter === 'eligible'
              ? 'Jobs matching your profile (CGPA, branch, backlogs, batch) will appear here.'
              : 'New opportunities will appear here as companies post them.'
          }
        />
      ) : (
        <div className="grid items-start gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filteredJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              applied={appliedTo.has(job.id)}
              applying={applying === job.id}
              onApply={() => void handleApply(job)}
              applyError={applyErrors[job.id] ?? null}
              profile={profile}
            />
          ))}
        </div>
      )}
    </div>
  );
}
