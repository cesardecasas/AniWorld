export function Ornament({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-4 ${className}`} aria-hidden="true">
      <span className="h-px flex-1 bg-rune" />
      <svg width="14" height="14" viewBox="0 0 14 14">
        <path d="M7 0 L14 7 L7 14 L0 7 Z" className="fill-gold" />
      </svg>
      <span className="h-px flex-1 bg-rune" />
    </div>
  );
}
