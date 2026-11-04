"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { LogoMark } from "./ui/Logo";
import { useLogout, useSession } from "../lib/queries";

const NAV = [
  { href: "/search", label: "Anime", match: (p: string) => p.startsWith("/search") || p.startsWith("/anime") },
  { href: "/manga", label: "Manga", match: (p: string) => p.startsWith("/manga") || p.startsWith("/chapter") },
  { href: "/seasons", label: "Seasons", match: (p: string) => p.startsWith("/seasons") },
];

export function SiteHeader() {
  const pathname = usePathname() ?? "/";
  const { data: user, isPending } = useSession();
  const ledgerHref = user ? `/list/${user.id}` : "/login?next=/list";

  const navLink = (href: string, label: string, active: boolean) => (
    <Link
      key={href}
      href={href}
      aria-current={active ? "page" : undefined}
      className={`whitespace-nowrap py-2 text-sm font-semibold uppercase tracking-[0.08em] ${
        active ? "text-parchment" : "text-ash hover:text-parchment"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <header className="border-b border-rune bg-obsidian">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-7 gap-y-3 px-4 py-4 sm:px-8">
        <Link href="/" className="flex items-center gap-2.5 text-parchment hover:text-parchment">
          <LogoMark className="text-gold" />
          <span className="font-display text-[28px] font-bold leading-none tracking-[0.02em]">AniWorld</span>
        </Link>

        <nav aria-label="Primary" className="order-3 -mx-1 flex w-full gap-6 overflow-x-auto px-1 md:order-none md:w-auto">
          {NAV.map((item) => navLink(item.href, item.label, item.match(pathname)))}
          {navLink(ledgerHref, "My Ledger", pathname.startsWith("/list"))}
        </nav>

        <form action="/search" role="search" className="order-4 flex w-full md:order-none md:flex-1 md:justify-end">
          <label className="flex h-11 w-full items-center gap-2.5 rounded-full border border-rune bg-crypt px-3.5 focus-within:border-gold md:max-w-[360px]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-ash" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-3.5-3.5" />
            </svg>
            <span className="sr-only">Search anime and manga</span>
            <input
              type="search"
              name="q"
              placeholder="Search the archives…"
              className="min-w-0 flex-1 bg-transparent text-sm text-parchment placeholder:text-ash-dim focus:outline-none"
            />
          </label>
        </form>

        <div className="ml-auto md:ml-0">
          {isPending ? (
            <span className="block h-11 w-24" aria-hidden="true" />
          ) : user ? (
            <UserMenu userName={user.userName} />
          ) : (
            <Link
              href={`/login?next=${encodeURIComponent(pathname)}`}
              className="inline-flex h-11 items-center rounded-full border border-gold px-[18px] text-sm font-semibold text-gold hover:bg-gold hover:text-obsidian"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

function UserMenu({ userName }: { userName: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname() ?? "/";
  const logout = useLogout();

  // Close when focus or a click leaves the menu
  useEffect(() => {
    if (!open) return;
    const close = (e: Event) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    document.addEventListener("focusin", close);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("focusin", close);
    };
  }, [open]);

  const signOut = async () => {
    await logout.mutateAsync().catch(() => undefined);
    setOpen(false);
    if (pathname.startsWith("/settings")) router.push("/");
    router.refresh();
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
        className="inline-flex h-11 items-center gap-2.5 rounded-full border border-rune px-2 pr-4 text-sm font-semibold text-parchment hover:border-gold"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full border border-gold font-display text-base text-gold" aria-hidden="true">
          {userName.charAt(0).toUpperCase()}
        </span>
        {userName}
      </button>
      {open && (
        <div className="absolute right-0 z-20 mt-2 flex w-48 flex-col rounded-xl border border-rune bg-crypt p-1.5 shadow-xl shadow-black/40">
          <Link href="/settings" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 text-sm text-parchment hover:bg-vault hover:text-parchment">
            Settings
          </Link>
          <button
            type="button"
            onClick={signOut}
            disabled={logout.isPending}
            className="rounded-lg px-3 py-2.5 text-left text-sm text-ash hover:bg-vault hover:text-crimson-light"
          >
            {logout.isPending ? "Signing out…" : "Sign out"}
          </button>
        </div>
      )}
    </div>
  );
}
