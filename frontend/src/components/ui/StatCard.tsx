import type { LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

const tones = {
  indigo: 'from-indigo-500 to-blue-500',
  violet: 'from-violet-500 to-purple-500',
  emerald: 'from-emerald-500 to-teal-500',
  amber: 'from-amber-500 to-orange-500',
  rose: 'from-rose-500 to-pink-500',
} as const;

export type StatTone = keyof typeof tones;

// Statistics card: gradient icon tile + label + value.
// Pass `to` to render the card as a navigation link; otherwise it's a plain
// tile. Either way it lifts with a shadow on hover.
export function StatCard({
  label,
  value,
  icon: Icon,
  tone = 'indigo',
  to,
}: {
  label: string;
  value: number | string;
  icon: LucideIcon;
  tone?: StatTone;
  to?: string;
}) {
  const className =
    'card flex items-center gap-4 p-5 transition duration-200 hover:-translate-y-1 hover:shadow-lg dark:hover:border-[#374256] dark:hover:shadow-[0_4px_20px_rgba(0,0,0,0.4)]' +
    (to ? ' cursor-pointer' : '');

  const body = (
    <>
      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${tones[tone]} text-white shadow-sm`}
      >
        <Icon className="h-6 w-6" />
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
        <p className="font-display text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
      </div>
    </>
  );

  return to ? (
    <Link to={to} className={className}>
      {body}
    </Link>
  ) : (
    <div className={className}>{body}</div>
  );
}
