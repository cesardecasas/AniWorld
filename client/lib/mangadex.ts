import type { MangadexChapter, MangadexManga } from "../types";

// MangaDex REST API. https://api.mangadex.org/docs
// Uses fetch rather than axios so Next can cache each response (see `revalidate`).

const BASE = "https://api.mangadex.org";

/** Only these ratings are shown anywhere on the site; MangaDex includes erotica unless told otherwise */
export const CONTENT_RATINGS = ["safe", "suggestive"];

export class MangaNotFound extends Error {}

type Params = Record<string, string | number | boolean | string[] | undefined>;

const toQuery = (params: Params) => {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined) return;
    if (Array.isArray(value)) value.forEach((v) => q.append(key, v));
    else q.append(key, String(value));
  });
  return q.toString();
};

async function md<T>(path: string, params: Params = {}, revalidate: number | false = 3600): Promise<T> {
  const res = await fetch(`${BASE}/${path}?${toQuery(params)}`, {
    headers: { accept: "application/json" },
    signal: AbortSignal.timeout(8000),
    ...(revalidate === false ? { cache: "no-store" as const } : { next: { revalidate } }),
  });
  if (res.status === 404) throw new MangaNotFound(path);
  if (!res.ok) throw new Error(`MangaDex ${path} responded ${res.status}`);
  return res.json();
}

/* ── Lists ─────────────────────────────────────────── */

export interface MangaListOptions {
  order?: "followedCount" | "latestUploadedChapter" | "relevance" | "rating";
  limit?: number;
  offset?: number;
  year?: number;
  title?: string;
  ids?: string[];
}

export async function listManga({ order = "followedCount", limit = 12, offset = 0, year, title, ids }: MangaListOptions) {
  const data = await md<{ data: MangadexManga[]; total: number }>("manga", {
    limit,
    offset,
    year,
    title: title || undefined,
    "ids[]": ids,
    [`order[${title && order === "followedCount" ? "relevance" : order}]`]: "desc",
    "includes[]": ["cover_art"],
    "availableTranslatedLanguage[]": ids ? undefined : ["en"],
    "contentRating[]": CONTENT_RATINGS,
  });
  return { results: data.data, total: data.total };
}

export async function getRandomManga() {
  const data = await md<{ data: MangadexManga }>(
    "manga/random",
    { "includes[]": ["cover_art"], "contentRating[]": CONTENT_RATINGS },
    false,
  );
  return data.data;
}

/* ── Details ───────────────────────────────────────── */

export async function getMangaDetails(id: string) {
  const [manga, stats] = await Promise.all([
    md<{ data: MangadexManga }>(`manga/${id}`, { "includes[]": ["cover_art", "author", "artist"] }),
    md<{ statistics: Record<string, { rating?: { bayesian: number | null }; follows?: number }> }>(
      "statistics/manga",
      { "manga[]": [id] },
    ).catch(() => null),
  ]);
  if (!CONTENT_RATINGS.includes(manga.data.attributes.contentRating)) throw new MangaNotFound(id);
  const s = stats?.statistics?.[id];
  return {
    manga: manga.data,
    rating: s?.rating?.bayesian ? Math.round(s.rating.bayesian * 10) / 10 : null,
    follows: s?.follows ?? null,
  };
}

/** One chapter per number in the given language, in reading order (MangaDex lists every scanlation) */
export async function getChapterFeed(mangaId: string, language: string): Promise<MangadexChapter[]> {
  const data = await md<{ data: MangadexChapter[] }>(`manga/${mangaId}/feed`, {
    limit: 500,
    "translatedLanguage[]": [language],
    "order[volume]": "asc",
    "order[chapter]": "asc",
    "contentRating[]": CONTENT_RATINGS,
    // Chapters hosted elsewhere (e.g. MANGA Plus) have no readable pages here
    includeExternalUrl: 0,
  });
  const seen = new Set<string>();
  return data.data.filter((c) => {
    const key = c.attributes.chapter ?? c.id;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export async function getChapter(id: string) {
  const data = await md<{ data: MangadexChapter }>(`chapter/${id}`, { "includes[]": ["manga"] });
  return data.data;
}

/** Image servers for a chapter. The URLs expire after ~15 minutes, so this is never cached. */
export async function getChapterPages(id: string, dataSaver: boolean) {
  const data = await md<{ baseUrl: string; chapter: { hash: string; data: string[]; dataSaver: string[] } }>(
    `at-home/server/${id}`,
    {},
    false,
  );
  const files = dataSaver && data.chapter.dataSaver.length ? data.chapter.dataSaver : data.chapter.data;
  const folder = dataSaver && data.chapter.dataSaver.length ? "data-saver" : "data";
  return files.map((file) => `${data.baseUrl}/${folder}/${data.chapter.hash}/${file}`);
}

/* ── Display helpers ───────────────────────────────── */

export const mangaTitle = (m: MangadexManga) =>
  m.attributes.title.en ?? Object.values(m.attributes.title)[0] ?? "Untitled";

/** An English or romanised alternative title, when the main one isn't already English */
export const mangaAltTitle = (m: MangadexManga) => {
  const main = mangaTitle(m);
  const alt = m.attributes.altTitles.map((t) => t.en ?? t["ja-ro"]).find((t) => t && t !== main);
  return alt ?? null;
};

export const mangaCover = (m: MangadexManga, size: 256 | 512 = 512) => {
  const file = m.relationships.find((r) => r.type === "cover_art")?.attributes?.fileName;
  return file ? `https://uploads.mangadex.org/covers/${m.id}/${file}.${size}.jpg` : null;
};

/** Plain-text description: drops MangaDex's markdown links, rules and source notes */
export const mangaDescription = (m: MangadexManga) => {
  const raw = m.attributes.description.en ?? Object.values(m.attributes.description)[0] ?? "";
  return (
    raw
      .split(/\n-{3,}\n/)[0]
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/[*_]{1,2}([^*_]+)[*_]{1,2}/g, "$1")
      .replace(/\r/g, "")
      .trim() || null
  );
};

export const mangaPeople = (m: MangadexManga, type: "author" | "artist") =>
  Array.from(new Set(m.relationships.filter((r) => r.type === type).map((r) => String(r.attributes?.name ?? "")))).filter(
    Boolean,
  );

export const mangaGenres = (m: MangadexManga) =>
  m.attributes.tags.filter((t) => t.attributes.group === "genre" || t.attributes.group === "theme").map((t) => t.attributes.name.en);

const LANGUAGES: Record<string, string> = {
  en: "English", ja: "Japanese", ko: "Korean", zh: "Chinese", "zh-hk": "Chinese (HK)", es: "Spanish",
  "es-la": "Spanish (LatAm)", "pt-br": "Portuguese (BR)", fr: "French", de: "German", it: "Italian", ru: "Russian",
  id: "Indonesian", vi: "Vietnamese", th: "Thai", pl: "Polish", tr: "Turkish", ar: "Arabic",
};
export const languageName = (code: string) => LANGUAGES[code] ?? code.toUpperCase();

export const capitalize = (value: string | null | undefined) =>
  value ? value.charAt(0).toUpperCase() + value.slice(1).replace(/_/g, " ") : null;
