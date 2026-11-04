// Values accepted by AniList's genre filter and MediaFormat / MediaSort enums

export const GENRES = [
  "Action", "Adventure", "Comedy", "Drama", "Ecchi", "Fantasy", "Horror", "Mahou Shoujo", "Mecha", "Music",
  "Mystery", "Psychological", "Romance", "Sci-Fi", "Slice of Life", "Sports", "Supernatural", "Thriller",
];

export const FORMATS = [
  { value: "TV", label: "TV" },
  { value: "MOVIE", label: "Movie" },
  { value: "OVA", label: "OVA" },
  { value: "ONA", label: "ONA" },
  { value: "SPECIAL", label: "Special" },
  { value: "TV_SHORT", label: "TV Short" },
];

export const SORTS = [
  { value: "popular", label: "Most popular", anilist: ["POPULARITY_DESC"] },
  { value: "score", label: "Highest rated", anilist: ["SCORE_DESC"] },
  { value: "trending", label: "Trending now", anilist: ["TRENDING_DESC"] },
  { value: "newest", label: "Newest", anilist: ["START_DATE_DESC"] },
];

export const isGenre = (v: string | undefined) => (v && GENRES.includes(v) ? v : undefined);
export const isFormat = (v: string | undefined) => (v && FORMATS.some((f) => f.value === v) ? v : undefined);
