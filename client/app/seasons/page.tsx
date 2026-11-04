import type { Metadata } from "next";
import Link from "next/link";
import { listAnime } from "../../lib/anime";
import { SEASONS, animeMeta, currentSeason, seasonLabel, type Season } from "../../lib/format";
import { PosterCard, PosterGrid } from "../../components/ui/PosterCard";
import { Pagination } from "../../components/ui/Pagination";
import { MessageState } from "../../components/ui/States";

type Props = { searchParams: Promise<{ season?: string; year?: string; page?: string }> };

const parse = async (searchParams: Props["searchParams"]) => {
  const params = await searchParams;
  const now = currentSeason();
  const season = (SEASONS as readonly string[]).includes(params.season?.toUpperCase() ?? "")
    ? (params.season!.toUpperCase() as Season)
    : now.season;
  const year = Math.min(Math.max(Number(params.year) || now.year, 1960), now.year + 1);
  const page = Math.min(Math.max(Number(params.page) || 1, 1), 20);
  return { season, year, page, now };
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { season, year } = await parse(searchParams);
  return { title: `${seasonLabel(season, year)} anime` };
}

/** Step through seasons: Fall 2026 → Winter 2027 */
const shift = (season: Season, year: number, by: 1 | -1) => {
  const i = SEASONS.indexOf(season) + by;
  if (i < 0) return { season: SEASONS[3], year: year - 1 };
  if (i > 3) return { season: SEASONS[0], year: year + 1 };
  return { season: SEASONS[i], year };
};

export default async function SeasonsPage({ searchParams }: Props) {
  const { season, year, page, now } = await parse(searchParams);
  const result = await listAnime({ season, seasonYear: year, sort: ["POPULARITY_DESC"], perPage: 36, page }).catch(() => null);
  const prev = shift(season, year, -1);
  const next = shift(season, year, 1);
  const nextAllowed = next.year <= now.year + 1;
  const link = (s: { season: Season; year: number }) => `/seasons?season=${s.season}&year=${s.year}`;

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 pt-12 sm:px-8">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div className="flex flex-col gap-1.5">
          <span className="eyebrow">{season === now.season && year === now.year ? "This season" : "Season archive"}</span>
          <h1 className="font-display text-5xl font-semibold leading-none">{seasonLabel(season, year)}</h1>
        </div>
        <nav aria-label="Seasons" className="flex items-center gap-2 text-sm font-semibold">
          <Link href={link(prev)} className="rounded-full border border-rune-strong px-4 py-2 text-parchment hover:border-gold hover:text-gold">
            ← {seasonLabel(prev.season, prev.year)}
          </Link>
          {nextAllowed && (
            <Link href={link(next)} className="rounded-full border border-rune-strong px-4 py-2 text-parchment hover:border-gold hover:text-gold">
              {seasonLabel(next.season, next.year)} →
            </Link>
          )}
        </nav>
      </div>

      <div role="tablist" aria-label={`Seasons of ${year}`} className="flex gap-7 border-b border-rune">
        {SEASONS.map((s) => (
          <Link
            key={s}
            href={link({ season: s, year })}
            role="tab"
            aria-selected={s === season}
            className={`h-[52px] border-b-2 pt-3 font-display text-2xl font-semibold ${
              s === season ? "border-gold text-parchment hover:text-parchment" : "border-transparent text-ash-dim hover:text-parchment"
            }`}
          >
            {seasonLabel(s)}
          </Link>
        ))}
      </div>

      {result === null ? (
        <MessageState as="h2" title="The archive is unreachable" action={null}>
          AniList didn&apos;t respond. Please try again in a moment.
        </MessageState>
      ) : result.results.length === 0 ? (
        <MessageState as="h2" title="No anime recorded" action={null}>
          Nothing has been announced for {seasonLabel(season, year)} yet.
        </MessageState>
      ) : (
        <>
          <PosterGrid>
            {result.results.map((a, i) => (
              <PosterCard key={a.id} href={`/anime/${a.id}`} title={a.title} image={a.coverImage} score={a.score} meta={animeMeta(a)} priority={i < 6} />
            ))}
          </PosterGrid>
          <Pagination page={page} hasNext={result.hasNextPage} params={{ season, year: String(year) }} basePath="/seasons" />
        </>
      )}
    </div>
  );
}
