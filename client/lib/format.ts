import type { Anime } from "../types";

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
export const roman = (n: number) => ROMAN[n - 1] ?? String(n);

/** "TV · 28 eps · 2023" */
export const animeMeta = (a: Pick<Anime, "format" | "episodes" | "year">) =>
  [a.format, a.episodes ? `${a.episodes} ep${a.episodes === 1 ? "" : "s"}` : null, a.year].filter(Boolean).join(" · ");

/** The current anime season as AniList names it (Winter = Dec–Feb) */
export function currentSeason(date = new Date()) {
  const m = date.getMonth();
  const season = m <= 1 || m === 11 ? "WINTER" : m <= 4 ? "SPRING" : m <= 7 ? "SUMMER" : "FALL";
  // December already belongs to next year's winter season
  return { season, year: m === 11 ? date.getFullYear() + 1 : date.getFullYear() } as const;
}

export const SEASONS = ["WINTER", "SPRING", "SUMMER", "FALL"] as const;
export type Season = (typeof SEASONS)[number];

export const seasonLabel = (season: string, year?: number) =>
  `${season.charAt(0)}${season.slice(1).toLowerCase()}${year ? ` ${year}` : ""}`;

export function timeAgo(iso: string, now = Date.now()) {
  const s = Math.max(0, Math.round((now - new Date(iso).getTime()) / 1000));
  const units: [number, string][] = [
    [31536000, "year"],
    [2592000, "month"],
    [604800, "week"],
    [86400, "day"],
    [3600, "hour"],
    [60, "minute"],
  ];
  for (const [size, name] of units) {
    const n = Math.floor(s / size);
    if (n >= 1) return `${n} ${name}${n === 1 ? "" : "s"} ago`;
  }
  return "just now";
}
