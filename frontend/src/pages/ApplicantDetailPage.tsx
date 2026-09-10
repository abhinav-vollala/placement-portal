import {
  ArrowLeft,
  Award,
  BookOpen,
  Briefcase,
  CalendarDays,
  CheckCircle2,
  GraduationCap,
  Mail,
  MapPin,
  Phone,
  XCircle,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchApplication, updateApplicationStatus } from '../api/applications';
import { ApiError } from '../api/client';
import type { Application, ApplicationStatus } from '../api/jobs';
import { StatusBadge } from '../components/StatusBadge';
import { CompanyLogo } from '../components/ui/CompanyLogo';
import { LpaBadge } from '../components/ui/LpaBadge';
import { Spinner } from '../components/ui/Spinner';
import { StudentAvatar } from '../components/ui/StudentAvatar';
import { StudentLinkPills } from '../components/ui/StudentLinkPills';
import { formatDate } from '../lib/format';

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUSES: ApplicationStatus[] = ['APPLIED', 'SHORTLISTED', 'SELECTED', 'REJECTED'];

// Compact status-action pills with per-status colors.
const ACTIONS: {
  label: string;
  status: ApplicationStatus;
  base: string;
  active: string;
}[] = [
  {
    label: 'Shortlist',
    status: 'SHORTLISTED',
    base: 'rounded-lg px-3 py-1.5 text-xs font-semibold ring-1 ring-inset transition',
    active:
      'bg-amber-50 text-amber-700 ring-amber-300/70 hover:bg-amber-100 dark:bg-amber-950/60 dark:text-amber-300 dark:ring-amber-500/30 dark:hover:bg-amber-900/60',
  },
  {
    label: 'Select',
    status: 'SELECTED',
    base: 'rounded-lg px-3 py-1.5 text-xs font-semibold ring-1 ring-inset transition',
    active:
      'bg-emerald-50 text-emerald-700 ring-emerald-300/70 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300 dark:ring-emerald-500/30 dark:hover:bg-emerald-900/60',
  },
  {
    label: 'Reject',
    status: 'REJECTED',
    base: 'rounded-lg px-3 py-1.5 text-xs font-semibold ring-1 ring-inset transition',
    active:
      'bg-rose-50 text-rose-700 ring-rose-300/70 hover:bg-rose-100 dark:bg-rose-950/60 dark:text-rose-300 dark:ring-rose-500/30 dark:hover:bg-rose-900/60',
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

/** One row in the info grid: icon + label + value */
function InfoRow({
  icon: Icon,
  label,
  value,
  iconColor = 'text-slate-400 dark:text-slate-500',
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
  iconColor?: string;
}) {
  return (
    <div className="flex items-center gap-2.5 rounded-lg bg-slate-50 px-3 py-2 text-sm dark:bg-[#1a202c]">
      <Icon className={`h-3.5 w-3.5 shrink-0 ${iconColor}`} />
      <span className="min-w-0 flex-1 text-slate-500 dark:text-slate-400">{label}</span>
      <span className="font-medium text-slate-800 dark:text-slate-100 tabular-nums">{value}</span>
    </div>
  );
}

/** Section label in a consistent style */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-400">
      {children}
    </p>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function ApplicantDetailPage() {
  const { applicationId } = useParams<{ applicationId: string }>();
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState('');

  const load = useCallback(async () => {
    if (!applicationId) return;
    try {
      setApplication(await fetchApplication(applicationId));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load applicant');
    } finally {
      setLoading(false);
    }
  }, [applicationId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleStatusChange(status: ApplicationStatus) {
    if (!application) return;
    setUpdating(true);
    setUpdateError('');
    try {
      const updated = await updateApplicationStatus(application.id, status);
      setApplication((prev) => (prev ? { ...prev, status: updated.status } : prev));
    } catch (err) {
      setUpdateError(err instanceof ApiError ? err.message : 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  }

  if (loading) return <Spinner label="Loading applicant…" />;

  if (!application) {
    return (
      <div className="space-y-4">
        <Link to="/my-jobs/applicants" className="btn-secondary inline-flex">
          <ArrowLeft className="h-4 w-4" />
          Back to applicants
        </Link>
        <p className="form-error">{error}</p>
      </div>
    );
  }

  const student = application.student;
  const job = application.job;

  return (
    <div className="space-y-5">
      {/* ── Back link ── */}
      <Link
        to="/my-jobs/applicants"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to applicants
      </Link>

      {error && <p className="form-error">{error}</p>}

      {/* ══════════════════════════════════════════════════════════
          CANDIDATE HEADER — compact, information-dense banner
      ══════════════════════════════════════════════════════════ */}
      <div className="card flex flex-wrap items-center justify-between gap-4 px-5 py-4">
        {/* Left: avatar + identity */}
        <div className="flex items-center gap-4">
          <StudentAvatar photoUrl={student?.photoUrl} className="h-16 w-16 shrink-0 ring-2 ring-slate-100 dark:ring-slate-800" />
          <div className="min-w-0">
            <h1 className="font-display text-lg font-bold text-slate-900 dark:text-white sm:text-xl">
              {student?.name ?? 'Unknown Candidate'}
            </h1>
            {student?.rollNo && (
              <p className="mt-0.5 text-xs font-semibold uppercase tracking-wider text-indigo-500 dark:text-indigo-400">
                {student.rollNo}
              </p>
            )}
            {(student?.user?.email || student?.email) && (
              <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                <Mail className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
                <a
                  href={`mailto:${student.user?.email ?? student.email}`}
                  className="transition hover:text-indigo-600 dark:hover:text-indigo-400"
                >
                  {student.user?.email ?? student.email}
                </a>
              </p>
            )}
          </div>
        </div>

        {/* Right: current status pill */}
        <div className="flex flex-col items-end gap-1.5">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-400">
            Current Status
          </span>
          <StatusBadge status={application.status} />
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          MAIN BODY — two-column grid on desktop
      ══════════════════════════════════════════════════════════ */}
      <div className="grid gap-5 lg:grid-cols-3">
        {/* ── LEFT COLUMN (2/3): candidate info + links ── */}
        <div className="space-y-5 lg:col-span-2">

          {/* Candidate overview */}
          <div className="card p-5">
            <SectionLabel>Candidate Overview</SectionLabel>
            <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
              <InfoRow
                icon={GraduationCap}
                label="Branch"
                value={student?.branch ?? '—'}
                iconColor="text-violet-400"
              />
              <InfoRow
                icon={CalendarDays}
                label="Batch"
                value={student?.batch ?? '—'}
                iconColor="text-sky-400"
              />
              <InfoRow
                icon={Award}
                label="CGPA"
                value={student?.cgpa ?? '—'}
                iconColor="text-amber-400"
              />
              <InfoRow
                icon={BookOpen}
                label="Backlogs"
                value={student?.backlogs ?? '—'}
                iconColor="text-slate-400"
              />
              <InfoRow
                icon={Phone}
                label="Phone"
                value={student?.phone ?? 'Not provided'}
                iconColor="text-emerald-400"
              />
            </div>
          </div>

          {/* Professional links */}
          <div className="card p-5">
            <SectionLabel>Professional Links</SectionLabel>
            {student ? (
              <StudentLinkPills student={student} />
            ) : (
              <p className="text-sm text-slate-400">No profile links available.</p>
            )}
          </div>

          {/* Applied-for job */}
          {job && (
            <div className="card p-5">
              <SectionLabel>Application</SectionLabel>
              <div className="flex items-start gap-3">
                <CompanyLogo name={job.company?.name} logoUrl={job.company?.logoUrl} />
                <div className="min-w-0 flex-1">
                  <h3 className="font-display font-bold text-slate-900 dark:text-white">{job.title}</h3>
                  <p className="mt-0.5 flex flex-wrap items-center gap-x-3 text-sm text-slate-500 dark:text-slate-400">
                    {job.company?.name && <span>{job.company.name}</span>}
                    {job.location && (
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3 w-3 shrink-0" />
                        {job.location}
                      </span>
                    )}
                    <LpaBadge ctc={job.ctc} />
                  </p>
                  <div className="mt-2.5 flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <Briefcase className="h-3 w-3" />
                      Applied {formatDate(application.createdAt)}
                    </span>
                    <span className="flex items-center gap-1">
                      <CalendarDays className="h-3 w-3" />
                      Deadline {formatDate(job.deadline)}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 font-medium ${
                        job.status === 'OPEN' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'
                      }`}
                    >
                      {job.status === 'OPEN' ? (
                        <CheckCircle2 className="h-3 w-3" />
                      ) : (
                        <XCircle className="h-3 w-3" />
                      )}
                      {job.status === 'OPEN' ? 'Open' : 'Closed'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT COLUMN (1/3): status management ── */}
        <div className="space-y-5">
          <div className="card p-5">
            <SectionLabel>Application Status</SectionLabel>

            {/* Current status badge */}
            <div className="mb-4 flex items-center justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2.5 dark:bg-[#1a202c]">
              <span className="text-xs text-slate-500 dark:text-slate-400">Current</span>
              <StatusBadge status={application.status} />
            </div>

            {/* Quick-action pills */}
            <SectionLabel>Move candidate to</SectionLabel>
            <div className="mb-4 flex flex-col gap-2">
              {ACTIONS.filter((a) => a.status !== application.status).map((action) => (
                <button
                  key={action.status}
                  className={`${action.base} ${action.active} disabled:cursor-not-allowed disabled:opacity-50`}
                  disabled={updating}
                  onClick={() => void handleStatusChange(action.status)}
                >
                  {updating ? 'Saving…' : action.label}
                </button>
              ))}
            </div>

            {/* Fine-grained dropdown */}
            <div className="border-t border-slate-100 pt-4 dark:border-[#262e3d]">
              <label
                className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-400"
                htmlFor="status-select"
              >
                Or set directly
              </label>
              <select
                id="status-select"
                className="input text-sm"
                value={application.status}
                onChange={(e) => void handleStatusChange(e.target.value as ApplicationStatus)}
                disabled={updating}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s.charAt(0) + s.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
            </div>

            {updating && (
              <p className="mt-2 text-center text-xs text-slate-400 dark:text-slate-500">Saving…</p>
            )}
            {updateError && <p className="form-error mt-3">{updateError}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
