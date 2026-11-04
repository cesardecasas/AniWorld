import Link from "next/link";

const base = "inline-flex h-11 items-center rounded-full border px-5 text-sm font-semibold";
const active = `${base} border-rune-strong text-parchment hover:border-gold hover:text-gold`;
const inactive = `${base} border-rune text-ash-dim`;

/** Previous/next links that keep the rest of the query string */
export function Pagination({
  page,
  hasNext,
  params,
  basePath,
}: {
  page: number;
  hasNext: boolean;
  params: Record<string, string | undefined>;
  basePath: string;
}) {
  const href = (p: number) => {
    const q = new URLSearchParams();
    Object.entries({ ...params, page: p > 1 ? String(p) : undefined }).forEach(([k, v]) => v && q.set(k, v));
    const qs = q.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-3 pt-6">
      {page > 1 ? (
        <Link href={href(page - 1)} className={active} rel="prev">
          ← Previous
        </Link>
      ) : (
        <span className={inactive} aria-disabled="true">
          ← Previous
        </span>
      )}
      <span className="px-2 text-sm text-ash">Page {page}</span>
      {hasNext ? (
        <Link href={href(page + 1)} className={active} rel="next">
          Next →
        </Link>
      ) : (
        <span className={inactive} aria-disabled="true">
          Next →
        </span>
      )}
    </nav>
  );
}
