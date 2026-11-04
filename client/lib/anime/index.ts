import { getAnimeDetails, listAnime, AniListNotFound } from "./anilist";
import { getJikanExtras } from "../jikan";
import type { Anime, AnimeEpisode, AnimeThemes } from "../../types";

export { listAnime, getAnimeSummaries, AniListNotFound } from "./anilist";

export interface AnimePageData {
  anime: Anime;
  episodes: AnimeEpisode[];
  themes: AnimeThemes;
}

/** AniList is required; Jikan extras run in parallel and are dropped if Jikan is down */
export const getAnimePage = async (routeParam: string): Promise<AnimePageData> => {
  const malId = /^\d+$/.test(routeParam) ? Number(routeParam) : null;
  const [details, extras] = await Promise.all([
    getAnimeDetails(routeParam),
    malId ? getJikanExtras(malId) : Promise.resolve(null),
  ]);

  return {
    anime: { ...details.anime, rating: extras?.rating ?? null },
    episodes: extras?.episodes.length ? extras.episodes : details.streamingEpisodes,
    themes: extras?.themes ?? { openings: [], endings: [] },
  };
};

const SEASONS = ["WINTER", "SPRING", "SUMMER", "FALL"] as const;

export const getHomeAnime = async (season: string, year: number) => {
  const [top, seasonal] = await Promise.allSettled([
    listAnime({ sort: ["SCORE_DESC"], perPage: 25 }),
    listAnime({
      sort: ["POPULARITY_DESC"],
      perPage: 25,
      season: SEASONS.find((s) => s === season.toUpperCase()),
      seasonYear: year,
    }),
  ]);
  return { top, seasonal };
};

export const isNotFound = (error: unknown) => error instanceof AniListNotFound;
