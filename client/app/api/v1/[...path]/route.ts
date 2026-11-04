import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, backendFetch, clientIpFrom, isSameOrigin, jsonError } from "../../../../lib/server/backend";

// Forwards /api/v1/* to the AniWorld API, attaching the session cookie as a bearer token.
// Login and logout have their own routes because they set and clear the cookie.

const PASS_HEADERS = ["content-type", "retry-after", "ratelimit", "ratelimit-policy"];

async function forward(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  if (path.some((segment) => segment === "." || segment === "..")) return jsonError(400, "Invalid path");
  if (req.method !== "GET" && !isSameOrigin(req.headers)) return jsonError(403, "Cross-site request blocked");

  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const target = "/" + path.map(encodeURIComponent).join("/") + req.nextUrl.search;

  let upstream: Response;
  try {
    upstream = await backendFetch(target, {
      method: req.method,
      body: req.method === "GET" || req.method === "DELETE" ? undefined : await req.text(),
      token,
      clientIp: clientIpFrom(req.headers),
    });
  } catch {
    return jsonError(503, "The AniWorld service is waking up or unavailable. Please try again in a moment.");
  }

  const res = new NextResponse(upstream.body, { status: upstream.status });
  PASS_HEADERS.forEach((name) => {
    const value = upstream.headers.get(name);
    if (value) res.headers.set(name, value);
  });
  res.headers.set("cache-control", "no-store");
  // An expired or revoked token: drop it so the UI shows the visitor as signed out
  if (upstream.status === 401 && token) res.cookies.delete(SESSION_COOKIE);
  return res;
}

export { forward as GET, forward as POST, forward as PUT, forward as PATCH, forward as DELETE };
