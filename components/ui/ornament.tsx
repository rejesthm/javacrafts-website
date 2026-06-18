/** Small engraving-style flourish (gold rules + center diamond) for section headers. */
export function Ornament({ className = "" }: { className?: string }) {
  return (
    <div className={`ornament ${className}`} aria-hidden>
      <svg width="22" height="10" viewBox="0 0 22 10" fill="none">
        <path
          d="M11 0.5 14 5 11 9.5 8 5 11 0.5Z"
          fill="currentColor"
          opacity="0.9"
        />
        <circle cx="2" cy="5" r="1.4" fill="currentColor" opacity="0.7" />
        <circle cx="20" cy="5" r="1.4" fill="currentColor" opacity="0.7" />
      </svg>
    </div>
  );
}
