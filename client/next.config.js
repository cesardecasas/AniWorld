module.exports = {
  reactStrictMode: true,
  images: {
    domains: [
      "cdn.myanimelist.net",
      "myanimelist.net",
      "uploads.mangadex.org",
      "s4.anilist.co",
      "cmdxd98sb0x3yprd.mangadex.network",
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
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https://cdn.myanimelist.net https://myanimelist.net https://uploads.mangadex.org https://s4.anilist.co https://cmdxd98sb0x3yprd.mangadex.network",
              "connect-src 'self' " + (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"),
              "font-src 'self'",
              "frame-ancestors 'none'",
            ].join("; "),
          },
        ],
      },
    ];
  },
};
