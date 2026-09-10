import {
  ArrowRight,
  Briefcase,
  Building2,
  Camera,
  Globe,
  Pencil,
  Plus,
  Save,
  Trash2,
  TrendingUp,
  Upload,
  Users,
  UserCheck,
  X,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState, type ChangeEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { ApiError } from '../api/client';
import {
  fetchMyCompany,
  removeMyCompanyLogo,
  updateMyCompany,
  uploadMyCompanyLogo,
  type Company,
} from '../api/companies';
import { fetchJobApplications, fetchMyJobs, type Job } from '../api/jobs';
import { EmptyState } from '../components/ui/EmptyState';
import { ImageCropModal } from '../components/ui/ImageCropModal';
import { RecruiterJobCard } from '../components/ui/RecruiterJobCard';
import { Spinner } from '../components/ui/Spinner';
import { StatCard } from '../components/ui/StatCard';
import { Toast } from '../components/ui/Toast';
import { toDriveDirectUrl } from '../lib/format';

// Profile-photo constraints (mirror the backend's validation).
const PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_PHOTO_BYTES = 5 * 1024 * 1024; // 5 MB

function friendlyName(email: string): string {
  const local = email.split('@')[0] ?? 'Recruiter';
  return local.charAt(0).toUpperCase() + local.slice(1);
}

export function RecruiterDashboardPage() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<{ status: string }[]>([]);
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    name: '',
    website: '',
    industry: '',
    description: '',
  });

  // Profile-photo state: crop modal, file picker, upload/remove actions
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoRemoving, setPhotoRemoving] = useState(false);
  const [photoError, setPhotoError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Transient toast notification
  const [toast, setToast] = useState<{ message: string; tone?: 'success' | 'error' } | null>(null);
  const toastTimer = useRef<number | undefined>(undefined);

  const load = useCallback(async () => {
    try {
      const [myJobs, myCompany] = await Promise.all([fetchMyJobs(), fetchMyCompany()]);
      const all = await Promise.all(myJobs.map((job) => fetchJobApplications(job.id)));
      setJobs(myJobs);
      setApplications(all.flat());
      setCompany(myCompany);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load your dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  // Clean up object URLs when crop preview closes
  useEffect(() => {
    return () => {
      if (cropImageSrc) URL.revokeObjectURL(cropImageSrc);
    };
  }, [cropImageSrc]);

  // Clean up toast timer on unmount
  useEffect(() => {
    return () => window.clearTimeout(toastTimer.current);
  }, []);

  function showToast(message: string, tone: 'success' | 'error' = 'success') {
    setToast({ message, tone });
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 3000);
  }

  function openFilePicker() {
    fileInputRef.current?.click();
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    // Reset input value so selecting the same file again triggers change
    event.target.value = '';

    if (!PHOTO_TYPES.includes(file.type)) {
      setPhotoError('Only JPG, PNG or WEBP images are allowed.');
      return;
    }
    if (file.size > MAX_PHOTO_BYTES) {
      setPhotoError('Photo must be 5 MB or smaller.');
      return;
    }

    setPhotoError('');
    setCropImageSrc(URL.createObjectURL(file));
    setCropModalOpen(true);
  }

  async function handleCropSave(blob: Blob) {
    setPhotoUploading(true);
    setPhotoError('');
    try {
      const file = new File([blob], 'company-logo.jpg', { type: 'image/jpeg' });
      const updated = await uploadMyCompanyLogo(file);
      setCompany(updated);
      showToast('Profile photo updated');
    } catch (err) {
      setPhotoError(err instanceof ApiError ? err.message : 'Failed to upload photo');
    } finally {
      setPhotoUploading(false);
      setCropModalOpen(false);
      setCropImageSrc((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
    }
  }

  function handleCropClose() {
    setCropModalOpen(false);
    setCropImageSrc((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
  }

  async function handleRemovePhoto() {
    setPhotoRemoving(true);
    setPhotoError('');
    try {
      const updated = await removeMyCompanyLogo();
      setCompany(updated);
      showToast('Profile photo removed');
    } catch (err) {
      setPhotoError(err instanceof ApiError ? err.message : 'Failed to remove photo');
    } finally {
      setPhotoRemoving(false);
    }
  }

  function startEditing() {
    setForm({
      name: company?.name ?? '',
      website: company?.website ?? '',
      industry: company?.industry ?? '',
      description: company?.description ?? '',
    });
    setSaveError('');
    setPhotoError('');
    setSaved(false);
    setEditing(true);
  }

  async function handleSave() {
    setSaving(true);
    setSaveError('');
    try {
      const updated = await updateMyCompany({
        // Only send fields that were filled in (matches the profile-page pattern).
        ...(form.name.trim() ? { name: form.name.trim() } : {}),
        ...(form.website.trim() ? { website: form.website.trim() } : {}),
        ...(form.industry.trim() ? { industry: form.industry.trim() } : {}),
        ...(form.description.trim() ? { description: form.description.trim() } : {}),
      });
      setCompany(updated);
      setEditing(false);
      setSaved(true);
    } catch (err) {
      setSaveError(err instanceof ApiError ? err.message : 'Failed to save company profile');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <Spinner label="Loading your dashboard…" />;
  }

  const displayCompany = company ?? jobs[0]?.company;
  const shortlisted = applications.filter((a) => a.status === 'SHORTLISTED').length;
  // Newest first — the API already orders by createdAt desc, but sort here so
  // the most recently created job is always shown first.
  const sortedJobs = [...jobs].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return (
    <div>
      {/* Hidden file input for company photo/logo upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Hero */}
      <section
        className="relative overflow-hidden rounded-3xl px-7 py-8 text-white shadow-xl sm:px-10 sm:py-9"
        style={{
          backgroundImage: 'url(/recruiter-hero-bg.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center right',
          backgroundColor: '#0c101d',
        }}
      >
        {/* Soft left gradient vignette for crisp text contrast */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'linear-gradient(to right, rgba(12, 16, 29, 0.90) 0%, rgba(12, 16, 29, 0.70) 35%, rgba(12, 16, 29, 0.15) 60%, transparent 100%)',
          }}
        />

        {/* Content */}
        <div className="relative z-10">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-300">
            Recruiter Dashboard
          </p>
          <h1 className="mt-1.5 font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Welcome, {displayCompany?.name ?? (user ? friendlyName(user.email) : 'Recruiter')}
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-300">
            Manage your job postings, review applicants and move the best candidates forward.
          </p>
        </div>
      </section>

      {error && <p className="form-error mt-6">{error}</p>}

      {/* Statistics */}
      <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Total Jobs Posted"
          value={jobs.length}
          icon={Briefcase}
          tone="indigo"
          to="/my-jobs/all"
        />
        <StatCard
          label="Total Applicants"
          value={applications.length}
          icon={Users}
          tone="violet"
          to="/my-jobs/applicants"
        />
        <StatCard
          label="Shortlisted Candidates"
          value={shortlisted}
          icon={UserCheck}
          tone="emerald"
          to="/my-jobs/shortlisted"
        />
      </section>

      {/* Company profile */}
      <section className="mt-8">
        <div className="card p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={openFilePicker}
                disabled={photoUploading || photoRemoving}
                title="Change profile photo"
                className="group relative shrink-0 rounded-2xl ring-2 ring-slate-200 transition duration-200 hover:ring-indigo-300 disabled:cursor-not-allowed dark:ring-slate-700 dark:hover:ring-indigo-400"
              >
                {displayCompany?.logoUrl ? (
                  <img
                    key={displayCompany.logoUrl}
                    src={toDriveDirectUrl(displayCompany.logoUrl)}
                    alt={`${displayCompany.name} logo`}
                    className="h-16 w-16 shrink-0 rounded-2xl border border-slate-200 bg-white object-contain p-1 transition duration-200 group-hover:scale-105 dark:border-[#262e3d] dark:bg-[#1a202c]"
                  />
                ) : (
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl gradient-brand font-display text-lg font-bold text-white transition duration-200 group-hover:scale-105">
                    {(displayCompany?.name ?? 'C').slice(0, 2).toUpperCase()}
                  </div>
                )}
                {photoUploading ? (
                  <span className="absolute inset-0 flex items-center justify-center rounded-2xl bg-white/70 dark:bg-slate-900/70">
                    <span className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
                  </span>
                ) : (
                  <span className="absolute inset-0 flex items-center justify-center rounded-2xl bg-slate-900/45 opacity-0 transition duration-200 group-hover:opacity-100">
                    <Camera className="h-6 w-6 text-white" />
                  </span>
                )}
              </button>

              <div className="min-w-0 flex-1">
                <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                  {displayCompany?.name ?? 'Your Company'}
                </h2>
                {editing ? (
                  <div className="mt-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={openFilePicker}
                        disabled={photoUploading || photoRemoving}
                      >
                        <Upload className="h-4 w-4" />
                        {displayCompany?.logoUrl ? 'Change photo' : 'Upload Photo'}
                      </button>
                      {displayCompany?.logoUrl && (
                        <button
                          type="button"
                          className="btn-secondary"
                          onClick={handleRemovePhoto}
                          disabled={photoRemoving || photoUploading}
                        >
                          <Trash2 className="h-4 w-4" />
                          {photoRemoving ? 'Removing…' : 'Remove photo'}
                        </button>
                      )}
                    </div>
                    <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                      JPG, PNG or WEBP up to 5 MB. Crop and reposition before saving.
                    </p>
                    {photoError && <p className="form-error mt-2">{photoError}</p>}
                  </div>
                ) : (
                  <div className="mt-1 flex flex-wrap gap-x-5 gap-y-1 text-sm text-slate-500 dark:text-slate-400">
                    {displayCompany?.industry && (
                      <span className="inline-flex items-center gap-1.5">
                        <Building2 className="h-4 w-4" />
                        {displayCompany.industry}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1.5">
                      <TrendingUp className="h-4 w-4" />
                      {jobs.length} active posting{jobs.length === 1 ? '' : 's'}
                    </span>
                    {displayCompany?.website && (
                      <a
                        href={displayCompany.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-slate-500 transition hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
                      >
                        <Globe className="h-4 w-4" />
                        <span className="truncate">{displayCompany.website}</span>
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
            {!editing && (
              <button className="btn-secondary shrink-0" onClick={startEditing}>
                <Pencil className="h-4 w-4" />
                Edit profile
              </button>
            )}
          </div>

          {editing && (
            <form
              className="mt-6 grid gap-4 border-t border-slate-100 pt-6 sm:grid-cols-2 dark:border-[#262e3d]"
              onSubmit={(event) => {
                event.preventDefault();
                void handleSave();
              }}
            >
              <div className="sm:col-span-2">
                <label className="label" htmlFor="company-name">
                  Company Name
                </label>
                <input
                  id="company-name"
                  className="input"
                  value={form.name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Acme Corp"
                />
              </div>

              <div>
                <label className="label" htmlFor="company-website">
                  Website
                </label>
                <input
                  id="company-website"
                  className="input"
                  value={form.website}
                  onChange={(e) => setForm((prev) => ({ ...prev, website: e.target.value }))}
                  placeholder="https://example.com"
                />
              </div>
              <div>
                <label className="label" htmlFor="company-industry">
                  Industry
                </label>
                <input
                  id="company-industry"
                  className="input"
                  value={form.industry}
                  onChange={(e) => setForm((prev) => ({ ...prev, industry: e.target.value }))}
                  placeholder="Software"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="label" htmlFor="company-description">
                  Description
                </label>
                <textarea
                  id="company-description"
                  className="input min-h-20"
                  value={form.description}
                  onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Tell students about your company…"
                />
              </div>
              {saveError && <p className="form-error sm:col-span-2">{saveError}</p>}
              <div className="flex justify-end gap-3 sm:col-span-2">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setEditing(false)}
                  disabled={saving}
                >
                  <X className="h-4 w-4" />
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={saving}>
                  <Save className="h-4 w-4" />
                  {saving ? 'Saving…' : 'Save changes'}
                </button>
              </div>
            </form>
          )}

          {saved && <p className="form-success mt-4">Company profile saved successfully.</p>}
        </div>
      </section>

      {/* Recently posted jobs */}
      <section className="mt-10">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">
              Recently Posted Jobs
            </h2>
            <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
              Post openings and review their applicants.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-4">
            <Link
              to="/my-jobs/all"
              className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 transition hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              View All Jobs
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/my-jobs" className="btn-primary shrink-0">
              <Plus className="h-4 w-4" />
              Post New Job
            </Link>
          </div>
        </div>

        {sortedJobs.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            title="No jobs posted yet"
            subtitle="Create your first job posting to start receiving applications."
            action={
              <Link to="/my-jobs" className="btn-primary">
                <Plus className="h-4 w-4" />
                Post New Job
              </Link>
            }
          />
        ) : (
          <div className="job-scroll-row">
            {sortedJobs.map((job) => {
              // If a job has a longer title (e.g. Software Engineer Intern), give that card a slightly wider width
              const isLongTitle = job.title.length > 18;
              return (
                <div
                  key={job.id}
                  className={`job-scroll-item ${isLongTitle ? '!w-[360px]' : ''}`}
                >
                  <RecruiterJobCard job={job} />
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Profile Photo Crop Modal */}
      {cropModalOpen && cropImageSrc && (
        <ImageCropModal
          imageSrc={cropImageSrc}
          onCropComplete={handleCropSave}
          onClose={handleCropClose}
        />
      )}

      {/* Transient Toast Notification */}
      {toast && <Toast message={toast.message} tone={toast.tone} />}
    </div>
  );
}
