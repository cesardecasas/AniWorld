// Pure user-agent rules shared by the Netlify edge function (netlify/edge-functions/bot-guard.ts)
// and its tests. No imports, so it runs unchanged on Deno at the edge and on Node in Jest.

/** Crawlers that collect training data or scrape aggressively; several ignore robots.txt */
const BLOCKED_BOTS = [
  "gptbot", "chatgpt-user", "oai-searchbot", "ccbot", "claudebot", "claude-web", "anthropic-ai",
  "bytespider", "perplexitybot", "amazonbot", "meta-externalagent", "facebookbot", "diffbot",
  "omgili", "imagesiftbot", "cohere-ai", "youbot", "timpibot",
  // SEO crawlers: heavy traffic, no benefit for this site
  "ahrefsbot", "semrushbot", "mj12bot", "dotbot", "petalbot", "blexbot", "dataforseobot", "serpstatbot",
];

/** Scripts and headless browsers; real visitors never send these */
const AUTOMATION = [
  "python-requests", "python-urllib", "python-httpx", "aiohttp", "scrapy", "go-http-client",
  "java/", "okhttp", "libwww-perl", "wget", "curl/", "httpclient", "node-fetch", "axios/",
  "undici", "headlesschrome", "phantomjs", "puppeteer", "playwright", "selenium",
];

/** Search engines and link previews we want; checked first so they are never caught by a broader rule */
const ALLOWED = ["googlebot", "bingbot", "duckduckbot", "applebot", "yandexbot", "discordbot", "twitterbot", "slackbot", "linkedinbot"];

export type BotVerdict = { block: false } | { block: true; reason: string };

export function classifyUserAgent(userAgent: string | null | undefined): BotVerdict {
  const ua = (userAgent ?? "").trim().toLowerCase();
  if (!ua) return { block: true, reason: "missing user agent" };
  if (ALLOWED.some((name) => ua.includes(name))) return { block: false };

  const bot = BLOCKED_BOTS.find((name) => ua.includes(name));
  if (bot) return { block: true, reason: `crawler: ${bot}` };

  const tool = AUTOMATION.find((name) => ua.includes(name));
  if (tool) return { block: true, reason: `automation: ${tool.replace(/\/$/, "")}` };

  return { block: false };
}

/** Paths every client may fetch, so polite crawlers can still read the rules */
export const ALWAYS_ALLOWED_PATHS = ["/robots.txt", "/favicon.ico"];
