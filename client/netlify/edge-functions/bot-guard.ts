// Runs on Netlify's edge before the Next.js app, so blocked requests never reach a server
// function or the AniWorld API. The rules live in lib/botGuard.ts (unit tested with Jest).
import { ALWAYS_ALLOWED_PATHS, classifyUserAgent } from "../../lib/botGuard.ts";

const botGuard = async (request: Request) => {
  const { pathname } = new URL(request.url);
  if (ALWAYS_ALLOWED_PATHS.includes(pathname)) return;

  const verdict = classifyUserAgent(request.headers.get("user-agent"));
  if (!verdict.block) return; // continue to the site

  console.log(`bot-guard blocked ${pathname}: ${verdict.reason}`);
  return new Response("Automated access is not allowed.", {
    status: 403,
    headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" },
  });
};

export default botGuard;

export const config = {
  path: "/*",
  // Static build assets are fingerprinted and cached; checking them only costs time
  excludedPath: ["/_next/static/*", "/_next/image*", "/robots.txt"],
};
