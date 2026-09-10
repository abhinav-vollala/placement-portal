// Modern flat default avatar: a soft blue-gray gradient disc with a light
// person silhouette (head + shoulders). Perfectly centered horizontally and
// vertically inside the circular frame (viewBox 0 0 100 100), with the shoulders
// cleanly filling the bottom arch of the circular boundary.
export function DefaultAvatar({ className = '' }: { className?: string }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full ${className}`}
      style={{
        background: 'linear-gradient(160deg, #E6EFF9 0%, #C8DBF0 52%, #A8C4E8 100%)',
      }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 100 100" className="block h-full w-full">
        {/* Head: centered at (50, 44) with radius 17.5 */}
        <circle cx="50" cy="44" r="17.5" fill="#FFFFFF" fillOpacity="0.92" />

        {/* Shoulders: smoothly curves down to fill the bottom arch of the circle */}
        <path
          d="M 10 100 C 10 79 28 69 50 69 C 72 69 90 79 90 100 L 94 102 L 6 102 Z"
          fill="#FFFFFF"
          fillOpacity="0.92"
        />
      </svg>
    </span>
  );
}
