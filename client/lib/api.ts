import axios from "axios";

/**
 * Browser client for this app's /api/v1 routes. Those forward to the AniWorld API and attach the
 * login session from an httpOnly cookie, so pages never handle tokens or send user ids.
 */
export const api = axios.create({
  baseURL: "/api/v1",
  timeout: 25000, // free hosting sleeps when idle, so the first request can be slow
});

/** The API's error message for a failed request, or a generic fallback */
export const apiError = (err: unknown, fallback = "Something went wrong. Please try again.") =>
  (axios.isAxiosError(err) && err.response?.data?.message) || fallback;
