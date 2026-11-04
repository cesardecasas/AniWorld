import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

// MangaDex rejects cross-origin browser requests, so the browser-side features go through here.
// It deliberately supports only these two lookups, so it can't be used as an open proxy.
const client = axios.create({ baseURL: "https://api.mangadex.org/", timeout: 5000 });

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    // GET /api/manga?random=1
    if (req.query.random) {
      const { data } = await client.get("manga/random", {
        params: { "includes[]": "cover_art", "contentRating[]": ["safe", "suggestive"] },
      });
      res.setHeader("Cache-Control", "no-store");
      return res.status(200).json({ data: data.data });
    }

    // GET /api/manga?ids=<uuid>,<uuid>
    const ids = String(req.query.ids ?? "").split(",").filter(Boolean);
    if (!ids.length || ids.length > 100 || !ids.every((id) => UUID.test(id))) {
      return res.status(400).json({ message: "Expected ?random=1 or ?ids= with 1–100 MangaDex ids" });
    }
    const { data } = await client.get("manga", {
      params: { ids, "includes[]": "cover_art", limit: ids.length },
    });
    res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");
    return res.status(200).json({ data: data.data });
  } catch (error) {
    console.error("MangaDex lookup failed:", (error as Error).message);
    return res.status(502).json({ message: "Manga service unavailable" });
  }
}
