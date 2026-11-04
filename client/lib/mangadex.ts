import axios from "axios";

const client = axios.create({ baseURL: "https://api.mangadex.org/", timeout: 5000 });

export const getCover = async (coverId: string) => {
  try {
    const res = await client.get(`cover/${coverId}`);
    return res.data;
  } catch (error) {
    console.error("MangaDex cover failed:", (error as Error).message);
    return null;
  }
};

export const getManga = async (query: string, offset = 0) => {
  try {
    const res = await client.get("manga", {
      params: {
        title: query,
        limit: 12,
        offset,
        "includes[]": "cover_art",
        "availableTranslatedLanguage[]": "en",
      },
    });
    return res.data.data;
  } catch (error) {
    console.error("MangaDex search failed:", (error as Error).message);
    return [];
  }
};
