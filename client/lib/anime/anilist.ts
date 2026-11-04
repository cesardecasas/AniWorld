import Axios, { AxiosError } from "axios";
import type { Anime, AnimeEpisode, AnimeRelation, AnimeSummary } from "../../types";

// AniList GraphQL: official, keyless, ~90 req/min per IP. https://docs.anilist.co
const AniListClient = Axios.create({
  baseURL: "https://graphql.anilist.co",
  timeout: 5000,
  headers: { "Content-Type": "application/json", Accept: "application/json" },
});

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export class AniListNotFound extends Error {}

const CARD_FIELDS = `
  id
  idMal
  title { userPreferred english native }
  coverImage { extraLarge large }
  bannerImage
  averageScore
  format
  status
  episodes
  duration
  season
  seasonYear
  startDate { year month day }
  genres
  description(asHtml: false)
`;

const FULL_FIELDS = `
  ${CARD_FIELDS}
  endDate { year month day }
  popularity
  favourites
  rankings { rank type allTime }
  source(version: 3)
  nextAiringEpisode { episode airingAt }
  tags { name rank isMediaSpoiler isGeneralSpoiler }
  studios { edges { isMain node { name } } }
  trailer { id site }
  streamingEpisodes { title url }
  relations {
    edges {
      relationType(version: 2)
      node { id idMal type isAdult title { userPreferred } coverImage { large } }
    }
  }
`;

const DETAIL_QUERY = `
  query ($idMal: Int, $id: Int) {
    Media(idMal: $idMal, id: $id, type: ANIME) { ${FULL_FIELDS} }
  }
`;

// Null variables are ignored by AniList, so one query serves every listing
const PAGE_QUERY = `
  query (
    $page: Int, $perPage: Int, $sort: [MediaSort], $search: String, $genre: String,
    $format: MediaFormat, $season: MediaSeason, $seasonYear: Int, $idMal_in: [Int], $id_in: [Int]
  ) {
    Page(page: $page, perPage: $perPage) {
      pageInfo { hasNextPage }
      media(
        type: ANIME, isAdult: false, sort: $sort, search: $search, genre: $genre, format: $format,
        season: $season, seasonYear: $seasonYear, idMal_in: $idMal_in, id_in: $id_in
      ) { ${CARD_FIELDS} }
    }
  }
`;

const query = async <T>(gql: string, variables: Record<string, unknown>, retries = 1): Promise<T> => {
  for (let attempt = 0; ; attempt++) {
    try {
      const res = await AniListClient.post("", { query: gql, variables });
      return res.data.data as T;
    } catch (error) {
      const res = (error as AxiosError).response;
      if (res?.status === 404) throw new AniListNotFound();
      const retryAfter = Number(res?.headers?.["retry-after"] ?? 1);
      const retryable = res?.status === 429 ? retryAfter <= 3 : (res?.status ?? 0) >= 500;
      if (!retryable || attempt >= retries) throw error;
      await sleep(Math.max(retryAfter, 1) * 1000);
    }
  }
};

/* ── Mapping ───────────────────────────────────────── */

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

type FuzzyDate = { year: number | null; month: number | null; day: number | null } | null;

// Formatted on the server so client hydration never disagrees over locale or timezone
const formatDate = (d: FuzzyDate): string | null => {
  if (!d?.year) return null;
  if (!d.month) return String(d.year);
  return d.day ? `${MONTHS[d.month - 1]} ${d.day}, ${d.year}` : `${MONTHS[d.month - 1]} ${d.year}`;
};

const FORMATS: Record<string, string> = {
  TV: "TV", TV_SHORT: "TV Short", MOVIE: "Movie", SPECIAL: "Special", OVA: "OVA", ONA: "ONA", MUSIC: "Music",
};

const STATUSES: Record<string, string> = {
  FINISHED: "Finished Airing",
  RELEASING: "Currently Airing",
  NOT_YET_RELEASED: "Not Yet Aired",
  CANCELLED: "Cancelled",
  HIATUS: "On Hiatus",
};

const humanize = (value: string | null | undefined) =>
  value ? value.charAt(0) + value.slice(1).toLowerCase().replace(/_/g, " ") : null;

const stripHtml = (text: string | null) =>
  text
    ? text
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<[^>]+>/g, "")
        .replace(/&quot;/g, '"')
        .replace(/&#039;|&apos;/g, "'")
        .replace(/&amp;/g, "&")
        .replace(/\n{3,}/g, "\n\n")
        .trim()
    : null;

const truncate = (text: string | null, max: number) =>
  text && text.length > max ? `${text.slice(0, text.lastIndexOf(" ", max))}…` : text;

const routeId = (idMal: number | null, id: number) => (idMal ? String(idMal) : `al-${id}`);

/* Raw AniList shapes, limited to the fields requested above */
interface CardMedia {
  id: number;
  idMal: number | null;
  title: { userPreferred: string; english: string | null; native: string | null };
  coverImage: { extraLarge: string | null; large: string | null } | null;
  bannerImage: string | null;
  averageScore: number | null;
  format: string | null;
  status: string | null;
  episodes: number | null;
  duration: number | null;
  season: string | null;
  seasonYear: number | null;
  startDate: FuzzyDate;
  genres: string[] | null;
  description: string | null;
}

interface FullMedia extends CardMedia {
  endDate: FuzzyDate;
  popularity: number | null;
  favourites: number | null;
  rankings: { rank: number; type: string; allTime: boolean }[] | null;
  source: string | null;
  nextAiringEpisode: { episode: number; airingAt: number } | null;
  tags: { name: string; rank: number; isMediaSpoiler: boolean; isGeneralSpoiler: boolean }[] | null;
  studios: { edges: { isMain: boolean; node: { name: string } }[] } | null;
  trailer: { id: string; site: string } | null;
  streamingEpisodes: { title: string; url: string }[] | null;
  relations: {
    edges: {
      relationType: string;
      node: {
        id: number;
        idMal: number | null;
        type: string;
        isAdult: boolean;
        title: { userPreferred: string };
        coverImage: { large: string | null } | null;
      };
    }[];
  } | null;
}

const trailerEmbed = (trailer: { id: string; site: string } | null) => {
  if (!trailer?.id) return null;
  if (trailer.site === "youtube") return `https://www.youtube-nocookie.com/embed/${trailer.id}`;
  if (trailer.site === "dailymotion") return `https://www.dailymotion.com/embed/video/${trailer.id}`;
  return null;
};

const toCard = (m: CardMedia): Anime => ({
  id: routeId(m.idMal, m.id),
  anilistId: m.id,
  malId: m.idMal ?? null,
  title: m.title.userPreferred,
  titleEnglish: m.title.english ?? null,
  titleNative: m.title.native ?? null,
  synopsis: truncate(stripHtml(m.description), 280),
  coverImage: m.coverImage?.extraLarge ?? m.coverImage?.large ?? null,
  bannerImage: m.bannerImage ?? null,
  score: m.averageScore ? m.averageScore / 10 : null,
  rank: null,
  popularityRank: null,
  members: null,
  favourites: null,
  format: (m.format && FORMATS[m.format]) ?? null,
  status: (m.status && STATUSES[m.status]) ?? null,
  episodes: m.episodes ?? null,
  duration: m.duration ?? null,
  season: humanize(m.season),
  year: m.seasonYear ?? m.startDate?.year ?? null,
  startDate: formatDate(m.startDate),
  aired: null,
  nextEpisode: null,
  source: null,
  rating: null,
  genres: m.genres ?? [],
  tags: [],
  studios: [],
  producers: [],
  trailerUrl: null,
  relations: [],
});

const toAnime = (m: FullMedia): Anime => {
  const allTime = (type: string) =>
    m.rankings?.find((r) => r.type === type && r.allTime)?.rank ?? null;
  const start = formatDate(m.startDate);
  const end = formatDate(m.endDate);
  const studios = m.studios?.edges ?? [];

  const relations: AnimeRelation[] = (m.relations?.edges ?? [])
    .filter((e) => !e.node.isAdult && e.relationType !== "CHARACTER")
    .map((e): AnimeRelation => ({
      relation: humanize(e.relationType) ?? "Related",
      type: e.node.type === "MANGA" ? "manga" : "anime",
      // Manga pages are keyed by MangaDex ids, so manga relations link to a title search instead
      id: e.node.type === "MANGA" ? e.node.title.userPreferred : routeId(e.node.idMal, e.node.id),
      title: e.node.title.userPreferred,
      coverImage: e.node.coverImage?.large ?? null,
    }));

  return {
    ...toCard(m),
    synopsis: stripHtml(m.description),
    rank: allTime("RATED"),
    popularityRank: allTime("POPULAR"),
    members: m.popularity ?? null,
    favourites: m.favourites ?? null,
    aired: start ? (end && end !== start ? `${start} – ${end}` : start) : null,
    nextEpisode: m.nextAiringEpisode ?? null,
    source: humanize(m.source),
    tags: (m.tags ?? [])
      .filter((t) => !t.isMediaSpoiler && !t.isGeneralSpoiler && t.rank >= 60)
      .slice(0, 8)
      .map((t) => t.name),
    studios: studios.filter((e) => e.isMain).map((e) => e.node.name),
    producers: studios.filter((e) => !e.isMain).map((e) => e.node.name),
    trailerUrl: trailerEmbed(m.trailer),
    relations,
  };
};

/* ── Public API ────────────────────────────────────── */

/** Accepts a route id ("52991" = MAL id, "al-154587" = AniList id) */
export const parseAnimeId = (routeParam: string): { idMal?: number; id?: number } | null => {
  if (/^\d+$/.test(routeParam)) return { idMal: Number(routeParam) };
  const match = routeParam.match(/^al-(\d+)$/);
  return match ? { id: Number(match[1]) } : null;
};

export const getAnimeDetails = async (routeParam: string) => {
  const ids = parseAnimeId(routeParam);
  if (!ids) throw new AniListNotFound();
  const data = await query<{ Media: FullMedia }>(DETAIL_QUERY, ids);
  const media = data.Media;
  return {
    anime: toAnime(media),
    // Fallback episode list for when Jikan is unavailable
    streamingEpisodes: (media.streamingEpisodes ?? []).map(
      (e): AnimeEpisode => ({ number: null, title: e.title, url: e.url })
    ),
  };
};

interface ListOptions {
  page?: number;
  perPage?: number;
  sort?: string[];
  search?: string;
  genre?: string;
  format?: string;
  season?: string;
  seasonYear?: number;
}

export const listAnime = async (options: ListOptions) => {
  const data = await query<{ Page: { pageInfo: { hasNextPage: boolean }; media: CardMedia[] } }>(PAGE_QUERY, {
    page: 1,
    perPage: 24,
    ...options,
  });
  return { results: data.Page.media.map(toCard), hasNextPage: data.Page.pageInfo.hasNextPage };
};

/** Titles and covers for list entries, in one request per 50 ids instead of one per entry */
export const getAnimeSummaries = async (routeIds: string[]): Promise<Record<string, AnimeSummary>> => {
  const parsed = routeIds.map(parseAnimeId);
  const malIds = parsed.flatMap((p) => (p?.idMal ? [p.idMal] : []));
  const aniIds = parsed.flatMap((p) => (p?.id ? [p.id] : []));

  const chunks: Record<string, unknown>[] = [];
  for (let i = 0; i < malIds.length; i += 50) chunks.push({ idMal_in: malIds.slice(i, i + 50) });
  for (let i = 0; i < aniIds.length; i += 50) chunks.push({ id_in: aniIds.slice(i, i + 50) });

  const pages = await Promise.all(
    chunks.map((vars) => query<{ Page: { media: CardMedia[] } }>(PAGE_QUERY, { perPage: 50, ...vars }))
  );

  const byId: Record<string, AnimeSummary> = {};
  pages.forEach((p) =>
    p.Page.media.forEach((m) => {
      const card = toCard(m);
      // Index under both ids so entries saved with either form resolve
      const summary = { id: card.id, title: card.title, coverImage: card.coverImage };
      byId[card.id] = summary;
      byId[`al-${m.id}`] = summary;
    })
  );
  return byId;
};
