import axios from "axios";

/**
 * Client for the AniWorld backend. In the browser it attaches the stored login token,
 * so pages never pass user ids or auth headers themselves; the API takes the user from the token.
 */
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 15000, // free hosting sleeps when idle, so the first request can be slow
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/** The API's error message for a failed request, or a generic fallback */
export const apiError = (err: unknown, fallback = "Something went wrong. Please try again.") =>
  (axios.isAxiosError(err) && err.response?.data?.message) || fallback;
