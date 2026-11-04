import { cookies } from "next/headers";
import { cache } from "react";
import { SESSION_COOKIE, backendFetch } from "./backend";
import type { User } from "../../types";

/** The login token from the request's cookie (server components and route handlers only) */
export const getSessionToken = async () => (await cookies()).get(SESSION_COOKIE)?.value;

/** The signed-in user for this request, or null. Deduplicated per request. */
export const getServerSession = cache(async (): Promise<User | null> => {
  const token = await getSessionToken();
  if (!token) return null;
  try {
    const res = await backendFetch("/auth/session", { token });
    return res.ok ? (await res.json()).user : null;
  } catch {
    return null;
  }
});
