/**
 * Server-side access to the AniWorld API. Browsers never call the API directly: they call this
 * app's /api/v1 routes, which keep the login token in an httpOnly cookie and forward requests here.
 *
 * Import only from route handlers and getServerSideProps. (No "server-only" guard: the pages router
 * rejects it. API_URL and API_PROXY_SECRET are not NEXT_PUBLIC_, so they never reach a browser bundle.)
 */

export const SESSION_COOKIE = "aw_session";
export const SESSION_MAX_AGE = 7 * 24 * 60 * 60; // matches the API's token lifetime

const API_URL = (process.env.API_URL ?? "http://localhost:3001").replace(/\/$/, "");

export const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: SESSION_MAX_AGE,
};

interface BackendOptions {
  method?: string;
  body?: string;
  token?: string;
  /** The visitor's IP, forwarded so the API's rate limits apply per visitor */
  clientIp?: string | null;
}

export async function backendFetch(path: string, { method = "GET", body, token, clientIp }: BackendOptions = {}) {
  const headers: Record<string, string> = { accept: "application/json" };
  if (body !== undefined) headers["content-type"] = "application/json";
  if (token) headers.authorization = `Bearer ${token}`;
  if (clientIp && process.env.API_PROXY_SECRET) {
    headers["x-client-ip"] = clientIp;
    headers["x-proxy-secret"] = process.env.API_PROXY_SECRET;
  }

  return fetch(`${API_URL}/api/v1${path}`, {
    method,
    headers,
    body,
    cache: "no-store",
    // Free hosting sleeps when idle, so a cold start can take a while
    signal: AbortSignal.timeout(20_000),
  });
}

/** Visitor IP as reported by Netlify's edge, falling back to the standard proxy header */
export const clientIpFrom = (headers: Headers) =>
  headers.get("x-nf-client-connection-ip") ?? headers.get("x-forwarded-for")?.split(",")[0].trim() ?? null;

/**
 * Cookie auth needs CSRF protection: only accept state-changing requests that the browser
 * says came from this site.
 */
export function isSameOrigin(headers: Headers) {
  const fetchSite = headers.get("sec-fetch-site");
  if (fetchSite) return fetchSite === "same-origin";
  const origin = headers.get("origin");
  if (!origin) return false;
  try {
    return new URL(origin).host === headers.get("host");
  } catch {
    return false;
  }
}

export const jsonError = (status: number, message: string) =>
  Response.json({ message }, { status, headers: { "cache-control": "no-store" } });
