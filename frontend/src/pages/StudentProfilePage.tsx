import { FileText, Save } from 'lucide-react';
import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { ApiError } from '../api/client';
import { fetchMyProfile, updateMyProfile, type StudentProfile } from '../api/students';
import { PageHeader } from '../components/ui/PageHeader';
import { Spinner } from '../components/ui/Spinner';
import { yearOfStudy } from '../lib/format';

export function StudentProfilePage() {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [resumeUrl, setResumeUrl] = useState('');

  const load = useCallback(async () => {
    try {
      const data = await fetchMyProfile();
      setProfile(data);
      setName(data.name);
      setPhone(data.phone ?? '');
      setResumeUrl(data.resumeUrl ?? '');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setSaved(false);
    setError('');
    try {
      const updated = await updateMyProfile({
        name,
        phone: phone || undefined,
        // Only send a resume URL when one is provided.
        ...(resumeUrl.trim() ? { resumeUrl: resumeUrl.trim() } : {}),
      });
      setProfile(updated);
      setSaved(true);
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

      <div className="card mb-6 flex items-center gap-4 p-6">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl gradient-brand font-display text-xl font-bold text-white">
          {profile.name
            .split(' ')
            .map((part) => part[0])
            .slice(0, 2)
            .join('')
            .toUpperCase()}
        </div>
        <div className="min-w-0">
          <h2 className="font-display text-lg font-bold text-slate-900">{profile.name}</h2>
          <p className="truncate text-sm text-slate-500">{profile.user?.email}</p>
          <p className="mt-1 text-sm text-slate-500">
            {profile.rollNo} · {profile.branch} · {yearOfStudy(profile.batch)}
          </p>
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
          <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
            <FileText className="h-3.5 w-3.5" />
            Share a public link (e.g. Google Drive). Leave empty to keep your current resume.
          </p>
          <div className="mt-2">
            {profile.resumeUrl ? (
              <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                Resume uploaded
              </span>
            ) : (
              <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 ring-1 ring-inset ring-amber-600/20">
                Not uploaded
              </span>
            )}
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" className="btn-primary" disabled={saving}>
            <Save className="h-4 w-4" />
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
