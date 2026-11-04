import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import {
  MangaNotFound,
  capitalize,
  getChapterFeed,
  getMangaDetails,
  languageName,
  mangaAltTitle,
  mangaCover,
  mangaDescription,
  mangaGenres,
  mangaPeople,
  mangaTitle,
} from "../../../lib/mangadex";
import { ArchCover } from "../../../components/ui/ArchCover";
import { Chip } from "../../../components/ui/Chip";
import { Stat } from "../../../components/ui/Stat";
import { LedgerPanel } from "../../../components/LedgerPanel";
import { Tavern } from "../../../components/Tavern";
import { ContinueReading } from "../../../components/ContinueReading";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const load = cache(async (id: string) => {
  if (!UUID.test(id)) notFound();
  try {
    return await getMangaDetails(id);
  } catch (error) {
    if (error instanceof MangaNotFound) notFound();
    throw error;
  }
});

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ lang?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { manga } = await load((await params).id);
  const title = mangaTitle(manga);
  const cover = mangaCover(manga);
  return {
    title,
    description: mangaDescription(manga)?.slice(0, 200),
    openGraph: { title, images: cover ? [cover] : [] },
    alternates: { canonical: `/manga/${manga.id}` },
  };
}

export default async function MangaPage({ params, searchParams }: Props) {
  const [{ id }, { lang: requested }] = await Promise.all([params, searchParams]);
  const { manga, rating, follows } = await load(id);
  const a = manga.attributes;
  const title = mangaTitle(manga);

  const languages = a.availableTranslatedLanguages.filter(Boolean).sort((x, y) => (x === "en" ? -1 : y === "en" ? 1 : x.localeCompare(y)));
  const lang = requested && languages.includes(requested) ? requested : (languages[0] ?? "en");
  const chapters = await getChapterFeed(id, lang).catch(() => null);

  const authors = mangaPeople(manga, "author");
  const artists = mangaPeople(manga, "artist");
  const lastChapter = a.lastChapter ? Number(a.lastChapter) || null : null;
  const description = mangaDescription(manga);
  const eyebrow = ["Manga", capitalize(a.status), a.year, capitalize(a.publicationDemographic as string | null)]
    .filter(Boolean)
    .join(" · ");
  const facts: [string, React.ReactNode][] = [
    ["Author", authors.join(", ") || null],
    ["Artist", artists.join(", ") !== authors.join(", ") ? artists.join(", ") || null : null],
    ["Status", capitalize(a.status)],
    ["Original", languageName(a.originalLanguage)],
    ["Rating", capitalize(a.contentRating)],
  ];

  return (
    <>
      <section className="border-b border-rune bg-crypt">
        <div className="mx-auto flex max-w-7xl flex-wrap items-end gap-8 px-4 py-10 sm:gap-12 sm:px-8 sm:py-14">
          <div className="w-44 flex-none sm:w-[260px]">
            <ArchCover src={mangaCover(manga)} alt={`${title} cover`} shape="rect" />
          </div>
          <div className="flex min-w-0 flex-[999_1_480px] flex-col gap-4">
            <nav aria-label="Breadcrumb" className="flex gap-2 text-[13px] text-ash-dim">
              <Link href="/manga" className="text-ash">
                Manga
              </Link>
              <span aria-hidden="true">/</span>
              <span className="truncate text-parchment">{title}</span>
            </nav>
            <span className="eyebrow text-gold">{eyebrow}</span>
            <h1 className="font-display text-[clamp(40px,5vw,68px)] font-semibold leading-none">{title}</h1>
            {mangaAltTitle(manga) && <p className="text-base text-ash">{mangaAltTitle(manga)}</p>}
            <dl className="flex flex-wrap gap-8 pt-2">
              {rating && <Stat value={rating.toFixed(1)} label="Score" accent />}
              {follows != null && <Stat value={follows.toLocaleString("en-US")} label="Followers" />}
              {chapters && chapters.length > 0 && <Stat value={chapters.length} label={`Chapters · ${lang.toUpperCase()}`} />}
              {a.lastVolume && <Stat value={a.lastVolume} label="Volumes" />}
            </dl>
            <div className="pt-2">
              <ContinueReading mangaId={id} firstChapterId={chapters?.[0]?.id ?? null} />
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto flex max-w-7xl flex-wrap items-start gap-12 px-4 pb-8 pt-12 sm:px-8">
        <div className="flex min-w-0 flex-[999_1_560px] flex-col gap-12">
          <section className="flex flex-col gap-4">
            <h2 className="font-display text-[30px] font-semibold">The tale</h2>
            <div className="flex flex-wrap gap-2">
              {mangaGenres(manga).map((g) => (
                <Chip key={g}>{g}</Chip>
              ))}
            </div>
            <p className="max-w-[720px] whitespace-pre-line text-[17px] leading-[1.75] text-parchment-soft">
              {description ?? "No description has been written for this title yet."}
            </p>
          </section>

          <section className="flex flex-col gap-4" aria-labelledby="chapters">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h2 id="chapters" className="font-display text-[30px] font-semibold">
                Chapters
              </h2>
              {languages.length > 1 && (
                <nav aria-label="Chapter language" className="flex flex-wrap gap-1.5">
                  {languages.map((l) => (
                    <Link
                      key={l}
                      href={`/manga/${id}?lang=${l}#chapters`}
                      aria-current={l === lang ? "true" : undefined}
                      scroll={false}
                      className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                        l === lang ? "border-parchment bg-parchment text-obsidian hover:text-obsidian" : "border-rune-strong text-parchment-soft"
                      }`}
                    >
                      {languageName(l)}
                    </Link>
                  ))}
                </nav>
              )}
            </div>
            {chapters === null ? (
              <p className="text-[15px] text-ash">Chapters are unavailable right now. Please try again shortly.</p>
            ) : chapters.length === 0 ? (
              <p className="text-[15px] text-ash">
                No chapters can be read here in {languageName(lang)}. Some series are only published on official sites.
              </p>
            ) : (
              <ol className="max-h-[560px] overflow-y-auto border-y border-rune pr-1">
                {chapters.map((c) => (
                  <li key={c.id} className="border-b border-rune last:border-b-0">
                    <Link
                      href={`/chapter/${c.id}`}
                      className="flex items-baseline gap-4 py-3 text-parchment hover:text-gold"
                    >
                      <span className="w-20 flex-none font-display text-xl text-ash-dim">
                        {c.attributes.chapter ? `Ch. ${c.attributes.chapter}` : "Oneshot"}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-[15px]">
                        {c.attributes.title || (c.attributes.volume ? `Volume ${c.attributes.volume}` : "")}
                      </span>
                    </Link>
                  </li>
                ))}
              </ol>
            )}
          </section>

          <Tavern type="manga" contentId={id} />
        </div>

        <div className="w-full flex-[1_1_300px] lg:w-auto">
          <LedgerPanel type="manga" contentId={id} total={lastChapter}>
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
