import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MangaNotFound, getChapter, getChapterFeed, getChapterPages } from "../../../lib/mangadex";
import { SaveProgress } from "../../../components/SaveProgress";
import { MessageState } from "../../../components/ui/States";
import type { MangadexChapter } from "../../../types";

// Page image URLs from MangaDex@Home expire within minutes, so this page is never cached
export const dynamic = "force-dynamic";

export const metadata: Metadata = { robots: { index: false } };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ saver?: string }> };

export default async function ChapterPage({ params, searchParams }: Props) {
  const [{ id }, { saver }] = await Promise.all([params, searchParams]);
  if (!UUID.test(id)) notFound();
  const dataSaver = saver !== "0";

  let chapter: MangadexChapter;
  try {
    chapter = await getChapter(id);
  } catch (error) {
    if (error instanceof MangaNotFound) notFound();
    throw error;
  }

  const mangaRel = chapter.relationships.find((r) => r.type === "manga");
  const mangaId = mangaRel?.id ?? null;
  const mangaTitleMap = (mangaRel?.attributes?.title ?? {}) as Record<string, string>;
  const mangaName = mangaTitleMap.en ?? Object.values(mangaTitleMap)[0] ?? "Manga";
  const { chapter: num, title, translatedLanguage } = chapter.attributes;

  const [pages, feed] = await Promise.all([
    getChapterPages(id, dataSaver).catch(() => null),
    mangaId ? getChapterFeed(mangaId, translatedLanguage).catch(() => []) : Promise.resolve([] as MangadexChapter[]),
  ]);
  const index = feed.findIndex((c) => c.id === id);
  const prev = index > 0 ? feed[index - 1] : null;
  const next = index >= 0 && index < feed.length - 1 ? feed[index + 1] : null;

  const toggleHref = `/chapter/${id}${dataSaver ? "?saver=0" : ""}`;
  const navCls = "inline-flex h-10 items-center rounded-full border px-4 text-sm font-semibold";
  const chapterLink = (c: MangadexChapter | null, label: string) =>
    c ? (
      <Link href={`/chapter/${c.id}${dataSaver ? "" : "?saver=0"}`} className={`${navCls} border-rune-strong text-parchment hover:border-gold hover:text-gold`}>
        {label}
      </Link>
    ) : (
      <span className={`${navCls} border-rune text-ash-dim`} aria-disabled="true">
        {label}
      </span>
    );

  return (
    <div>
      {mangaId && num && <SaveProgress mangaId={mangaId} chapterId={id} chapterNumber={num} />}

      <div className="sticky top-0 z-10 border-b border-rune bg-obsidian/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-5 gap-y-2 px-4 py-3 sm:px-8">
          {mangaId && (
            <Link href={`/manga/${mangaId}`} className="text-sm font-semibold text-ash hover:text-parchment">
              ← {mangaName}
            </Link>
          )}
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-xl font-semibold leading-tight">{num ? `Chapter ${num}` : "Oneshot"}</h1>
            {title && <p className="truncate text-xs text-ash">{title}</p>}
          </div>
          <Link
            href={toggleHref}
            className="text-xs font-semibold uppercase tracking-[0.1em] text-ash hover:text-gold"
            title="Lower-quality images load faster"
          >
            Data saver: {dataSaver ? "on" : "off"}
          </Link>
          <nav aria-label="Chapters" className="flex gap-2">
            {chapterLink(prev, "← Prev")}
            {chapterLink(next, "Next →")}
          </nav>
        </div>
      </div>

      {pages === null ? (
        <MessageState as="h2" title="The pages are out of reach" action={<Link href={`/chapter/${id}`} className="text-sm font-semibold">Try again →</Link>}>
          MangaDex couldn&apos;t serve this chapter right now.
        </MessageState>
      ) : pages.length === 0 ? (
        <MessageState as="h2" title="No pages here">
          This chapter has no pages on MangaDex; it may be published on an official site instead.
        </MessageState>
      ) : (
        <div className="mx-auto flex max-w-[900px] flex-col">
          {pages.map((src, i) => (
            // Pages come from rotating MangaDex@Home servers, which next/image can't allow-list
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={src}
              src={src}
              alt={`Page ${i + 1}`}
              loading={i < 3 ? "eager" : "lazy"}
              decoding="async"
              width={900}
              height={1300}
              className="h-auto w-full bg-crypt"
            />
          ))}
        </div>
      )}

      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-4 py-10 sm:px-8">
        <span className="text-sm text-ash">{pages?.length ?? 0} pages</span>
        <nav aria-label="Chapters" className="flex gap-2">
          {chapterLink(prev, "← Previous chapter")}
          {chapterLink(next, "Next chapter →")}
        </nav>
      </div>
    </div>
  );
}
