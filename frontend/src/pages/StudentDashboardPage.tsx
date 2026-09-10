import {
  Award,
  Briefcase,
  Building2,
  CalendarDays,
  CheckCircle2,
  ExternalLink,
  GraduationCap,
  Hourglass,
  Phone,
  Send,
  XCircle,
  type LucideIcon,
} from 'lucide-react';
import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { fetchMyApplications } from '../api/applications';
import { ApiError } from '../api/client';
import { applyToJob, fetchJobs, type Application, type Job } from '../api/jobs';
import { fetchMyProfile, type StudentProfile } from '../api/students';
import { CvResumeIcon, LinkedInIcon, GitHubIcon } from '../components/ui/BrandIcons';
import { EmptyState } from '../components/ui/EmptyState';
import { JobCard } from '../components/ui/JobCard';
import { Spinner } from '../components/ui/Spinner';
import { StatCard } from '../components/ui/StatCard';
import { StudentAvatar } from '../components/ui/StudentAvatar';

// Gold gradient wash for the profile header, matching the Job Details
// Eligibility section-header style exactly.
const goldGradient =
  'linear-gradient(to right, rgba(245,183,0,0.30) 0%, rgba(248,213,107,0.15) 45%, transparent 78%)';

// Readable form of a profile link: drop the protocol and leading "www.", and
// show a bare filename when the URL points at a document (resume).
function linkLabel(rawUrl: string): string {
  const cleaned = rawUrl.replace(/^https?:\/\//i, '').replace(/^www\./i, '');
  const fileMatch = cleaned.match(/[^/?#]+\.(pdf|docx?|png|jpe?g)/i);
  return fileMatch ? fileMatch[0] : cleaned;
}

// A profile link card: opens the URL in a new tab when set, otherwise renders a
// muted "Not set" state. Available links show the actual URL/filename.
function ProfileCard({
  icon: Icon,
  label,
  url,
  tone,
}: {
  icon: LucideIcon | ((props: { className?: string }) => ReactNode);
  label: string;
  url: string | null;
  tone: 'emerald' | 'sky' | 'slate' | 'indigo' | 'violet';
}) {
  const toneStyles = {
    emerald: { box: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400' },
    sky: { box: 'bg-sky-50 text-[#0A66C2] dark:bg-sky-950/60 dark:text-sky-400' },
    slate: { box: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200' },
    indigo: { box: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400' },
    violet: { box: 'bg-violet-50 text-violet-600 dark:bg-violet-950/60 dark:text-violet-400' },
  }[tone];

  const base =
    'flex items-center gap-2.5 rounded-xl border border-slate-100 bg-white p-2 shadow-sm transition duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md dark:border-[#262e3d] dark:bg-[#1a202c] dark:hover:border-[#374256] dark:hover:bg-[#1f2636]';

  if (!url) {
    return (
      <div className={`${base} cursor-default`}>
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${toneStyles.box}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{label}</p>
          <p className="text-xs text-slate-400 dark:text-slate-500">Not set</p>
        </div>
      </div>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`${base} hover:border-indigo-200 dark:hover:border-indigo-500/50`}
    >
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${toneStyles.box}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{label}</p>
        <p className="truncate text-xs text-slate-500 dark:text-slate-400">{linkLabel(url)}</p>
      </div>
      <ExternalLink className="ml-auto h-3.5 w-3.5 shrink-0 text-slate-300 dark:text-slate-600" />
    </a>
  );
}

// Compact profile detail tile: clean white surface, colored icon, gray label,
// bold value, and a soft hover lift.
function InfoTile({
  icon: Icon,
  label,
  value,
  iconColor,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  iconColor: string;
}) {
  return (
    <div className="flex items-center gap-2.5 rounded-xl border border-slate-100 bg-white p-2 shadow-sm transition duration-200 ease-out hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md dark:border-[#262e3d] dark:bg-[#1a202c] dark:hover:border-indigo-500/50 dark:hover:bg-[#1f2636]">
      <Icon className={`h-6 w-6 shrink-0 ${iconColor}`} />
      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-400 dark:text-slate-400">{label}</p>
        <p className="mt-0.5 truncate text-sm font-bold text-slate-800 dark:text-slate-100">{value}</p>
      </div>
    </div>
  );
}

// Format relative time (e.g., "2 hours ago", "Yesterday", "3 days ago")
function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

// Status configuration for activity items
function getActivityConfig(status: Application['status']) {
  switch (status) {
    case 'APPLIED':
      return {
        label: 'Application Submitted',
        icon: Send,
        iconBg: 'bg-emerald-100 dark:bg-emerald-950/60',
        iconColor: 'text-emerald-600 dark:text-emerald-400',
        dotColor: 'bg-emerald-500',
        borderColor: 'border-emerald-100 dark:border-emerald-900/30',
        bgColor: 'bg-emerald-50 dark:bg-emerald-950/20',
        hoverBg: 'hover:bg-emerald-50 dark:hover:bg-emerald-950/30',
      };
    case 'SHORTLISTED':
      return {
        label: 'Shortlisted',
        icon: CheckCircle2,
        iconBg: 'bg-amber-100 dark:bg-amber-950/60',
        iconColor: 'text-amber-600 dark:text-amber-400',
        dotColor: 'bg-amber-500',
        borderColor: 'border-amber-100 dark:border-amber-900/30',
        bgColor: 'bg-amber-50 dark:bg-amber-950/20',
        hoverBg: 'hover:bg-amber-50 dark:hover:bg-amber-950/30',
      };
    case 'SELECTED':
      return {
        label: 'Selected',
        icon: Award,
        iconBg: 'bg-amber-100 dark:bg-amber-950/60',
        iconColor: 'text-amber-600 dark:text-amber-400',
        dotColor: 'bg-amber-500',
        borderColor: 'border-amber-100 dark:border-amber-900/30',
        bgColor: 'bg-amber-50 dark:bg-amber-950/20',
        hoverBg: 'hover:bg-amber-50 dark:hover:bg-amber-950/30',
      };
    case 'REJECTED':
      return {
        label: 'Rejected',
        icon: XCircle,
        iconBg: 'bg-red-100 dark:bg-red-950/60',
        iconColor: 'text-red-600 dark:text-red-400',
        dotColor: 'bg-red-500',
        borderColor: 'border-red-100 dark:border-red-900/30',
        bgColor: 'bg-red-50 dark:bg-red-950/20',
        hoverBg: 'hover:bg-red-50 dark:hover:bg-red-950/30',
      };
    default:
      return {
        label: 'Under Review',
        icon: Hourglass,
        iconBg: 'bg-violet-100 dark:bg-violet-950/60',
        iconColor: 'text-violet-600 dark:text-violet-400',
        dotColor: 'bg-violet-500',
        borderColor: 'border-violet-100 dark:border-violet-900/30',
        bgColor: 'bg-violet-50 dark:bg-violet-950/20',
        hoverBg: 'hover:bg-violet-50 dark:hover:bg-violet-950/30',
      };
  }
}

// Activity item component
function ActivityItem({
  application,
}: {
  application: Application;
}) {
  const config = getActivityConfig(application.status);
  const Icon = config.icon;
  const jobTitle = application.job?.title ?? 'Unknown Position';
  const companyName = application.job?.company?.name ?? 'Unknown Company';
  const timeAgo = formatTimeAgo(application.createdAt);

  return (
    <div className={`relative flex gap-3 ${config.borderColor} rounded-xl p-3 transition-all duration-200 ${config.hoverBg}`}>
      {/* Timeline - single continuous vertical line */}
      <div className="flex-shrink-0 relative">
        {/* Vertical line running through all items */}
        <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-slate-200 dark:bg-slate-700 -translate-x-1/2" />
        {/* Timeline dot */}
        <div className={`relative z-10 h-2.5 w-2.5 rounded-full ${config.dotColor} flex-shrink-0`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2">
          <div className={`flex-shrink-0 h-8 w-8 rounded-lg ${config.iconBg} flex items-center justify-center`}>
            <Icon className={`h-4 w-4 ${config.iconColor}`} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{jobTitle}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{companyName}</p>
          </div>
          <div className="flex-shrink-0">
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${config.iconBg} ${config.iconColor}`}>
              {config.label}
            </span>
          </div>
        </div>
        <p className="mt-1.5 ml-10 text-xs text-slate-400 dark:text-slate-500">{timeAgo}</p>
      </div>
    </div>
  );
}

// Empty state for no activity
function EmptyActivity() {
  return (
    <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
      <div className="h-16 w-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
        <Send className="h-8 w-8 text-slate-400 dark:text-slate-500" />
      </div>
      <h3 className="font-semibold text-slate-900 dark:text-white">No recent activity</h3>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 max-w-xs">
        Your application activity will appear here once you apply for jobs.
      </p>
    </div>
  );
}

export function StudentDashboardPage() {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [applying, setApplying] = useState<string | null>(null);
  // Per-job eligibility error: set only after an Apply attempt fails.
  // Cleared when the same job's Apply succeeds.
  const [applyErrors, setApplyErrors] = useState<Record<string, string>>({});

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
      // Clear any previous eligibility error for this job on success.
      setApplyErrors((prev) => {
        const next = { ...prev };
        delete next[job.id];
        return next;
      });
    } catch (err) {
      if (err instanceof ApiError) {
        // Store the error against the specific job — never globally.
        setApplyErrors((prev) => ({ ...prev, [job.id]: err.message }));
      } else {
        setError('Application failed');
      }
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
      {/* Per-job apply errors are displayed inside individual JobCards, not here */}

      {/* Statistics */}
      <section className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Applications Applied"
          value={stats.applied}
          icon={Send}
          tone="indigo"
          to="/applications"
        />
        <StatCard
          label="Shortlisted"
          value={stats.shortlisted}
          icon={Award}
          tone="emerald"
          to="/applications?status=SHORTLISTED"
        />
        <StatCard
          label="Pending"
          value={stats.pending}
          icon={Hourglass}
          tone="amber"
          to="/applications?status=APPLIED"
        />
        <StatCard
          label="Available Jobs"
          value={stats.available}
          icon={Briefcase}
          tone="violet"
          to="/jobs"
        />
      </section>

      {/* Profile + Resume */}
      <section className="mt-8 grid gap-6 lg:grid-cols-2 items-start">
        <div className="card overflow-hidden align-self-start">
          {/* Gold profile header (hero) */}
          <div
            className="relative px-6 pb-5 pt-6"
            style={{ background: goldGradient }}
          >
            <div className="flex items-center gap-5">
              <StudentAvatar
                photoUrl={profile?.photoUrl}
                className="h-24 w-24 rounded-full ring-4 ring-white/60 shadow-lg shadow-indigo-200/70 dark:ring-white/20 dark:shadow-none"
              />
              <div className="min-w-0">
                <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">
                  {profile?.name ?? 'Student'}
                </h2>
                <p className="truncate text-sm text-slate-500 dark:text-slate-400">{profile?.user?.email}</p>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                    Student
                  </span>
                  {profile?.rollNo && (
                    <span className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-400">
                      {profile.rollNo}
                    </span>
                  )}
                </div>
              </div>
              <Link to="/profile" className="btn-secondary ml-auto shrink-0 self-start">
                View profile
              </Link>
            </div>
          </div>

          {/* Profile Details */}
          <div className="px-6 pb-2 pt-3">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Profile Details
            </p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <InfoTile
                icon={Phone}
                label="Phone"
                value={profile?.phone ?? 'Not set'}
                iconColor="text-blue-600 dark:text-blue-400"
              />
              <InfoTile
                icon={GraduationCap}
                label="Branch"
                value={profile?.branch ?? '—'}
                iconColor="text-violet-600 dark:text-violet-400"
              />
              <InfoTile
                icon={CalendarDays}
                label="Batch"
                value={`${profile?.batch ?? '—'}`}
                iconColor="text-emerald-600 dark:text-emerald-400"
              />
              <InfoTile
                icon={Award}
                label="CGPA"
                value={`${profile?.cgpa ?? '—'}`}
                iconColor="text-amber-600 dark:text-amber-400"
              />
            </div>
          </div>

          {/* Links */}
          <div className="px-6 pb-3.5 pt-3">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Links</p>
            <div className="grid gap-2 sm:grid-cols-3">
              <ProfileCard icon={CvResumeIcon} label="Resume" url={profile?.resumeUrl ?? null} tone="emerald" />
              <ProfileCard icon={LinkedInIcon} label="LinkedIn" url={profile?.linkedinUrl ?? null} tone="sky" />
              <ProfileCard icon={GitHubIcon} label="GitHub" url={profile?.githubUrl ?? null} tone="slate" />
            </div>
          </div>
        </div>

        {/* Recent Activity Card */}
        <div className="card flex flex-col overflow-hidden p-6 max-h-[420px]">
          {/* Header - Fixed */}
          <div className="flex items-center gap-4 mb-4 flex-shrink-0">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
              <Briefcase className="h-6 w-6" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">Recent Activity</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Latest updates on your applications</p>
            </div>
          </div>

          {/* Activity List - Scrollable */}
          <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700 scrollbar-track-transparent pr-1">
            {applications.length === 0 ? (
              <EmptyActivity />
            ) : (
              <div className="space-y-3">
                {/* Sort by most recent first */}
                {applications
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .map((app) => (
                    <ActivityItem key={app.id} application={app} />
                  ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Available jobs */}
      <section className="mt-10">
        <div className="mb-5 flex items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">Available Jobs</h2>
            <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
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
          <div className="grid items-start gap-5 md:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                applied={appliedJobs.has(job.id)}
                applying={applying === job.id}
                onApply={() => void handleApply(job)}
                applyError={applyErrors[job.id] ?? null}
                profile={profile}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
