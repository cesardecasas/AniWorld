import type { Metadata } from "next";
import Link from "next/link";
import { listAnime } from "../../lib/anime";
import { FORMATS, GENRES, SORTS, isFormat, isGenre } from "../../lib/anime/filters";
import { listManga, mangaCover, mangaTitle, capitalize } from "../../lib/mangadex";
import { animeMeta } from "../../lib/format";
import { PosterCard, PosterGrid } from "../../components/ui/PosterCard";
import { Pagination } from "../../components/ui/Pagination";
import { MessageState, inputStyles } from "../../components/ui/States";

type SearchParams = { q?: string; type?: string; genre?: string; format?: string; sort?: string; page?: string };
type Props = { searchParams: Promise<SearchParams> };

const PER_PAGE = 24;

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q } = await searchParams;
  return { title: q ? `“${q}”` : "Browse anime", robots: { index: !q } };
}

export default async function SearchPage({ searchParams }: Props) {
  const params = await searchParams;
  const q = params.q?.trim().slice(0, 100) || undefined;
  const type = params.type === "manga" ? "manga" : "anime";
  const genre = isGenre(params.genre);
  const format = isFormat(params.format);
  const sort = SORTS.find((s) => s.value === params.sort) ?? SORTS[0];
  const page = Math.min(Math.max(Number(params.page) || 1, 1), 100);

  const results =
    type === "anime"
      ? await listAnime({ search: q, genre, format, page, perPage: PER_PAGE, sort: q && !params.sort ? ["SEARCH_MATCH"] : sort.anilist })
          .then((r) => ({
            hasNext: r.hasNextPage,
            cards: r.results.map((a) => ({ id: a.id, title: a.title, image: a.coverImage, score: a.score, meta: animeMeta(a) })),
          }))
          .catch(() => null)
      : await listManga({ title: q, limit: PER_PAGE, offset: (page - 1) * PER_PAGE })
          .then((r) => ({
            hasNext: page * PER_PAGE < r.total,
            cards: r.results.map((m) => ({
              id: m.id,
              title: mangaTitle(m),
              image: mangaCover(m, 256),
              score: null,
              meta: [capitalize(m.attributes.status), m.attributes.year].filter(Boolean).join(" · "),
            })),
          }))
          .catch(() => null);

  const heading = q ? `Results for “${q}”` : type === "manga" ? "Browse manga" : genre ? `${genre} anime` : sort.label;
  const keep = { q, genre, format, sort: params.sort ? sort.value : undefined };
  const tab = (t: "anime" | "manga", label: string) => {
    const qs = new URLSearchParams();
    if (q) qs.set("q", q);
    if (t === "manga") qs.set("type", "manga");
    return (
      <Link
        href={`/search${qs.size ? `?${qs}` : ""}`}
        role="tab"
        aria-selected={type === t}
        className={`h-[52px] border-b-2 pt-3 font-display text-2xl font-semibold ${
          type === t ? "border-gold text-parchment hover:text-parchment" : "border-transparent text-ash-dim hover:text-parchment"
        }`}
      >
        {label}
      </Link>
    );
  };

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 pt-12 sm:px-8">
      <div className="flex flex-col gap-1.5">
        <span className="eyebrow">The archive</span>
        <h1 className="font-display text-5xl font-semibold leading-none">{heading}</h1>
      </div>

      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-rune">
        <div role="tablist" aria-label="Media type" className="flex gap-7">
          {tab("anime", "Anime")}
          {tab("manga", "Manga")}
        </div>
      </div>

      <form action="/search" className="flex flex-wrap items-end gap-3">
        {type === "manga" && <input type="hidden" name="type" value="manga" />}
        <label className="flex min-w-[220px] flex-[2_1_220px] flex-col gap-1.5 text-[13px] text-ash">
          Title
          <input type="search" name="q" defaultValue={q} placeholder={type === "manga" ? "Berserk, Vinland Saga…" : "Frieren, Mushishi…"} className={inputStyles} />
        </label>
        {type === "anime" && (
          <>
            <label className="flex flex-[1_1_160px] flex-col gap-1.5 text-[13px] text-ash">
              Genre
              <select name="genre" defaultValue={genre ?? ""} className={inputStyles}>
                <option value="">Any genre</option>
                {GENRES.map((g) => (
                  <option key={g}>{g}</option>
                ))}
              </select>
            </label>
            <label className="flex flex-[1_1_140px] flex-col gap-1.5 text-[13px] text-ash">
              Format
              <select name="format" defaultValue={format ?? ""} className={inputStyles}>
                <option value="">Any format</option>
                {FORMATS.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-[1_1_160px] flex-col gap-1.5 text-[13px] text-ash">
              Sort by
              <select name="sort" defaultValue={params.sort ? sort.value : ""} className={inputStyles}>
                <option value="">{q ? "Best match" : "Most popular"}</option>
                {SORTS.filter((s) => s.value !== "popular" || q).map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
          </>
        )}
        <button type="submit" className="h-11 rounded-full bg-crimson px-6 font-bold text-on-crimson hover:bg-crimson-light">
          Search
        </button>
        {(q || genre || format || params.sort) && (
          <Link href={type === "manga" ? "/search?type=manga" : "/search"} className="flex h-11 items-center px-2 text-sm">
            Clear
          </Link>
        )}
      </form>

      {results === null ? (
        <MessageState as="h2" title="The archive is unreachable" action={null}>
          {type === "manga" ? "MangaDex" : "AniList"} didn&apos;t respond. Please try again in a moment.
        </MessageState>
      ) : results.cards.length === 0 ? (
        <MessageState as="h2" title="Nothing found" action={null}>
          No {type} matched your search. Try a different title or fewer filters.
        </MessageState>
      ) : (
        <>
          <PosterGrid>
            {results.cards.map((c, i) => (
              <PosterCard
                key={c.id}
                href={`/${type}/${c.id}`}
                title={c.title}
                image={c.image}
                score={c.score}
                meta={c.meta}
                shape={type === "manga" ? "rect" : "arch"}
                priority={i < 6}
              />
            ))}
          </PosterGrid>
          <Pagination page={page} hasNext={results.hasNext} params={{ ...keep, type: type === "manga" ? "manga" : undefined }} basePath="/search" />
        </>
      )}
    </div>
  );
}
