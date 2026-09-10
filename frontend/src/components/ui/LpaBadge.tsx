import { IndianRupee } from 'lucide-react';

// Premium salary badge (LinkedIn/Unstop style): a soft light-green gradient
// pill with dark text and a subtle rupee icon in a pale-green circle on the
// right. The gradient lightens toward the right edge so the icon recedes, and
// the badge lifts gently on hover. No currency symbol — just the number + "LPA".
export function LpaBadge({ ctc, className = '' }: { ctc: string; className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border border-[#A8E6B8] bg-gradient-to-r from-[#EAFBF0] via-[#D8F6E1] to-[#F5FFF8] py-1.5 pl-4 pr-1.5 text-[15px] font-semibold leading-none text-[#1F2937] shadow-[0_2px_8px_-4px_rgba(22,163,74,0.4)] transition-all duration-150 hover:-translate-y-0.5 hover:shadow-[0_8px_16px_-8px_rgba(22,163,74,0.5)] dark:border-emerald-600/40 dark:from-emerald-950/80 dark:via-emerald-900/50 dark:to-emerald-950/30 dark:text-emerald-200 dark:shadow-[0_2px_8px_-4px_rgba(16,185,129,0.3)] dark:hover:shadow-[0_8px_16px_-8px_rgba(16,185,129,0.4)] ${className}`}
    >
      {ctc} LPA
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#D3F1DE] dark:bg-emerald-800/60">
        <IndianRupee className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-300" strokeWidth={2.5} />
      </span>
    </span>
  );
}
