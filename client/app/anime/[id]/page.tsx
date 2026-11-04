import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { getAnimePage, isNotFound } from "../../../lib/anime";
import { ArchCover } from "../../../components/ui/ArchCover";
import { Chip } from "../../../components/ui/Chip";
import { Stat } from "../../../components/ui/Stat";
import { LedgerPanel } from "../../../components/LedgerPanel";
import { Tavern } from "../../../components/Tavern";

// Built on first visit, then refreshed at most hourly
export const revalidate = 3600;
export const generateStaticParams = async () => [];

const load = cache(async (id: string) => {
  try {
    return await getAnimePage(id);
  } catch (error) {
    if (isNotFound(error)) notFound();
    throw error; // AniList outage: the error page offers a retry
  }
});

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { anime } = await load((await params).id);
  return {
    title: anime.title,
    description: anime.synopsis?.slice(0, 200) ?? undefined,
    openGraph: { title: anime.title, images: anime.coverImage ? [anime.coverImage] : [] },
    alternates: { canonical: `/anime/${anime.id}` },
  };
}

const formatAiring = (unix: number) =>
  new Date(unix * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });

export default async function AnimePage({ params }: Props) {
  const { anime, episodes, themes } = await load((await params).id);

  const eyebrow = [anime.format, anime.season && anime.year ? `${anime.season} ${anime.year}` : anime.year, anime.studios[0]]
    .filter(Boolean)
    .join(" · ");
  const altTitles = [anime.titleEnglish, anime.titleNative].filter((t) => t && t !== anime.title);
  const facts: [string, React.ReactNode][] = [
    ["Aired", anime.aired],
    ["Status", anime.status],
    ["Studio", anime.studios.join(", ") || null],
    ["Source", anime.source],
    ["Rating", anime.rating],
    [
      "Next episode",
      anime.nextEpisode ? `Ep ${anime.nextEpisode.episode} · ${formatAiring(anime.nextEpisode.airingAt)}` : null,
    ],
  ];

  return (
    <>
      <section className="border-b border-rune bg-crypt">
        <div className="mx-auto flex max-w-7xl flex-wrap items-end gap-8 px-4 py-10 sm:gap-12 sm:px-8 sm:py-14">
          <div className="w-44 flex-none sm:w-[260px]">
            <ArchCover src={anime.coverImage} alt={`${anime.title} cover art`} />
          </div>
          <div className="flex min-w-0 flex-[999_1_480px] flex-col gap-4">
            <nav aria-label="Breadcrumb" className="flex gap-2 text-[13px] text-ash-dim">
              <Link href="/search" className="text-ash">
                Anime
              </Link>
              <span aria-hidden="true">/</span>
              <span className="truncate text-parchment">{anime.title}</span>
            </nav>
            {eyebrow && <span className="eyebrow text-gold">{eyebrow}</span>}
            <h1 className="font-display text-[clamp(40px,5vw,68px)] font-semibold leading-none">{anime.title}</h1>
            {altTitles.length > 0 && <p className="text-base text-ash">{altTitles.join(" · ")}</p>}
            <dl className="flex flex-wrap gap-8 pt-2">
              {anime.score && <Stat value={anime.score.toFixed(1)} label="Score" accent />}
              {anime.rank && <Stat value={`#${anime.rank}`} label="Ranked" />}
              {anime.episodes && <Stat value={anime.episodes} label="Episodes" />}
              {anime.duration && <Stat value={`${anime.duration}m`} label="Per ep" />}
              {!anime.rank && anime.popularityRank && <Stat value={`#${anime.popularityRank}`} label="Popularity" />}
            </dl>
          </div>
        </div>
      </section>

      <div className="mx-auto flex max-w-7xl flex-wrap items-start gap-12 px-4 pb-8 pt-12 sm:px-8">
        <div className="flex min-w-0 flex-[999_1_560px] flex-col gap-12">
          <section className="flex flex-col gap-4">
            <h2 className="font-display text-[30px] font-semibold">The tale</h2>
            {anime.genres.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {anime.genres.map((g) => (
                  <Chip key={g} href={`/search?genre=${encodeURIComponent(g)}`}>
                    {g}
                  </Chip>
                ))}
              </div>
            )}
            <p className="max-w-[720px] whitespace-pre-line text-[17px] leading-[1.75] text-parchment-soft">
              {anime.synopsis ?? "No synopsis has been written for this title yet."}
            </p>
            {anime.tags.length > 0 && (
              <p className="text-[13px] text-ash-dim">Themes: {anime.tags.join(" · ")}</p>
            )}
          </section>

          {anime.trailerUrl && (
            <section className="flex flex-col gap-4">
              <h2 className="font-display text-[30px] font-semibold">Trailer</h2>
              <div className="aspect-video overflow-hidden rounded-xl border border-rune bg-crypt">
                <iframe
                  src={anime.trailerUrl}
                  title={`${anime.title} trailer`}
                  className="h-full w-full"
                  loading="lazy"
                  allow="encrypted-media; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </section>
          )}

          {episodes.length > 0 && <Episodes episodes={episodes} />}

          {(themes.openings.length > 0 || themes.endings.length > 0) && (
            <section className="flex flex-col gap-4">
              <h2 className="font-display text-[30px] font-semibold">Songs of the tale</h2>
              <div className="grid gap-6 sm:grid-cols-2">
                {(
                  [
                    ["Openings", themes.openings],
                    ["Endings", themes.endings],
                  ] as const
                ).map(
                  ([label, songs]) =>
                    songs.length > 0 && (
                      <div key={label} className="flex flex-col gap-2">
                        <h3 className="eyebrow">{label}</h3>
                        <ol className="flex flex-col gap-1.5 text-[15px] text-parchment-soft">
                          {songs.map((s) => (
                            <li key={s}>{s}</li>
                          ))}
                        </ol>
                      </div>
                    ),
                )}
              </div>
            </section>
          )}

          {anime.relations.length > 0 && (
            <section className="flex flex-col gap-4">
              <h2 className="font-display text-[30px] font-semibold">Related tales</h2>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4">
                {anime.relations.map((r) => (
                  <Link
                    key={`${r.type}-${r.id}`}
                    href={r.type === "anime" ? `/anime/${r.id}` : `/search?type=manga&q=${encodeURIComponent(r.id)}`}
                    className="flex items-center gap-3.5 rounded-[10px] border border-rune bg-crypt p-3.5 text-parchment hover:border-gold hover:text-parchment"
                  >
                    <span
                      className={`relative h-[66px] w-12 flex-none overflow-hidden bg-vault ${
                        r.type === "anime" ? "rounded-[24px_24px_4px_4px]" : "rounded"
                      }`}
                    >
                      {r.coverImage && <Image src={r.coverImage} alt="" fill sizes="48px" className="object-cover" />}
                    </span>
                    <span className="flex min-w-0 flex-col gap-1">
                      <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-gold">
                        {r.relation}
                        {r.type === "manga" ? " · Manga" : ""}
                      </span>
                      <span className="line-clamp-2 text-[15px] font-semibold">{r.title}</span>
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          <Tavern type="anime" contentId={anime.id} />
        </div>

        <div className="w-full flex-[1_1_300px] lg:w-auto">
          <LedgerPanel type="anime" contentId={anime.id} total={anime.episodes}>
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2.5 border-t border-rune pt-4 text-sm">
              {facts
                .filter(([, v]) => v)
                .map(([k, v]) => (
                  <div key={k} className="contents">
                    <dt className="text-ash-dim">{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
            </dl>
          </LedgerPanel>
        </div>
      </div>
    </>
  );
}

function Episodes({ episodes }: { episodes: { number: number | null; title: string; url: string | null }[] }) {
  const row = (ep: (typeof episodes)[number], i: number) => (
    <li key={`${ep.number ?? i}-${ep.title}`} className="flex items-center gap-5 border-b border-rune py-3.5">
      <span className="w-9 font-display text-2xl text-ash-dim">{ep.number ?? i + 1}</span>
      {ep.url ? (
        <a href={ep.url} className="min-w-0 flex-1 text-[15px] font-medium text-parchment hover:text-gold" rel="noopener noreferrer" target="_blank">
          {ep.title}
        </a>
      ) : (
        <span className="min-w-0 flex-1 text-[15px] font-medium">{ep.title}</span>
      )}
    </li>
  );
  const first = episodes.slice(0, 8);
  const rest = episodes.slice(8);

  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-display text-[30px] font-semibold">Episodes</h2>
      <ol className="border-t border-rune">{first.map(row)}</ol>
      {rest.length > 0 && (
        <details className="group">
          <summary className="cursor-pointer list-none text-sm font-semibold text-crimson-light hover:text-crimson-glow">
            <span className="group-open:hidden">All {episodes.length} episodes →</span>
            <span className="hidden group-open:inline">Show fewer</span>
          </summary>
          <ol className="mt-2">{rest.map((ep, i) => row(ep, i + 8))}</ol>
        </details>
      )}
    </section>
  );
}
