module.exports = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "s4.anilist.co" },
      { protocol: "https", hostname: "uploads.mangadex.org" },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com",
              "style-src 'self' 'unsafe-inline'",
              // Chapter pages are served from rotating MangaDex@Home nodes, hence the wildcard
              "img-src 'self' data: https://s4.anilist.co https://uploads.mangadex.org https://*.mangadex.network",
              // MangaDex blocks cross-origin browser calls, so it is reached via /api/manga instead
              "connect-src 'self' https://graphql.anilist.co " + (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"),
              "frame-src https://www.youtube-nocookie.com https://www.dailymotion.com https://challenges.cloudflare.com",
              "font-src 'self'",
              "frame-ancestors 'none'",
            ].join("; "),
          },
        ],
      },
    ];
  },
};
