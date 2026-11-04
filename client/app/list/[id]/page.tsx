import type { Metadata } from "next";
import { notFound, unstable_rethrow } from "next/navigation";
import { cache } from "react";
import { backendFetch } from "../../../lib/server/backend";
import { getServerSession, getSessionToken } from "../../../lib/server/session";
import { getAnimeSummaries } from "../../../lib/anime";
import { listManga, mangaCover, mangaTitle } from "../../../lib/mangadex";
import { Stat } from "../../../components/ui/Stat";
import { MessageState } from "../../../components/ui/States";
import { ListTable, type LedgerRow } from "../../../components/ListTable";
import type { ListEntry, UserInfo, UserStats } from "../../../types";

// Entries change whenever their owner edits them, so lists are always fresh
export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

const loadUser = cache(async (id: string) => {
  if (!/^\d+$/.test(id)) notFound();
  const res = await backendFetch(`/users/${id}`, { token: await getSessionToken() });
  if (res.status === 404) notFound();
  if (!res.ok) throw new Error(`API responded ${res.status}`);
  return (await res.json()) as UserInfo;
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const user = await loadUser((await params).id).catch(() => null);
  return { title: user ? `${user.userName}'s ledger` : "Ledger", robots: { index: false } };
}

export default async function LedgerPage({ params }: Props) {
  const { id } = await params;
  let user: UserInfo;
  try {
    user = await loadUser(id);
  } catch (error) {
    unstable_rethrow(error); // notFound() works by throwing, so let it through
    return (
      <MessageState eyebrow="The ledger" title="The ledger is sealed for now">
        The AniWorld API isn&apos;t responding. It sleeps when idle, so please try again in a minute.
      </MessageState>
    );
  }

  const [viewer, entries, stats] = await Promise.all([
    getServerSession(),
    backendFetch(`/users/${id}/entries`)
      .then((r) => (r.ok ? (r.json() as Promise<ListEntry[]>) : []))
      .catch(() => [] as ListEntry[]),
    backendFetch(`/users/${id}/stats`)
      .then((r) => (r.ok ? (r.json() as Promise<UserStats>) : null))
      .catch(() => null),
  ]);
  const rows = await enrich(entries);
  const isOwner = viewer != null && String(viewer.id) === String(user.id);
  const episodes = entries.filter((e) => e.content_type === "anime").reduce((sum, e) => sum + e.progress, 0);

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-10 px-4 pt-12 sm:px-8">
      <header className="flex flex-wrap items-end justify-between gap-8">
        <div className="flex items-center gap-5">
          <span
            className="flex h-20 w-20 flex-none items-center justify-center rounded-full border border-gold bg-crypt font-display text-4xl text-gold"
            aria-hidden="true"
          >
            {user.userName.charAt(0).toUpperCase()}
          </span>
          <div className="flex flex-col gap-1">
            <span className="eyebrow">The ledger of</span>
            <h1 className="font-display text-[clamp(36px,5vw,52px)] font-semibold leading-none">{user.userName}</h1>
          </div>
        </div>
        <dl className="flex flex-wrap gap-8">
          <Stat value={stats?.totalEntries ?? entries.length} label="Entries" />
          <Stat value={(stats?.anime.completed ?? 0) + (stats?.manga.completed ?? 0)} label="Completed" />
          <Stat value={episodes} label="Episodes" />
          <Stat value={stats?.avgRating ? Number(stats.avgRating).toFixed(1) : "—"} label="Avg rating" accent />
        </dl>
      </header>

      <ListTable rows={rows} isOwner={isOwner} />
    </div>
  );
}

/** Titles and covers for every entry: one batched lookup per source, never one per entry */
async function enrich(entries: ListEntry[]): Promise<LedgerRow[]> {
  const animeIds = entries.filter((e) => e.content_type === "anime").map((e) => e.content_id);
  const mangaIds = entries.filter((e) => e.content_type === "manga").map((e) => e.content_id);
  const [anime, manga] = await Promise.all([
    animeIds.length ? getAnimeSummaries(animeIds).catch(() => ({})) : {},
    mangaIds.length
      ? listManga({ ids: mangaIds.slice(0, 100), limit: Math.min(mangaIds.length, 100) })
          .then((r) => Object.fromEntries(r.results.map((m) => [m.id, m])))
          .catch(() => ({}))
      : {},
  ]);

  return entries.map((e) => {
    if (e.content_type === "anime") {
      const a = (anime as Record<string, Awaited<ReturnType<typeof getAnimeSummaries>>[string]>)[e.content_id];
      return {
        ...e,
        title: a?.title ?? `Anime #${e.content_id}`,
        image: a?.coverImage ?? null,
        total: a?.episodes ?? null,
        meta: a ? [a.format, a.year].filter(Boolean).join(" · ") : null,
        href: `/anime/${e.content_id}`,
      };
    }
    const m = (manga as Record<string, Parameters<typeof mangaTitle>[0]>)[e.content_id];
    return {
      ...e,
      title: m ? mangaTitle(m) : "Unknown manga",
      image: m ? mangaCover(m, 256) : null,
      total: m?.attributes.lastChapter ? Number(m.attributes.lastChapter) || null : null,
      meta: m?.attributes.year ? `Manga · ${m.attributes.year}` : "Manga",
      href: `/manga/${e.content_id}`,
    };
  });
}
