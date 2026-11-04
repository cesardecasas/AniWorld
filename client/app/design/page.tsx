import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const metadata: Metadata = { title: "Design tokens", robots: { index: false } };

const swatches = [
  ["obsidian", "bg-obsidian"],
  ["crypt", "bg-crypt"],
  ["vault", "bg-vault"],
  ["rune", "bg-rune"],
  ["rune-strong", "bg-rune-strong"],
  ["parchment", "bg-parchment"],
  ["parchment-soft", "bg-parchment-soft"],
  ["ash", "bg-ash"],
  ["ash-dim", "bg-ash-dim"],
  ["crimson", "bg-crimson"],
  ["crimson-light", "bg-crimson-light"],
  ["gold", "bg-gold"],
];

// Development reference for the Dark Fantasy tokens used by the Phase 3 pages
export default function DesignPage() {
  if (process.env.NODE_ENV === "production") notFound();

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-12 px-4 py-16 sm:px-8">
      <header className="flex flex-col gap-3">
        <span className="eyebrow text-gold">AniWorld · design tokens</span>
        <h1 className="font-display text-6xl font-semibold leading-none">
          Frieren: <em className="font-medium text-crimson-light">Beyond Journey&apos;s End</em>
        </h1>
        <p className="max-w-xl text-lg leading-relaxed text-parchment-soft">
          Manrope body text on obsidian, with Cormorant Garamond for display type.
        </p>
      </header>

      <section className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
        {swatches.map(([name, cls]) => (
          <div key={name} className="flex flex-col gap-2">
            <div className={`h-16 rounded-md border border-rune ${cls}`} />
            <span className="text-sm text-ash">{name}</span>
          </div>
        ))}
      </section>

      <section className="flex flex-wrap items-end gap-8">
        <div className="aspect-[5/7] w-56 rounded-[var(--radius-arch)] border border-gold p-2">
          <div className="h-full w-full rounded-[190px_190px_4px_4px] bg-vault" />
        </div>
        <div className="aspect-[2/3] w-36 rounded-[var(--radius-arch-sm)] border border-rune bg-crypt" />
        <div className="flex flex-col gap-3">
          <button className="h-12 rounded-full bg-crimson px-6 font-bold text-on-crimson hover:bg-crimson-light">
            Add to Ledger
          </button>
          <button className="h-11 rounded-full border border-gold px-5 font-semibold text-gold">Sign in</button>
        </div>
      </section>
    </main>
  );
}
