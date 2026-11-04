import Image from "next/image";
import Link from "next/link";
import { getHomeAnime } from "../lib/anime";
import { listManga, mangaCover, mangaTitle, capitalize } from "../lib/mangadex";
import { getQuote } from "../lib/quotes";
import { animeMeta, currentSeason, roman, seasonLabel } from "../lib/format";
import { PosterCard, PosterGrid } from "../components/ui/PosterCard";
import { SectionHeading } from "../components/ui/SectionHeading";
import { Ornament } from "../components/ui/Ornament";
import { Chip } from "../components/ui/Chip";
import { QuickAdd } from "../components/QuickAdd";
import { buttonStyles } from "../components/ui/States";

// Rebuilt at most hourly; each source can fail on its own and its section is simply left out
export const revalidate = 3600;

export default async function HomePage() {
  const { season, year } = currentSeason();
  const [{ top, seasonal }, manga, quote] = await Promise.all([
    getHomeAnime(season, year),
    listManga({ order: "followedCount", limit: 6 }).catch(() => null),
    getQuote(),
  ]);

  const rising = seasonal.status === "fulfilled" ? seasonal.value.results : [];
  const legends = top.status === "fulfilled" ? top.value.results.slice(0, 5) : [];
  const hero = rising[0] ?? legends[0];

  return (
    <>
      {hero && (
        <section className="mx-auto flex max-w-7xl flex-wrap items-center gap-14 px-4 pb-14 pt-12 sm:px-8 sm:pt-[72px]">
          <div className="flex min-w-0 flex-[999_1_520px] flex-col gap-5">
            <div className="eyebrow flex items-center gap-3 text-gold">
              <span className="h-px w-8 bg-gold" aria-hidden="true" />
              {rising[0] ? "Featured this season" : "Highest rated"}
            </div>
            <h1 className="font-display text-[clamp(44px,6vw,80px)] font-semibold leading-[0.98] tracking-[-0.01em]">
              {hero.title}
            </h1>
            <div className="flex flex-wrap gap-2.5 text-[13px] text-ash">
              {hero.score && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-vault px-3 py-1.5 font-bold text-gold">
                  ★ {hero.score.toFixed(1)}
                </span>
              )}
              {animeMeta(hero) && <Chip>{animeMeta(hero)}</Chip>}
              {hero.genres.slice(0, 3).map((g) => (
                <Chip key={g} href={`/search?genre=${encodeURIComponent(g)}`}>
                  {g}
                </Chip>
              ))}
            </div>
            {hero.synopsis && <p className="max-w-[560px] text-[17px] leading-[1.65] text-parchment-soft">{hero.synopsis}</p>}
            <div className="flex flex-wrap gap-3 pt-1.5">
              <QuickAdd type="anime" contentId={hero.id} detailHref={`/anime/${hero.id}`} />
              <Link href={`/anime/${hero.id}`} className={buttonStyles.secondary}>
                View details
              </Link>
            </div>
          </div>
          <div className="flex flex-[1_1_300px] justify-center">
            <Link
              href={`/anime/${hero.id}`}
              className="block aspect-[5/7] w-full max-w-[400px] rounded-[var(--radius-arch)] border border-gold p-2.5"
              aria-label={hero.title}
            >
              <div className="relative h-full w-full overflow-hidden rounded-[190px_190px_4px_4px] bg-vault">
                {hero.coverImage && (
                  <Image src={hero.coverImage} alt="" fill priority sizes="400px" className="object-cover" />
                )}
              </div>
            </Link>
          </div>
        </section>
      )}

      <Ornament className="mx-auto max-w-7xl px-4 sm:px-8" />

      {rising.length > 1 && (
        <section className="mx-auto flex max-w-7xl flex-col gap-6 px-4 pb-6 pt-14 sm:px-8">
          <SectionHeading
            eyebrow={seasonLabel(season, year)}
            title="Rising this season"
            action={{ href: `/seasons?season=${season}&year=${year}`, label: "See the full season" }}
          />
          <PosterGrid>
            {rising.slice(1, 13).map((a, i) => (
              <PosterCard
                key={a.id}
                href={`/anime/${a.id}`}
                title={a.title}
                image={a.coverImage}
                score={a.score}
                meta={animeMeta(a)}
                priority={i < 6}
              />
            ))}
          </PosterGrid>
        </section>
      )}

      {legends.length > 0 && (
        <section className="mx-auto flex max-w-7xl flex-wrap gap-12 px-4 pb-6 pt-14 sm:px-8">
          <div className="flex flex-[1_1_280px] flex-col gap-3.5">
            <span className="eyebrow">All-time</span>
            <h2 className="font-display text-4xl font-semibold leading-[1.05]">Hall of Legends</h2>
            <p className="text-[15px] leading-relaxed text-ash">The highest-rated stories in the archive, ranked by community score.</p>
            <Link href="/search?sort=score" className="text-sm font-semibold">
              Full rankings <span aria-hidden="true">→</span>
            </Link>
          </div>
          <ol className="flex min-w-0 flex-[999_1_560px] flex-col border-t border-rune">
            {legends.map((a, i) => (
              <li key={a.id} className="border-b border-rune">
                <Link href={`/anime/${a.id}`} className="flex items-center gap-4 py-4 text-parchment hover:text-parchment sm:gap-5">
                  <span className="w-11 font-display text-[32px] font-semibold text-gold">{roman(i + 1)}</span>
                  <span className="relative h-[60px] w-11 flex-none overflow-hidden rounded-[22px_22px_4px_4px] bg-vault">
                    {a.coverImage && <Image src={a.coverImage} alt="" fill sizes="44px" className="object-cover" />}
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col gap-1">
                    <span className="truncate text-base font-semibold">{a.title}</span>
                    <span className="text-[13px] text-ash">{animeMeta(a)}</span>
                  </span>
                  {a.score && <span className="text-[15px] font-bold text-gold">★ {a.score.toFixed(1)}</span>}
                </Link>
              </li>
            ))}
          </ol>
        </section>
      )}

      {manga && manga.results.length > 0 && (
        <section className="mx-auto flex max-w-7xl flex-col gap-6 px-4 pb-6 pt-14 sm:px-8">
          <SectionHeading eyebrow="Manga · via MangaDex" title="From the Archive" action={{ href: "/manga", label: "Browse manga" }} />
          <PosterGrid>
            {manga.results.map((m) => (
              <PosterCard
                key={m.id}
                href={`/manga/${m.id}`}
                title={mangaTitle(m)}
                image={mangaCover(m, 256)}
                meta={capitalize(m.attributes.status)}
                shape="rect"
              />
            ))}
          </PosterGrid>
        </section>
      )}

      <figure className="mx-auto flex max-w-[880px] flex-col items-center gap-5 px-4 py-24 text-center sm:px-8">
        <svg width="40" height="14" viewBox="0 0 40 14" aria-hidden="true">
          <path d="M0 7h14M26 7h14" className="stroke-gold" strokeWidth="1" />
          <path d="M20 0 L27 7 L20 14 L13 7 Z" fill="none" className="stroke-gold" strokeWidth="1" />
        </svg>
        <blockquote className="font-display text-[clamp(26px,3.4vw,38px)] font-medium italic leading-[1.3]">
          &ldquo;{quote.content}&rdquo;
        </blockquote>
        <figcaption className="text-[13px] font-semibold uppercase tracking-[0.16em] text-ash">
          {quote.character.name} — {quote.anime.name}
        </figcaption>
      </figure>
    </>
  );
}
