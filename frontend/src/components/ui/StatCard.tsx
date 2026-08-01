import type { LucideIcon } from 'lucide-react';

const tones = {
  indigo: 'from-indigo-500 to-blue-500',
  violet: 'from-violet-500 to-purple-500',
  emerald: 'from-emerald-500 to-teal-500',
  amber: 'from-amber-500 to-orange-500',
  rose: 'from-rose-500 to-pink-500',
} as const;

export type StatTone = keyof typeof tones;

// Statistics card: gradient icon tile + label + value.
export function StatCard({
  label,
  value,
  icon: Icon,
  tone = 'indigo',
}: {
  label: string;
  value: number | string;
  icon: LucideIcon;
  tone?: StatTone;
}) {
  return (
    <div className="card flex items-center gap-4 p-5">
      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${tones[tone]} text-white shadow-sm`}
      >
        <Icon className="h-6 w-6" />
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-slate-500">{label}</p>
        <p className="font-display text-2xl font-bold text-slate-900">{value}</p>
      </div>
    </div>
  );
}
