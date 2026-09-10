import { useId } from 'react';

export function CvResumeIcon({ className = 'h-4 w-4' }: { className?: string }) {
  const id = useId().replace(/:/g, '');

  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Resume / CV"
    >
      <defs>
        {/* Soft background glow */}
        <radialGradient id={`${id}-bg`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#EBF8E5" stopOpacity="1" />
          <stop offset="70%" stopColor="#E2F6DB" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#D5F0CC" stopOpacity="0.5" />
        </radialGradient>

        {/* Folder green gradient */}
        <linearGradient id={`${id}-folder`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#82CD38" />
          <stop offset="50%" stopColor="#67B928" />
          <stop offset="100%" stopColor="#48A21D" />
        </linearGradient>

        {/* Folder back flap gradient */}
        <linearGradient id={`${id}-flap`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#46931E" />
          <stop offset="100%" stopColor="#357A14" />
        </linearGradient>

        {/* Subtle drop shadow */}
        <filter id={`${id}-shadow`} x="-15%" y="-10%" width="130%" height="130%">
          <feDropShadow dx="0" dy="2.5" stdDeviation="2.5" floodColor="#1B460D" floodOpacity="0.16" />
        </filter>
      </defs>

      {/* Circular backdrop */}
      <circle cx="50" cy="50" r="46" fill={`url(#${id}-bg)`} />

      {/* Back document (tilted slightly) */}
      <g transform="rotate(-3.5 50 37)">
        <rect
          x="29"
          y="15.5"
          width="40"
          height="42"
          rx="2.5"
          fill="#F8FAFC"
          stroke="#CBD5E1"
          strokeWidth="0.8"
        />
      </g>

      {/* Front document */}
      <g>
        <rect
          x="31"
          y="16.5"
          width="40.5"
          height="44"
          rx="2.5"
          fill="#FFFFFF"
          stroke="#CBD5E1"
          strokeWidth="0.8"
        />

        {/* Avatar Box */}
        <rect
          x="34.5"
          y="19.8"
          width="12"
          height="13.8"
          rx="1.5"
          fill="#F1F5F9"
          stroke="#E2E8F0"
          strokeWidth="0.6"
        />

        {/* Person avatar */}
        <circle cx="40.5" cy="24.5" r="2.5" fill="#FDBA8C" />
        <path
          d="M 37.8 24.2 C 37.8 22 39.2 21.2 40.5 21.2 C 42.2 21.2 43.5 22 43.5 24.2 C 43 24.5 43.2 25.2 43.5 25.5 C 42.5 25.5 42 24.7 40.5 24.7 C 39.2 24.7 38.8 25.5 38.2 25.5 C 38.2 25.2 37.8 24.5 37.8 24.2 Z"
          fill="#78350F"
        />
        <path d="M 35.2 33.6 C 35.2 30.2 37.2 28.8 40.5 28.8 C 43.8 28.8 45.8 30.2 45.8 33.6 Z" fill="#334155" />
        <polygon points="39.3,28.8 41.7,28.8 40.5,31.2" fill="#FFFFFF" />
        <polygon points="40,30 41,30 41.3,33.4 40.5,33.9 39.7,33.4" fill="#0284C7" />

        {/* Multi-colored text lines next to avatar */}
        <rect x="49" y="21.2" width="18" height="1.8" rx="0.9" fill="#4F46E5" fillOpacity="0.85" />
        <rect x="49" y="24.8" width="14" height="1.6" rx="0.8" fill="#0EA5E9" fillOpacity="0.85" />
        <rect x="49" y="28.2" width="11" height="1.6" rx="0.8" fill="#10B981" fillOpacity="0.85" />
        <rect x="49" y="31.6" width="16" height="1.6" rx="0.8" fill="#F59E0B" fillOpacity="0.85" />

        {/* Multi-colored lower document lines */}
        <rect x="34.5" y="36.8" width="33.5" height="1.6" rx="0.8" fill="#6366F1" fillOpacity="0.8" />
        <rect x="34.5" y="40.3" width="28" height="1.6" rx="0.8" fill="#0D9488" fillOpacity="0.8" />
        <rect x="34.5" y="43.8" width="31" height="1.6" rx="0.8" fill="#EC4899" fillOpacity="0.75" />
      </g>

      {/* Folder back flap */}
      <path
        d="M 26 43 C 26 41 27.5 39.5 29.5 39.5 L 43 39.5 C 44.5 39.5 46 40.5 47 42 L 48.5 44 L 71.5 44 C 73 44 74 45 74 46.5 L 74 54 L 26 54 Z"
        fill={`url(#${id}-flap)`}
      />

      {/* Folder front body */}
      <g filter={`url(#${id}-shadow)`}>
        <path
          d="M 26 49 C 26 47 27.5 45.5 29.5 45.5 L 41.5 45.5 C 43.5 45.5 45 47 46.5 49 L 48.5 51.5 L 71 51.5 C 73 51.5 74 52.8 74 54.8 L 74 76.5 C 74 80 71 82.5 67.5 82.5 L 32.5 82.5 C 29 82.5 26 80 26 76.5 Z"
          fill={`url(#${id}-folder)`}
        />
      </g>

      {/* Top bevel sheen on folder */}
      <path
        d="M 29.5 46.2 L 41.5 46.2 C 43.2 46.2 44.5 47.4 45.8 49.3 L 47.8 51.8 C 48.3 52.4 49 52.8 49.8 52.8 L 71 52.8"
        stroke="rgba(255,255,255,0.4)"
        strokeWidth="1.2"
        strokeLinecap="round"
        fill="none"
      />

      {/* Bold "CV" text */}
      <g fill="#FFFFFF">
        {/* C */}
        <path d="M 48.2 62.8 C 47.2 59.2 44.2 56.8 40.2 56.8 C 34.8 56.8 30.5 61.2 30.5 67 C 30.5 72.8 34.8 77.2 40.2 77.2 C 44.2 77.2 47.2 74.8 48.2 71.2 L 43.8 71.2 C 43 72.8 41.8 73.7 40.2 73.7 C 36.8 73.7 34.3 70.8 34.3 67 C 34.3 63.2 36.8 60.3 40.2 60.3 C 41.8 60.3 43 61.2 43.8 62.8 Z" />

        {/* V */}
        <path d="M 49.8 57.3 L 53.8 57.3 L 58.8 71.8 L 63.8 57.3 L 67.8 57.3 L 60.8 76.7 L 56.8 76.7 Z" />
      </g>
    </svg>
  );
}

export function LinkedInIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.25a1.62 1.62 0 1 0 0 3.24 1.62 1.62 0 0 0 0-3.24z" />
    </svg>
  );
}

export function GitHubIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  );
}
