import { capitalize, languageName, mangaAltTitle, mangaCover, mangaDescription, mangaPeople, mangaTitle } from "../lib/mangadex";
import type { MangadexManga } from "../types";

const manga = {
  id: "abc",
  type: "manga",
  attributes: {
    title: { "ja-ro": "Sousou no Frieren" },
    altTitles: [{ ja: "葬送のフリーレン" }, { en: "Frieren: Beyond Journey's End" }],
    description: { en: "An elf mage.\n\n---\n**Links:** [Official](https://example.com)" },
  },
  relationships: [
    { id: "c1", type: "cover_art", attributes: { fileName: "cover.jpg" } },
    { id: "a1", type: "author", attributes: { name: "Yamada Kanehito" } },
    { id: "a2", type: "artist", attributes: { name: "Abe Tsukasa" } },
  ],
} as unknown as MangadexManga;

describe("mangadex display helpers", () => {
  it("falls back to the first available title", () => {
    expect(mangaTitle(manga)).toBe("Sousou no Frieren");
    expect(mangaAltTitle(manga)).toBe("Frieren: Beyond Journey's End");
  });

  it("builds sized cover URLs", () => {
    expect(mangaCover(manga, 256)).toBe("https://uploads.mangadex.org/covers/abc/cover.jpg.256.jpg");
  });

  it("strips the links block from descriptions", () => {
    expect(mangaDescription(manga)).toBe("An elf mage.");
  });

  it("lists people by role", () => {
    expect(mangaPeople(manga, "author")).toEqual(["Yamada Kanehito"]);
    expect(mangaPeople(manga, "artist")).toEqual(["Abe Tsukasa"]);
  });

  it("names languages and capitalizes enums", () => {
    expect(languageName("en")).toBe("English");
    expect(capitalize("ongoing")).toBe("Ongoing");
    expect(capitalize(null)).toBeNull();
  });
});
