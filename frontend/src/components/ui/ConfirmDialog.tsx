import { AlertTriangle, type LucideIcon } from 'lucide-react';
import { useEffect } from 'react';

// Small centered confirmation dialog with a dimmed backdrop. Renders nothing
// when `open` is false; locks body scroll while open.
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  danger = false,
  icon: Icon = AlertTriangle,
  busy = false,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
  icon?: LucideIcon;
  busy?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div
        className="absolute inset-0 animate-fade-in bg-slate-900/50 backdrop-blur-sm dark:bg-black/70"
        onClick={onCancel}
      />
      <div className="relative w-full max-w-md animate-scale-in rounded-2xl bg-white p-6 shadow-2xl dark:border dark:border-[#262e3d] dark:bg-[#151923] dark:shadow-[0_10px_40px_rgba(0,0,0,0.6)]">
        <div className="flex items-start gap-4">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
              danger
                ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400'
                : 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400'
            }`}
          >
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{message}</p>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" className="btn-secondary" onClick={onCancel} disabled={busy}>
            Cancel
          </button>
          <button
            type="button"
            className={danger ? 'btn-danger' : 'btn-primary'}
            onClick={onConfirm}
            disabled={busy}
          >
            {busy ? 'Working…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
