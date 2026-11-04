import Link from "next/link";
import { LogoMark } from "./ui/Logo";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-rune">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-8 text-[13px] text-ash-dim sm:px-8">
        <span className="flex items-center gap-2.5">
          <LogoMark size={18} className="text-rune-strong" />
          AniWorld · data from{" "}
          <a href="https://anilist.co" className="text-ash hover:text-parchment">AniList</a>,{" "}
          <a href="https://jikan.moe" className="text-ash hover:text-parchment">Jikan</a> and{" "}
          <a href="https://mangadex.org" className="text-ash hover:text-parchment">MangaDex</a>
        </span>
        <span className="flex gap-5">
          <Link href="/seasons" className="text-ash hover:text-parchment">Seasons</Link>
          <a href="https://github.com/cesardecasas/AniWorld" className="text-ash hover:text-parchment">GitHub</a>
          <a href="https://github.com/cesardecasas/AniWorldAPI" className="text-ash hover:text-parchment">API</a>
        </span>
      </div>
    </footer>
  );
}
