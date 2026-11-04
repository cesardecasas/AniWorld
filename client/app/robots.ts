import type { MetadataRoute } from "next";

const siteUrl = process.env.URL ?? "http://localhost:3000";

// Only well-behaved crawlers honor this file; abusive bots are blocked at the edge (netlify/edge-functions)
const AI_CRAWLERS = [
  "GPTBot", "ChatGPT-User", "CCBot", "ClaudeBot", "anthropic-ai", "Google-Extended", "Bytespider",
  "PerplexityBot", "Amazonbot", "meta-externalagent", "Applebot-Extended", "Diffbot", "omgili",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        disallow: ["/api/", "/login", "/signup", "/settings", "/list", "/chapter/", "/manga/random", "/search?"],
      },
      { userAgent: AI_CRAWLERS, disallow: "/" },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
