export interface User {
  userName: string;
  id: string;
}

/**
 * Provider-neutral anime record. Pages only use this shape; lib/anime maps
 * AniList (and optional Jikan extras) into it, so a provider swap stays in one place.
 */
export interface Anime {
  /** Route and list key: the MAL id when known (keeps existing list entries valid), else "al-<anilistId>" */
  id: string;
  anilistId: number;
  malId: number | null;

  title: string;
  titleEnglish: string | null;
  titleNative: string | null;
  synopsis: string | null;

  coverImage: string | null;
  bannerImage: string | null;

  /** 0–10 scale */
  score: number | null;
  rank: number | null;
  popularityRank: number | null;
  members: number | null;
  favourites: number | null;

  format: string | null;
  status: string | null;
  episodes: number | null;
  /** Minutes per episode */
  duration: number | null;
  season: string | null;
  year: number | null;
  startDate: string | null;
  aired: string | null;
  nextEpisode: { episode: number; airingAt: number } | null;
  source: string | null;
  /** Age rating — only Jikan provides it, so it is often null */
  rating: string | null;

  genres: string[];
  tags: string[];
  studios: string[];
  producers: string[];

  trailerUrl: string | null;
  relations: AnimeRelation[];
}

export interface AnimeRelation {
  relation: string;
  id: string;
  type: "anime" | "manga";
  title: string;
  coverImage: string | null;
}

export interface AnimeEpisode {
  number: number | null;
  title: string;
  url: string | null;
}

export interface AnimeThemes {
  openings: string[];
  endings: string[];
}

/** Lightweight shape for list pages that only need a title and cover */
export interface AnimeSummary {
  id: string;
  title: string;
  coverImage: string | null;
}

export interface Quote {
  content: string;
  anime: {
    id: number;
    name: string;
    altName?: string;
  };
  character: {
    id: number;
    name: string;
  };
}

export interface MangadexTag {
  id: string;
  type: string;
  attributes: {
    name: Record<string, string>;
    description: Record<string, string>;
    group: string; // "genre" | "theme" | "format" | "content"
    version: number;
  };
}

export interface MangadexRelationship {
  id: string;
  type: string;
  attributes?: {
    fileName?: string;
    [key: string]: unknown;
  };
}

export interface MangadexMangaAttributes {
  title: Record<string, string>;
  altTitles: Record<string, string>[];
  description: Record<string, string>;
  isLocked: boolean;
  links: Record<string, string> | null;
  officialLinks: Record<string, string> | null;
  originalLanguage: string;
  lastVolume: string | null;
  lastChapter: string | null;
  publicationDemographic: string | string[] | null;
  status: string;
  year: number | null;
  contentRating: string;
  tags: MangadexTag[];
  state: string;
  chapterNumbersResetOnNewVolume: boolean;
  createdAt: string;
  updatedAt: string;
  version: number;
  availableTranslatedLanguages: string[];
  latestUploadedChapter: string | null;
}

export interface MangadexManga {
  id: string;
  attributes: MangadexMangaAttributes;
  relationships: MangadexRelationship[];
}

export interface MangadexChapterAttributes {
  chapter: string;
  title: string | null;
  translatedLanguage: string;
  pages: number;
}

export interface MangadexChapter {
  id: string;
  attributes: MangadexChapterAttributes;
  relationships: MangadexRelationship[];
}

export interface UserList {
  anime_id: string[];
  manga_id: string[];
}

export type EntryStatus = 'in_progress' | 'completed' | 'dropped' | 'on_hold' | 'planned'
export type ContentType = 'anime' | 'manga'

export interface ListEntry {
  id: number
  user_id: number
  content_id: string
  content_type: ContentType
  status: EntryStatus
  progress: number
  rating: number | null
  notes: string | null
  createdAt: string
  updatedAt: string
}

export interface AppComment {
  id: number
  user_id: number
  owner_id: string
  type: 'anime' | 'manga' | 'comment'
  content: string
  createdAt: string
  updatedAt: string
  User?: { id: number; userName: string }
}

export interface UserStats {
  anime: { total: number; in_progress: number; completed: number; dropped: number; on_hold: number; planned: number }
  manga: { total: number; in_progress: number; completed: number; dropped: number; on_hold: number; planned: number }
  totalEntries: number
  avgRating: number | null
}

export interface ReadingProgress {
  id: number
  user_id: number
  manga_id: string
  chapter_id: string
  chapter_number: string
}

export interface UserInfo {
  id: string;
  email: string;
  userName: string;
  profilePic?: string;
}
