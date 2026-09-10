import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

// Friendly empty state for lists with no data yet. An optional action (e.g. a
// call-to-action button) can be rendered below the message.
export function EmptyState({
  icon: Icon,
  title,
  subtitle,
  action,
}: {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/60 px-6 py-14 text-center dark:border-[#262e3d] dark:bg-[#151923]/60">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-500 dark:bg-indigo-950/60 dark:text-indigo-400">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="font-display text-lg font-semibold text-slate-700 dark:text-slate-200">{title}</h3>
      {subtitle && <p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
