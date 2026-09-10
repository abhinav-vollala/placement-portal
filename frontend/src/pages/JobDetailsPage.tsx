import {
  ArrowLeft,
  Award,
  Briefcase,
  Building2,
  CalendarDays,
  Check,
  ClipboardList,
  Clock,
  FileText,
  Globe,
  GraduationCap,
  Inbox,
  Laptop,
  Layers,
  MapPin,
  Pencil,
  Save,
  Users,
  X,
  type LucideIcon,
} from 'lucide-react';
import { useCallback, useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { fetchMyApplications } from '../api/applications';
import { ApiError } from '../api/client';
import { applyToJob, fetchJob, updateJob, type Job } from '../api/jobs';
import { StatusBadge } from '../components/StatusBadge';
import { LpaBadge } from '../components/ui/LpaBadge';
import { Spinner } from '../components/ui/Spinner';
import {
  buildJobInput,
  emptyJobForm,
  jobToForm,
  JobFormFields,
  type JobFormValues,
} from '../components/recruiter/JobFormFields';
import { formatDate, toDriveDirectUrl } from '../lib/format';
import { employmentTypeLabels, workModeLabels } from '../lib/jobLabels';

function initials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

// Soft accent palette so icons are not all blue. Each tone pairs a tinted
// background with a matching icon color.
const tones = {
  indigo: { box: 'bg-indigo-50 dark:bg-indigo-950/60', icon: 'text-indigo-600 dark:text-indigo-400' },
  blue: { box: 'bg-blue-50 dark:bg-blue-950/60', icon: 'text-blue-600 dark:text-blue-400' },
  emerald: { box: 'bg-emerald-50 dark:bg-emerald-950/60', icon: 'text-emerald-600 dark:text-emerald-400' },
  violet: { box: 'bg-violet-50 dark:bg-violet-950/60', icon: 'text-violet-600 dark:text-violet-400' },
  amber: { box: 'bg-amber-50 dark:bg-amber-950/60', icon: 'text-amber-600 dark:text-amber-400' },
  rose: { box: 'bg-rose-50 dark:bg-rose-950/60', icon: 'text-rose-600 dark:text-rose-400' },
  orange: { box: 'bg-orange-50 dark:bg-orange-950/60', icon: 'text-orange-600 dark:text-orange-400' },
  sky: { box: 'bg-sky-50 dark:bg-sky-950/60', icon: 'text-sky-600 dark:text-sky-400' },
} as const;

type Tone = keyof typeof tones;

// Soft title-row washes: strong on the left, fading through the accent and
// out to transparent before the card's right edge.
const sectionGradients: Record<Tone, string> = {
  amber: 'linear-gradient(to right, rgba(245,183,0,0.30) 0%, rgba(248,213,107,0.15) 45%, transparent 78%)',
  blue: 'linear-gradient(to right, rgba(79,142,247,0.30) 0%, rgba(169,204,255,0.15) 45%, transparent 78%)',
  violet: 'linear-gradient(to right, rgba(124,92,255,0.30) 0%, rgba(200,184,255,0.15) 45%, transparent 78%)',
  emerald: 'linear-gradient(to right, rgba(34,197,94,0.30) 0%, rgba(187,247,208,0.15) 45%, transparent 78%)',
  indigo: 'linear-gradient(to right, rgba(79,70,229,0.24) 0%, rgba(165,180,252,0.12) 45%, transparent 78%)',
  rose: 'linear-gradient(to right, rgba(244,63,94,0.22) 0%, rgba(253,164,175,0.12) 45%, transparent 78%)',
  orange: 'linear-gradient(to right, rgba(249,115,22,0.22) 0%, rgba(253,186,116,0.12) 45%, transparent 78%)',
  sky: 'linear-gradient(to right, rgba(14,165,233,0.24) 0%, rgba(125,211,252,0.12) 45%, transparent 78%)',
};

// Premium card surface: softer border, layered shadow, hover lift.
const cardSurface =
  'overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_10px_30px_-12px_rgba(15,23,42,0.14)] transition duration-200 hover:shadow-[0_1px_2px_rgba(15,23,42,0.04),0_16px_40px_-12px_rgba(15,23,42,0.22)] dark:border-[#262e3d] dark:bg-[#151923] dark:shadow-none dark:hover:border-[#374256]';

// Section card with a gradient title row and a consistent design language.
// The gradient only sits behind the title; the body stays clean.
function Section({
  title,
  icon: Icon,
  tone,
  children,
}: {
  title: string;
  icon: LucideIcon;
  tone: Tone;
  children: ReactNode;
}) {
  const t = tones[tone];
  return (
    <section className={cardSurface}>
      <div className="px-6 pb-3.5 pt-4 sm:px-7" style={{ background: sectionGradients[tone] }}>
        <h2 className="flex items-center gap-3 font-display text-lg font-bold text-slate-900 dark:text-white">
          <span
            className={`flex h-9 w-9 items-center justify-center rounded-xl bg-white/80 shadow-sm ring-1 ring-black/5 dark:bg-[#1a202c] dark:ring-white/10 ${t.icon}`}
          >
            <Icon className="h-4.5 w-4.5" />
          </span>
          {title}
        </h2>
      </div>
      <div className="p-6 sm:p-7">{children}</div>
    </section>
  );
}

// Compact horizontal fact tile: icon on the left, label + value on the right.
function FactTile({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  tone: Tone;
}) {
  const t = tones[tone];
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white/70 p-3 transition duration-200 hover:border-slate-200 hover:bg-white hover:shadow-sm dark:border-[#262e3d] dark:bg-[#1a202c] dark:hover:border-[#374256] dark:hover:bg-[#1f2636]">
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${t.box} ${t.icon}`}
      >
        <Icon className="h-7 w-7" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-400">{label}</p>
        <p className="truncate text-sm font-bold text-slate-800 dark:text-slate-100">{value}</p>
      </div>
    </div>
  );
}

// Small info card used by the Additional Information grid.
function MiniCard({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  tone: Tone;
}) {
  const t = tones[tone];
  return (
    <div className="rounded-xl border border-slate-100 bg-white p-3.5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-[#262e3d] dark:bg-[#1a202c] dark:hover:border-[#374256] dark:hover:bg-[#1f2636]">
      <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${t.box} ${t.icon}`}>
        <Icon className="h-4 w-4" />
      </div>
      <p className="mt-2.5 text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-0.5 text-sm font-bold text-slate-800 dark:text-slate-100">{value}</p>
    </div>
  );
}

function BulletedList({
  title,
  text,
  markerClass = 'bg-indigo-500',
}: {
  title: string;
  text?: string | null;
  markerClass?: string;
}) {
  const items = (text ?? '')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
  if (items.length === 0) return null;
  return (
    <div>
      <h3 className="mb-3 font-display text-sm font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {title}
      </h3>
      <ul className="space-y-2.5">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            <span className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${markerClass}`} />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function MetaChip({
  icon: Icon,
  label,
  tone = 'slate',
}: {
  icon: LucideIcon;
  label: string;
  tone?: 'slate' | Tone;
}) {
  const t = tone === 'slate' ? { icon: 'text-slate-500 dark:text-slate-400' } : tones[tone];
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100/80 px-2.5 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800/80 dark:text-slate-300">
      <Icon className={`h-3.5 w-3.5 ${t.icon}`} />
      {label}
    </span>
  );
}

// Shared job detail page for students and recruiters, styled like a modern
// premium job portal (LinkedIn Jobs / Unstop inspired).
export function JobDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const isRecruiter = user?.role === 'RECRUITER';

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [applied, setApplied] = useState(false);
  const [applying, setApplying] = useState(false);
  const [applyError, setApplyError] = useState('');

  const [editing, setEditing] = useState<boolean>(() => searchParams.get('edit') === 'true');
  const [editForm, setEditForm] = useState<JobFormValues>(emptyJobForm);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  // Sync editing if navigated with ?edit=true
  useEffect(() => {
    if (searchParams.get('edit') === 'true') {
      setEditing(true);
    }
  }, [searchParams]);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      const data = await fetchJob(id);
      setJob(data);
      setEditForm(jobToForm(data));
      if (user?.role === 'STUDENT') {
        const apps = await fetchMyApplications();
        setApplied(apps.some((a) => a.jobId === id));
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load job');
    } finally {
      setLoading(false);
    }
  }, [id, user?.role]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleApply() {
    if (!job || applying) return;
    setApplying(true);
    setApplyError('');
    try {
      await applyToJob(job.id);
      setApplied(true);
    } catch (err) {
      setApplyError(err instanceof ApiError ? err.message : 'Application failed');
    } finally {
      setApplying(false);
    }
  }

  function handleCancelEdit() {
    setEditing(false);
    setSearchParams({}, { replace: true });
  }

  async function handleSaveEdit(event: FormEvent) {
    event.preventDefault();
    if (!job) return;
    setSaving(true);
    setSaveError('');
    try {
      const updated = await updateJob(job.id, buildJobInput(editForm));
      setJob(updated);
      setEditForm(jobToForm(updated));
      setEditing(false);
      setSearchParams({}, { replace: true });
    } catch (err) {
      setSaveError(err instanceof ApiError ? err.message : 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <Spinner label="Loading job…" />;
  }

  if (!job) {
    return (
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Job Details</h1>
        <p className="form-error mt-4">{error}</p>
      </div>
    );
  }

  const company = job.company;
  const recruiter = company?.recruiters?.[0];
  const branches =
    job.allowedBranches.length > 0 ? job.allowedBranches.join(', ') : 'All branches';
  const openings = job.openings ?? 1;
  const employmentType = employmentTypeLabels[job.employmentType ?? 'FULL_TIME'];
  const workMode = workModeLabels[job.workMode ?? 'ONSITE'];
  const expired = new Date(job.deadline).getTime() < Date.now();
  const canApply = job.status === 'OPEN' && !expired;
  const backTo = isRecruiter ? '/my-jobs/all' : '/jobs';

  function setEdit(field: keyof JobFormValues, value: string) {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  }

  return (
    <div className="animate-fade-in">
      <Link
        to={backTo}
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition duration-200 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to {isRecruiter ? 'All Jobs' : 'Jobs'}
      </Link>

      {error && <p className="form-error mb-6">{error}</p>}

      {/* Recruiter inline edit */}
      {isRecruiter && editing && (
        <form className={cardSurface + ' mb-6'} onSubmit={handleSaveEdit}>
          <div className="px-6 pb-3.5 pt-4 sm:px-7" style={{ background: sectionGradients.indigo }}>
            <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">Edit Job</h2>
          </div>
          <div className="p-6 sm:p-7">
            <JobFormFields form={editForm} set={setEdit} idPrefix="edit" />
            {saveError && <p className="form-error mt-4">{saveError}</p>}
            <div className="mt-5 flex justify-end gap-3">
              <button type="button" className="btn-secondary" onClick={handleCancelEdit} disabled={saving}>
                <X className="h-4 w-4" />
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={saving}>
                <Save className="h-4 w-4" />
                {saving ? 'Saving…' : 'Save changes'}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Top card: clean white hero, no banner */}
      <div className={cardSurface}>
        <div className="flex flex-col gap-6 p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-6">
            {/* Company logo */}
            <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-2.5 shadow-md dark:border-[#262e3d] dark:bg-[#1a202c]">
              {company?.logoUrl ? (
                <img
                  src={toDriveDirectUrl(company.logoUrl)}
                  alt={`${company.name} logo`}
                  className="h-full w-full rounded-xl object-contain"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center rounded-xl gradient-brand font-display text-3xl font-bold text-white">
                  {initials(company?.name ?? 'C')}
                </div>
              )}
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="font-display text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                  {job.title}
                </h1>
                <StatusBadge status={job.status} />
              </div>
              <p className="mt-1.5 font-medium text-slate-500 dark:text-slate-400">
                {company?.name ?? 'Company'}
                {company?.industry ? ` · ${company.industry}` : ''}
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <LpaBadge ctc={job.ctc} />
                <MetaChip icon={MapPin} label={job.location} tone="rose" />
                <MetaChip icon={Briefcase} label={employmentType} tone="indigo" />
                <MetaChip icon={Users} label={`${openings} opening${openings === 1 ? '' : 's'}`} tone="blue" />
                <MetaChip icon={Laptop} label={workMode} tone="emerald" />
                <MetaChip icon={CalendarDays} label={`Apply by ${formatDate(job.deadline)}`} tone="amber" />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="shrink-0 lg:pl-4">
            {isRecruiter ? (
              <div className="flex flex-col gap-2">
                <button className="btn-primary w-full" onClick={() => setEditing((v) => !v)}>
                  <Pencil className="h-4 w-4" />
                  {editing ? 'Cancel edit' : 'Edit job'}
                </button>
                <Link to={`/jobs/${job.id}/applicants`} className="btn-secondary w-full">
                  <Users className="h-4 w-4" />
                  View applicants
                </Link>
              </div>
            ) : (
              <div className="flex w-44 flex-col gap-2">
                {applied ? (
                  <button className="btn-primary w-full" disabled>
                    <Check className="h-4 w-4" />
                    Applied ✓
                  </button>
                ) : (
                  <button
                    className="btn-primary w-full"
                    onClick={() => void handleApply()}
                    disabled={applying || !canApply}
                  >
                    {applying ? 'Applying…' : 'Apply Now'}
                  </button>
                )}
                {applied && (
                  <p className="text-center text-xs text-emerald-600 dark:text-emerald-400">
                    You have already applied to this job.
                  </p>
                )}
                {!applied && !canApply && (
                  <p className="form-error text-center">
                    {job.status === 'CLOSED'
                      ? 'This position is closed.'
                      : 'The application deadline has passed.'}
                  </p>
                )}
                {applyError && <p className="form-error text-center">{applyError}</p>}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="mt-8 grid items-start gap-8 lg:grid-cols-3">
        {/* Main column */}
        <div className="space-y-8 lg:col-span-2">
          {/* Eligibility */}
          <Section title="Eligibility" icon={Award} tone="amber">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <FactTile icon={GraduationCap} label="Minimum CGPA" value={job.minCgpa} tone="violet" />
              <FactTile icon={Inbox} label="Maximum Backlogs" value={String(job.maxBacklogs)} tone="amber" />
              <FactTile icon={Layers} label="Eligible Branches" value={branches} tone="blue" />
              <FactTile icon={CalendarDays} label="Eligible Batch" value={job.eligibleBatch || 'All batches'} tone="emerald" />
            </div>
          </Section>

          {/* About company */}
          <Section title="About Company" icon={Building2} tone="blue">
            <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
              {company?.description ?? 'No company description provided.'}
            </p>
            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <FactTile icon={Building2} label="Industry" value={company?.industry ?? '—'} tone="indigo" />
              {company?.website ? (
                <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white/70 p-3 transition duration-200 hover:border-slate-200 hover:bg-white hover:shadow-sm dark:border-[#262e3d] dark:bg-[#1a202c] dark:hover:border-[#374256] dark:hover:bg-[#1f2636]">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-sky-50 text-sky-600 dark:bg-sky-950/60 dark:text-sky-400">
                    <Globe className="h-7 w-7" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-400">Website</p>
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-0.5 block truncate text-sm font-bold text-indigo-600 transition hover:text-indigo-800 hover:underline dark:text-indigo-400 dark:hover:text-indigo-300"
                    >
                      {company.website}
                    </a>
                  </div>
                </div>
              ) : (
                <FactTile icon={Globe} label="Website" value="—" tone="sky" />
              )}
            </div>
          </Section>

          {/* Job description */}
          <Section title="Job Description" icon={FileText} tone="violet">
            <p className="whitespace-pre-line text-sm leading-relaxed text-slate-700 dark:text-slate-300">{job.description}</p>
            <div className="mt-7 space-y-7">
              <BulletedList title="Responsibilities" text={job.responsibilities} markerClass="bg-orange-500" />
              <BulletedList title="Requirements" text={job.requirements} markerClass="bg-blue-500" />
              {job.preferredSkills?.trim() && (
                <div>
                  <h3 className="mb-3 font-display text-sm font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Preferred Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {job.preferredSkills
                      .split(',')
                      .map((s) => s.trim())
                      .filter(Boolean)
                      .map((skill, i) => (
                        <span
                          key={i}
                          className="rounded-full bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700 transition duration-200 hover:bg-violet-100 dark:bg-violet-950/60 dark:text-violet-300 dark:hover:bg-violet-900/60"
                        >
                          {skill}
                        </span>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </Section>
        </div>

        {/* Right rail */}
        <div className="space-y-8 lg:sticky lg:top-6">
          {/* Additional information */}
          <Section title="Additional Information" icon={ClipboardList} tone="emerald">
            <div className="grid grid-cols-2 gap-3">
              <MiniCard icon={Clock} label="Experience" value={job.experience || 'Not specified'} tone="orange" />
              <MiniCard icon={CalendarDays} label="Duration" value={job.duration || 'Not specified'} tone="violet" />
              <MiniCard icon={Laptop} label="Work Mode" value={workMode} tone="emerald" />
              <MiniCard icon={Briefcase} label="Employment Type" value={employmentType} tone="blue" />
              <MiniCard icon={Users} label="Openings" value={String(openings)} tone="sky" />
            </div>
          </Section>

          {/* Recruiter information */}
          <Section title="Recruiter Information" icon={Users} tone="sky">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-50 font-display text-sm font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                {initials(recruiter?.fullName ?? 'R')}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-slate-900 dark:text-white">{recruiter?.fullName ?? 'Recruiter'}</p>
                <p className="truncate text-sm text-slate-500 dark:text-slate-400">
                  {recruiter?.position ? `${recruiter.position} · ` : ''}
                  {company?.name}
                </p>
              </div>
              {company?.website && (
                <a
                  href={company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-auto shrink-0 rounded-lg border border-slate-200 p-2 text-slate-500 transition duration-200 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-600 dark:border-[#262e3d] dark:text-slate-400 dark:hover:border-emerald-500/50 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300"
                  title="Visit company website"
                >
                  <Globe className="h-4 w-4" />
                </a>
              )}
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}
