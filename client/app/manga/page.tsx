import type { Metadata } from "next";
import Link from "next/link";
import { listManga, mangaCover, mangaTitle, capitalize } from "../../lib/mangadex";
import { PosterCard, PosterGrid } from "../../components/ui/PosterCard";
import { SectionHeading } from "../../components/ui/SectionHeading";
import { Ornament } from "../../components/ui/Ornament";
import { buttonStyles } from "../../components/ui/States";
import type { MangadexManga } from "../../types";

export const revalidate = 3600;
export const metadata: Metadata = { title: "Manga", description: "Popular, newly updated and new manga, readable chapter by chapter." };

export default async function MangaBrowsePage() {
  const year = new Date().getFullYear();
  const [popular, updated, fresh] = await Promise.all([
    listManga({ order: "followedCount", limit: 12 }).catch(() => null),
    listManga({ order: "latestUploadedChapter", limit: 12 }).catch(() => null),
    listManga({ order: "followedCount", limit: 12, year }).catch(() => null),
  ]);

  const shelf = (eyebrow: string, title: string, list: { results: MangadexManga[] } | null, priority = false) =>
    list &&
    list.results.length > 0 && (
      <section className="flex flex-col gap-6">
        <SectionHeading eyebrow={eyebrow} title={title} />
        <PosterGrid>
          {list.results.map((m, i) => (
            <PosterCard
              key={m.id}
              href={`/manga/${m.id}`}
              title={mangaTitle(m)}
              image={mangaCover(m, 256)}
              meta={[capitalize(m.attributes.status), m.attributes.year].filter(Boolean).join(" · ")}
              shape="rect"
              priority={priority && i < 6}
            />
          ))}
        </PosterGrid>
      </section>
    );

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-14 px-4 pt-12 sm:px-8">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div className="flex max-w-2xl flex-col gap-3">
          <span className="eyebrow text-gold">Manga · via MangaDex</span>
          <h1 className="font-display text-[clamp(44px,6vw,72px)] font-semibold leading-none">The Archive</h1>
          <p className="text-[17px] leading-relaxed text-parchment-soft">
            Thousands of series, readable chapter by chapter. Your place is saved as you read.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/search?type=manga" className={buttonStyles.secondary}>
            Search manga
          </Link>
          {/* Not prefetched: the route redirects to a different manga every time */}
          <Link href="/manga/random" prefetch={false} className={buttonStyles.gold}>
            Random manga
          </Link>
        </div>
      </div>

      {shelf("Most followed", "Popular now", popular, true)}
      <Ornament />
      {shelf("Fresh ink", "Recently updated", updated)}
      {shelf(`Published in ${year}`, "New this year", fresh)}
    </div>
  );
}
