import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "AniWorld",
    short_name: "AniWorld",
    description: "Discover anime and manga and keep a ledger of everything you watch and read.",
    start_url: "/",
    display: "standalone",
    background_color: "#0b0a0d",
    theme_color: "#0b0a0d",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
