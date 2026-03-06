import axios from "axios";

const client = axios.create({ baseURL: "https://api.mangadex.org/" });

export const login = async () => {
  try {
    const res = await client.post("auth/login");
    return res;
  } catch (error) {
    console.log(error);
  }
};

export const getCover = async (mangaId: string) => {
  try {
    const res = await client.get(`cover/${mangaId}`);
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

export const getManga = async (query: string, page?: number, lang?: string) => {
  try {
    if (lang) {
      const res = await client.get(
        `/manga?title=${query}&limit=12&offset=${page}&includes[]=cover_art`
      );
      return res.data.data;
    } else {
      const res = await client.get(
        `/manga?title=${query}&limit=12&offset=${page}&includes[]=cover_art&originalLanguage[]=en`
      );
      return res.data.data;
    }
  } catch (error) {
    console.log(error);
  }
};
