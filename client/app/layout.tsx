import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import { Providers } from "./providers";
import { SiteHeader } from "../components/SiteHeader";
import { SiteFooter } from "../components/SiteFooter";
import "./globals.css";

// Self-hosted at build time, so the CSP can keep font-src 'self'
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
});
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope" });

const siteUrl = process.env.URL ?? "http://localhost:3000"; // Netlify sets URL to the site's address

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "AniWorld · track anime and manga", template: "%s · AniWorld" },
  description: "Discover anime and manga, read chapters, and keep a ledger of everything you watch and read.",
  applicationName: "AniWorld",
  openGraph: { type: "website", siteName: "AniWorld" },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = { themeColor: "#0b0a0d", colorScheme: "dark" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${cormorant.variable} ${manrope.variable}`}>
      <body className="flex min-h-screen flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-gold focus:px-4 focus:py-2 focus:text-obsidian"
        >
          Skip to content
        </a>
        <Providers>
          <SiteHeader />
          <main id="main" className="flex-1">
            {children}
          </main>
          <SiteFooter />
        </Providers>
      </body>
    </html>
  );
}
