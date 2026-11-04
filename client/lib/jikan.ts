import Axios, { AxiosError } from "axios";
import type { AnimeEpisode, AnimeThemes } from "../types";

// Jikan scrapes MyAnimeList and its public instance is often down, so it only supplies
// optional extras (theme songs, age rating, episode titles). Pages must render without it.
const JikanClient = Axios.create({ baseURL: "https://api.jikan.moe/v4/" });

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Jikan allows ~3 req/s and 60 req/min. Rate limits (429) and server errors fail fast,
// so they are retried with a short backoff; timeouts are not retried to stay within budget.
export const jikanGet = async <T = any>(
  path: string,
  { retries = 2, timeout = 4000 }: { retries?: number; timeout?: number } = {}
): Promise<T> => {
  for (let attempt = 0; ; attempt++) {
    try {
      const res = await JikanClient.get<T>(path, { timeout });
      return res.data;
    } catch (error) {
      const status = (error as AxiosError).response?.status;
      const retryable = status === 429 || (status !== undefined && status >= 500);
      if (!retryable || attempt >= retries) throw error;
      await sleep(700 * (attempt + 1));
    }
  }
};

export interface JikanExtras {
  themes: AnimeThemes;
  rating: string | null;
  episodes: AnimeEpisode[];
}

/** Best effort: resolves with empty values instead of throwing */
export const getJikanExtras = async (malId: number): Promise<JikanExtras> => {
  const options = { retries: 0, timeout: 2500 };
  const [full, episodes] = await Promise.allSettled([
    jikanGet(`anime/${malId}/full`, options),
    jikanGet(`anime/${malId}/episodes`, options),
  ]);

  if (full.status === "rejected") {
    console.warn(`Jikan extras unavailable for ${malId}:`, (full.reason as Error)?.message);
  }

  const data = full.status === "fulfilled" ? full.value.data : null;
  return {
    themes: { openings: data?.theme?.openings ?? [], endings: data?.theme?.endings ?? [] },
    rating: data?.rating ?? null,
    episodes:
      episodes.status === "fulfilled"
        ? episodes.value.data.map((e: any) => ({ number: e.mal_id, title: e.title, url: e.url }))
        : [],
  };
};
