import { NextRequest, NextResponse } from "next/server";
import {
  SESSION_COOKIE,
  backendFetch,
  clientIpFrom,
  isSameOrigin,
  jsonError,
  sessionCookieOptions,
} from "../../../../../lib/server/backend";

// Exchanges credentials for a session cookie. The token itself never reaches browser JavaScript.
export async function POST(req: NextRequest) {
  if (!isSameOrigin(req.headers)) return jsonError(403, "Cross-site request blocked");

  let upstream: Response;
  try {
    upstream = await backendFetch("/auth/login", {
      method: "POST",
      body: await req.text(),
      clientIp: clientIpFrom(req.headers),
    });
  } catch {
    return jsonError(503, "The AniWorld service is waking up or unavailable. Please try again in a moment.");
  }

  const data = await upstream.json().catch(() => ({}));
  if (!upstream.ok || !data.token) {
    return NextResponse.json(data, { status: upstream.ok ? 502 : upstream.status });
  }

  const res = NextResponse.json({ user: data.user }, { headers: { "cache-control": "no-store" } });
  res.cookies.set(SESSION_COOKIE, data.token, sessionCookieOptions);
  return res;
}
