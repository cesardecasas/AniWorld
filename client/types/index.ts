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

export interface JikanAnime {
  mal_id: number;
  title: string;
  images: {
    jpg: JikanAnimeImage;
    webp: JikanAnimeImage;
  };
  aired: {
    prop: {
      from: JikanAiredProp;
      to: JikanAiredProp;
    };
  };
  synopsis: string;
  background: string | null;
  trailer: {
    url: string | null;
    embed_url: string | null;
  };
  related: {
    Sequel?: RelatedAnime[];
    Prequel?: RelatedAnime[];
  };
  score: number;
  episodes: number;
  rated: string;
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
  description: Record<string, string>;
  status: string;
  year: number | null;
  publicationDemographic: string | string[] | null;
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
