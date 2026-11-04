module.exports = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "s4.anilist.co" },
      { protocol: "https", hostname: "uploads.mangadex.org" },
    ],
  },
  async headers() {
    // Private and per-user pages stay out of search results even if a crawler ignores robots.txt
    const noindex = ["/Login", "/signup", "/settings/:path*", "/list/:path*", "/chapter/:path*", "/api/:path*"].map(
      (source) => ({ source, headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] }),
    );
    return [
      ...noindex,
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
              // The AniWorld API is reached through this site's own /api/v1 routes
              "connect-src 'self' https://graphql.anilist.co",
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
