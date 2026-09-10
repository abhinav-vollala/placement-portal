import {
  CalendarDays,
  Clock,
  LockKeyhole,
  MapPin,
  Pencil,
  RotateCcw,
  Trash2,
  Users,
} from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ApiError } from '../../api/client';
import { deleteJob, updateJob, type Job } from '../../api/jobs';
import { formatDate } from '../../lib/format';
import { StatusBadge } from '../StatusBadge';
import { CompanyLogo } from './CompanyLogo';
import { ConfirmDialog } from './ConfirmDialog';
import { LpaBadge } from './LpaBadge';

export type JobCardMode = 'open' | 'closed' | 'expired';

// Recruiter job card. "View Applicants" is always shown; the management
// actions below it only appear in edit mode and depend on the section:
//   open    -> Edit Job, Close Job, Delete
//   closed  -> Edit Job, Reopen Job, Delete
//   expired -> Edit Job, Delete (determined automatically from the deadline)
// Editing lives only on the Job Details page; cards never edit inline.
export function ManageJobCard({
  job,
  mode,
  onChanged,
  editMode,
}: {
  job: Job;
  mode: JobCardMode;
  onChanged: () => void;
  editMode: boolean;
}) {
  const [closing, setClosing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function handleClose() {
    setBusy(true);
    setError('');
    try {
      await updateJob(job.id, { status: 'CLOSED' });
      setClosing(false);
      onChanged();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to close job');
      setClosing(false);
    } finally {
      setBusy(false);
    }
  }

  async function handleReopen() {
    setBusy(true);
    setError('');
    try {
      await updateJob(job.id, { status: 'OPEN' });
      onChanged();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to reopen job');
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    setBusy(true);
    setError('');
    try {
      await deleteJob(job.id);
      setDeleting(false);
      onChanged();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to delete job');
      setDeleting(false);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card flex flex-col p-5 overflow-hidden transition duration-200 hover:-translate-y-0.5 hover:shadow-lg dark:hover:border-[#374256] dark:hover:shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
      {/* Clickable body -> Job Details */}
      <Link to={`/jobs/${job.id}`} className="group block flex-1 min-w-0">
        <div className="mb-4 flex items-start justify-between gap-2 overflow-hidden">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <CompanyLogo name={job.company?.name} logoUrl={job.company?.logoUrl} />
            <div className="min-w-0 flex-1">
              <h3
                className="truncate font-display font-bold text-slate-900 transition group-hover:text-indigo-700 dark:text-slate-100 dark:group-hover:text-indigo-400"
                title={job.title}
              >
                {job.title}
              </h3>
              <p className="truncate text-sm text-slate-500 dark:text-slate-400">{job.role}</p>
            </div>
          </div>
          <div className="shrink-0 pt-0.5">
            {mode === 'expired' ? (
              <span className="inline-flex shrink-0 whitespace-nowrap items-center rounded-full bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 dark:ring-1 dark:ring-rose-500/30">
                Expired
              </span>
            ) : (
              <StatusBadge status={job.status} />
            )}
          </div>
        </div>

        <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
          <span className="inline-flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
            <MapPin className="h-4 w-4 text-rose-500 shrink-0" />
            {job.location}
          </span>
          <LpaBadge ctc={job.ctc} className="ml-auto" />
        </div>
        <div className="mb-4 space-y-1.5 text-xs">
          <p className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
            <Clock className="h-3.5 w-3.5 text-sky-500 shrink-0" />
            <span>
              Posted <span className="font-medium text-slate-700 dark:text-slate-200">{formatDate(job.createdAt)}</span>
            </span>
          </p>
          <p
            className={`flex items-center gap-1.5 ${
              mode === 'expired' ? 'font-semibold text-rose-600 dark:text-rose-400' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <CalendarDays
              className={`h-3.5 w-3.5 shrink-0 ${
                mode === 'expired' ? 'text-rose-500' : 'text-amber-500'
              }`}
            />
            <span>
              Deadline{' '}
              <span className={`font-medium ${mode === 'expired' ? 'text-rose-700 dark:text-rose-300' : 'text-amber-700 dark:text-amber-400'}`}>
                {formatDate(job.deadline)}
              </span>
            </span>
          </p>
        </div>
      </Link>

      {error && <p className="form-error mb-3">{error}</p>}

      {/* Actions — applicant-first by default; management actions only in edit mode */}
      <div className="mt-auto flex flex-col gap-2">
        <Link to={`/jobs/${job.id}/applicants`} className="btn-secondary w-full">
          <Users className="h-4 w-4" />
          View Applicants
        </Link>

        {editMode && (
          <div className="animate-fade-in flex flex-col gap-2 border-t border-slate-100 pt-2 dark:border-[#262e3d]">
            <Link to={`/jobs/${job.id}?edit=true`} className="btn-secondary w-full">
              <Pencil className="h-4 w-4" />
              Edit Job
            </Link>
            {mode === 'open' && (
              <button
                type="button"
                className="btn-secondary w-full"
                onClick={() => {
                  setError('');
                  setClosing(true);
                }}
              >
                <LockKeyhole className="h-4 w-4" />
                Close Job
              </button>
            )}
            {mode === 'closed' && (
              <button
                type="button"
                className="btn-secondary w-full"
                onClick={() => void handleReopen()}
                disabled={busy}
              >
                <RotateCcw className="h-4 w-4" />
                Reopen Job
              </button>
            )}
            <button
              type="button"
              className="btn-danger w-full"
              onClick={() => {
                setError('');
                setDeleting(true);
              }}
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Close confirmation */}
      <ConfirmDialog
        open={closing}
        title="Close this job?"
        message={`Students will no longer be able to apply to "${job.title}". You can reopen it later while the deadline is still ahead.`}
        confirmLabel="Close job"
        icon={LockKeyhole}
        busy={busy}
        onCancel={() => setClosing(false)}
        onConfirm={() => void handleClose()}
      />

      {/* Delete confirmation */}
      <ConfirmDialog
        open={deleting}
        title="Delete this job?"
        message={`"${job.title}" and all of its applications will be permanently deleted. This cannot be undone.`}
        confirmLabel="Delete job"
        danger
        busy={busy}
        onCancel={() => setDeleting(false)}
        onConfirm={() => void handleDelete()}
      />
    </div>
  );
}
