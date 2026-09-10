import { AlertCircle, CheckCircle2 } from 'lucide-react';

// Small transient toast pinned to the top-right. The parent owns visibility and
// auto-dismiss timing; this component is purely presentational.
export function Toast({ message, tone = 'success' }: { message: string; tone?: 'success' | 'error' }) {
  const Icon = tone === 'error' ? AlertCircle : CheckCircle2;
  return (
    <div className="pointer-events-none fixed right-4 top-4 z-50 animate-scale-in" role="status">
      <div
        className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white shadow-lg ${
          tone === 'error' ? 'bg-rose-600' : 'bg-slate-900 dark:bg-slate-800 dark:border dark:border-[#262e3d]'
        }`}
      >
        <Icon className="h-4 w-4 shrink-0" />
        {message}
      </div>
    </div>
  );
}
