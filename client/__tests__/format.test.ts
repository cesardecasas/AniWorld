import { animeMeta, currentSeason, roman, seasonLabel, timeAgo } from "../lib/format";
import { safeNext } from "../lib/safeNext";

describe("currentSeason", () => {
  it.each([
    [0, "WINTER", 2026],
    [3, "SPRING", 2026],
    [6, "SUMMER", 2026],
    [9, "FALL", 2026],
    [11, "WINTER", 2027], // December belongs to next year's winter
  ])("month %i is %s %i", (month, season, year) => {
    expect(currentSeason(new Date(2026, month, 15))).toEqual({ season, year });
  });
});

describe("display helpers", () => {
  it("formats anime meta and skips missing parts", () => {
    expect(animeMeta({ format: "TV", episodes: 28, year: 2023 })).toBe("TV · 28 eps · 2023");
    expect(animeMeta({ format: "MOVIE", episodes: 1, year: null })).toBe("MOVIE · 1 ep");
    expect(animeMeta({ format: null, episodes: null, year: null })).toBe("");
  });

  it("labels seasons and roman numerals", () => {
    expect(seasonLabel("FALL", 2026)).toBe("Fall 2026");
    expect(roman(4)).toBe("IV");
    expect(roman(11)).toBe("11");
  });

  it("describes elapsed time", () => {
    const now = Date.parse("2026-11-03T12:00:00Z");
    expect(timeAgo("2026-11-03T11:59:30Z", now)).toBe("just now");
    expect(timeAgo("2026-11-03T09:00:00Z", now)).toBe("3 hours ago");
    expect(timeAgo("2026-11-02T12:00:00Z", now)).toBe("1 day ago");
  });
});

describe("safeNext", () => {
  it("keeps same-site paths", () => {
    expect(safeNext("/anime/52991")).toBe("/anime/52991");
    expect(safeNext(["/list", "/x"])).toBe("/list");
  });

  it.each([undefined, "", "https://evil.example", "//evil.example", "/\\evil.example", "/login", "/signup?next=/"])(
    "falls back for %p",
    (value) => expect(safeNext(value)).toBe("/"),
  );
});
