import Link from "next/link";

export function Chip({ children, href }: { children: React.ReactNode; href?: string }) {
  const cls = "inline-flex items-center rounded-full border border-rune px-3 py-1.5 text-[13px] text-parchment-soft";
  return href ? (
    <Link href={href} className={`${cls} transition-colors hover:border-gold hover:text-gold`}>
      {children}
    </Link>
  ) : (
    <span className={cls}>{children}</span>
  );
}

export function ScoreBadge({ score, className = "" }: { score: number | null; className?: string }) {
  if (score == null || score <= 0) return null;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-obsidian/90 px-2 py-0.5 text-[11px] font-bold text-gold ${className}`}
    >
      <svg width="11" height="11" viewBox="0 0 24 24" className="fill-gold" aria-hidden="true">
        <path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7L12 17.3 5.8 21l1.6-7L2 9.2l7.1-.6z" />
      </svg>
      <span className="sr-only">Score </span>
      {score.toFixed(1)}
    </span>
  );
}
