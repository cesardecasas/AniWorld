export interface User {
  userName: string;
  id: string;
}

export interface JikanAnimeImage {
  image_url: string;
  small_image_url: string;
  large_image_url: string;
}

export interface JikanAiredProp {
  day: number | null;
  month: number | null;
  year: number | null;
}

/** A named MAL entity — genre, studio, producer, theme, demographic, etc. */
export interface JikanEntity {
  mal_id: number;
  type: string;
  name: string;
  url: string;
}

export interface JikanAnime {
  mal_id: number;
  url: string;

  // Titles
  title: string;
  title_english: string | null;
  title_japanese: string | null;
  title_synonyms: string[];
  titles: Array<{ type: string; title: string }>;

  // Media
  images: {
    jpg: JikanAnimeImage;
    webp: JikanAnimeImage;
  };
  trailer: {
    youtube_id: string | null;
    url: string | null;
    embed_url: string | null;
  };

  // Classification
  type: string;          // "TV" | "OVA" | "Movie" | "Special" | etc.
  source: string;        // "Manga" | "Original" | "Light novel" | etc.
  episodes: number;
  status: string;        // "Finished Airing" | "Currently Airing" | etc.
  airing: boolean;
  duration: string;      // e.g. "24 min per ep"
  rating: string;        // e.g. "PG-13 - Teens 13 or older"

  // Airing info
  aired: {
    from: string | null;
    to: string | null;
    prop: {
      from: JikanAiredProp;
      to: JikanAiredProp;
    };
    string: string;
  };
  season: string | null;
  year: number | null;
  broadcast: {
    day: string | null;
    time: string | null;
    timezone: string | null;
    string: string | null;
  };

  // Scores & stats
  score: number;
  scored_by: number;
  rank: number;
  popularity: number;
  members: number;
  favorites: number;

  // Text
  synopsis: string;
  background: string | null;

  // Production
  producers: JikanEntity[];
  licensors: JikanEntity[];
  studios: JikanEntity[];

  // Genres / tags
  genres: JikanEntity[];
  explicit_genres: JikanEntity[];
  themes: JikanEntity[];
  demographics: JikanEntity[];

  // Relations (legacy structure used by detail pages)
  related: {
    Sequel?: RelatedAnime[];
    Prequel?: RelatedAnime[];
  };
}

export interface RelatedAnime {
  mal_id: number;
  type: string;
  name: string;
  url: string;
}

export interface JikanEpisode {
  mal_id: number;
  title: string;
  url: string;
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

export interface SongData {
  title: string;
  preview_url: string | null;
  open_spotify_url: string;
  album: string;
  artist: string;
}

export interface AniApiAnime {
  id: number;
  mal_id: number;
}

export interface UserInfo {
  id: string;
  email: string;
  userName: string;
  profilePic?: string;
}

export interface AniApiSongResponse {
  message?: string;
  data?: {
    documents: SongData[];
  };
}
