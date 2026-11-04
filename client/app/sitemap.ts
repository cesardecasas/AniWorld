import type { MetadataRoute } from "next";
import { listAnime } from "../lib/anime";
import { listManga } from "../lib/mangadex";

const siteUrl = process.env.URL ?? "http://localhost:3000";

// The browse pages plus the most popular titles; regenerated daily
export const revalidate = 86400;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [anime, manga] = await Promise.all([
    listAnime({ sort: ["POPULARITY_DESC"], perPage: 50 }).catch(() => null),
    listManga({ order: "followedCount", limit: 50 }).catch(() => null),
  ]);
  return [
    { url: siteUrl, changeFrequency: "daily", priority: 1 },
    { url: `${siteUrl}/manga`, changeFrequency: "daily" },
    { url: `${siteUrl}/seasons`, changeFrequency: "weekly" },
    { url: `${siteUrl}/search`, changeFrequency: "weekly" },
    ...(anime?.results ?? []).map((a) => ({ url: `${siteUrl}/anime/${a.id}`, changeFrequency: "weekly" as const })),
    ...(manga?.results ?? []).map((m) => ({ url: `${siteUrl}/manga/${m.id}`, changeFrequency: "weekly" as const })),
  ];
}
