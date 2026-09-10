import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../theme/ThemeContext';

export function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition-all duration-200 hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 dark:border-[#262e3d] dark:bg-[#1a202c] dark:text-slate-300 dark:hover:bg-[#242c3d] dark:hover:text-white ${className}`}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? (
        <Sun className="h-4 w-4 text-amber-400 transition-transform duration-200 hover:rotate-45" />
      ) : (
        <Moon className="h-4 w-4 text-slate-600 transition-transform duration-200 hover:-rotate-12" />
      )}
    </button>
  );
}
