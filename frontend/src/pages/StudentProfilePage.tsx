import { Camera, Save, Trash2, Upload } from 'lucide-react';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from 'react';
import { ApiError } from '../api/client';
import {
  fetchMyProfile,
  removeMyPhoto,
  updateMyProfile,
  uploadMyPhoto,
  type StudentProfile,
} from '../api/students';
import { CvResumeIcon, LinkedInIcon, GitHubIcon } from '../components/ui/BrandIcons';
import { ImageCropModal } from '../components/ui/ImageCropModal';
import { PageHeader } from '../components/ui/PageHeader';
import { Spinner } from '../components/ui/Spinner';
import { StudentAvatar } from '../components/ui/StudentAvatar';
import { Toast } from '../components/ui/Toast';

// Profile-photo constraints (mirror the backend's validation).
const PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_PHOTO_BYTES = 5 * 1024 * 1024; // 5 MB

export function StudentProfilePage() {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [branch, setBranch] = useState('');
  const [batch, setBatch] = useState('');
  const [cgpa, setCgpa] = useState('');
  const [resumeUrl, setResumeUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');

  // Track initial values to detect unsaved changes
  const initialValuesRef = useRef({
    name: '',
    phone: '',
    branch: '',
    batch: '',
    cgpa: '',
    resumeUrl: '',
    linkedinUrl: '',
    githubUrl: '',
  });

  // Check if form has unsaved changes
  const hasUnsavedChanges = useCallback(() => {
    return (
      name !== initialValuesRef.current.name ||
      phone !== initialValuesRef.current.phone ||
      branch !== initialValuesRef.current.branch ||
      batch !== initialValuesRef.current.batch ||
      cgpa !== initialValuesRef.current.cgpa ||
      resumeUrl !== initialValuesRef.current.resumeUrl ||
      linkedinUrl !== initialValuesRef.current.linkedinUrl ||
      githubUrl !== initialValuesRef.current.githubUrl
    );
  }, [name, phone, branch, batch, cgpa, resumeUrl, linkedinUrl, githubUrl]);

  // Profile-photo state: the crop modal holds the chosen image, the cropped
  // blob is uploaded on Save. A transient toast confirms success.
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoRemoving, setPhotoRemoving] = useState(false);
  const [photoError, setPhotoError] = useState('');
  const [toast, setToast] = useState<{ message: string; tone: 'success' | 'error' } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toastTimer = useRef<number | undefined>(undefined);

  const load = useCallback(async () => {
    try {
      const data = await fetchMyProfile();
      setProfile(data);
      setName(data.name);
      setPhone(data.phone ?? '');
      setBranch(data.branch ?? '');
      setBatch(data.batch ? String(data.batch) : '');
      setCgpa(data.cgpa ? String(data.cgpa) : '');
      setResumeUrl(data.resumeUrl ?? '');
      setLinkedinUrl(data.linkedinUrl ?? '');
      setGithubUrl(data.githubUrl ?? '');
      // Store initial values for change detection
      initialValuesRef.current = {
        name: data.name,
        phone: data.phone ?? '',
        branch: data.branch ?? '',
        batch: data.batch ? String(data.batch) : '',
        cgpa: data.cgpa ? String(data.cgpa) : '',
        resumeUrl: data.resumeUrl ?? '',
        linkedinUrl: data.linkedinUrl ?? '',
        githubUrl: data.githubUrl ?? '',
      };
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    return () => {
      if (cropImageSrc) URL.revokeObjectURL(cropImageSrc);
    };
  }, [cropImageSrc]);

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
      const file = new File([blob], 'profile-photo.jpg', { type: 'image/jpeg' });
      const updated = await uploadMyPhoto(file);
      setProfile(updated);
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
      const updated = await removeMyPhoto();
      setProfile(updated);
      showToast('Profile photo removed');
    } catch (err) {
      setPhotoError(err instanceof ApiError ? err.message : 'Failed to remove photo');
    } finally {
      setPhotoRemoving(false);
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const updated = await updateMyProfile({
        name,
        phone: phone || undefined,
        branch: branch || undefined,
        batch: batch ? Number(batch) : undefined,
        cgpa: cgpa ? Number(cgpa) : undefined,
        // Only send URL fields when one is provided.
        ...(resumeUrl.trim() ? { resumeUrl: resumeUrl.trim() } : {}),
        ...(linkedinUrl.trim() ? { linkedinUrl: linkedinUrl.trim() } : {}),
        ...(githubUrl.trim() ? { githubUrl: githubUrl.trim() } : {}),
      });
      setProfile(updated);
      // Update initial values to current saved values
      initialValuesRef.current = {
        name,
        phone,
        branch,
        batch,
        cgpa,
        resumeUrl,
        linkedinUrl,
        githubUrl,
      };
      setSaved(true);
      showToast('Profile saved successfully');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <Spinner label="Loading your profile…" />;
  }
  if (!profile) {
    return <p className="form-error">{error}</p>;
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="My Profile" subtitle="Keep your details up to date for recruiters." />

      <div className="card mb-6 p-6">
        <div className="flex flex-wrap items-start gap-5">
          {/* Editable circular avatar */}
          <button
            type="button"
            onClick={openFilePicker}
            disabled={photoUploading || photoRemoving}
            title="Change profile photo"
            className="group relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border-0 p-0 ring-2 ring-slate-200 transition duration-200 hover:ring-indigo-400 focus:outline-none disabled:cursor-not-allowed dark:ring-slate-700 dark:hover:ring-indigo-400"
          >
            <StudentAvatar
              key={profile.photoUrl}
              photoUrl={profile.photoUrl}
              className="h-full w-full object-cover"
            />
            {photoUploading ? (
              <span className="absolute inset-0 flex items-center justify-center rounded-full bg-white/70 dark:bg-slate-900/70">
                <span className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
              </span>
            ) : (
              <span className="absolute inset-0 flex items-center justify-center rounded-full bg-slate-900/45 opacity-0 transition duration-200 group-hover:opacity-100">
                <Camera className="h-6 w-6 text-white" />
              </span>
            )}
          </button>

          <div className="min-w-0 flex-1">
            <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">{profile.name}</h2>
            <p className="truncate text-sm text-slate-500 dark:text-slate-400">{profile.user?.email}</p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {profile.rollNo} · {profile.branch} · Batch {profile.batch}
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleFileChange}
              />
              <button
                type="button"
                className="btn-secondary"
                onClick={openFilePicker}
                disabled={photoUploading || photoRemoving}
              >
                <Upload className="h-4 w-4" />
                {profile.photoUrl ? 'Change photo' : 'Upload Photo'}
              </button>
              {profile.photoUrl && (
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

            {photoError && <p className="form-error mt-3">{photoError}</p>}
          </div>
        </div>
      </div>

      {error && <p className="form-error mb-4">{error}</p>}
      {saved && <p className="form-success mb-4">Profile saved successfully.</p>}

      <form onSubmit={handleSubmit} className="card space-y-5 p-6">
        <div>
          <label className="label" htmlFor="profile-name">
            Full name
          </label>
          <input
            id="profile-name"
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="label" htmlFor="profile-phone">
            Phone number
          </label>
          <input
            id="profile-phone"
            className="input"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+91 98765 43210"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="profile-branch">
              Branch
            </label>
            <input
              id="profile-branch"
              className="input"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              placeholder="e.g. Computer Science"
            />
          </div>
          <div>
            <label className="label" htmlFor="profile-batch">
              Batch (Year)
            </label>
            <input
              id="profile-batch"
              className="input"
              type="number"
              value={batch}
              onChange={(e) => setBatch(e.target.value)}
              placeholder="2026"
              min="2000"
              max="2100"
            />
          </div>
        </div>

        <div>
          <label className="label" htmlFor="profile-cgpa">
            CGPA
          </label>
          <input
            id="profile-cgpa"
            className="input"
            type="number"
            step="0.01"
            value={cgpa}
            onChange={(e) => setCgpa(e.target.value)}
            placeholder="8.5"
            min="0"
            max="10"
          />
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Enter CGPA on a 10-point scale (e.g., 8.5)</p>
        </div>

        <div>
          <label className="label" htmlFor="profile-resume">
            Resume link
          </label>
          <input
            id="profile-resume"
            className="input"
            value={resumeUrl}
            onChange={(e) => setResumeUrl(e.target.value)}
            placeholder="https://drive.google.com/…"
          />
          <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <CvResumeIcon className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            Share a public link (e.g. Google Drive). Leave empty to keep your current resume.
          </p>
          <div className="mt-2">
            {profile.resumeUrl ? (
              <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-600/20 dark:bg-emerald-950/60 dark:text-emerald-300 dark:ring-emerald-500/30">
                Resume uploaded
              </span>
            ) : (
              <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 ring-1 ring-inset ring-amber-600/20 dark:bg-amber-950/60 dark:text-amber-300 dark:ring-amber-500/30">
                Not uploaded
              </span>
            )}
          </div>
        </div>

        <div>
          <label className="label" htmlFor="profile-linkedin">
            LinkedIn URL
          </label>
          <input
            id="profile-linkedin"
            className="input"
            value={linkedinUrl}
            onChange={(e) => setLinkedinUrl(e.target.value)}
            placeholder="https://www.linkedin.com/in/…"
          />
          <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <LinkedInIcon className="h-3.5 w-3.5 text-[#0A66C2] dark:text-sky-400" />
            Optional — recruiters can view your LinkedIn profile. Leave empty to keep your current link.
          </p>
        </div>

        <div>
          <label className="label" htmlFor="profile-github">
            GitHub URL
          </label>
          <input
            id="profile-github"
            className="input"
            value={githubUrl}
            onChange={(e) => setGithubUrl(e.target.value)}
            placeholder="https://github.com/…"
          />
          <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <GitHubIcon className="h-3.5 w-3.5 text-slate-800 dark:text-slate-200" />
            Optional — link your GitHub so recruiters can see your projects.
          </p>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className={`transition-all duration-200 ${
              saved && !hasUnsavedChanges()
                ? 'btn-success'
                : 'btn-primary'
            }`}
            disabled={saving}
          >
            <Save className="h-4 w-4" />
            {saving ? 'Saving…' : saved && !hasUnsavedChanges() ? '✓ Saved' : 'Save changes'}
          </button>
        </div>
      </form>

      {toast && <Toast message={toast.message} tone={toast.tone} />}

      {cropModalOpen && cropImageSrc && (
        <ImageCropModal
          imageSrc={cropImageSrc}
          onCropComplete={handleCropSave}
          onClose={handleCropClose}
        />
      )}
    </div>
  );
}
