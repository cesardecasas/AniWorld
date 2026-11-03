import { Badge, ProgressBar } from "react-bootstrap";
import axios from "axios";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Image from "next/image";
import type { GetServerSideProps } from "next";
import type { User, ListEntry, EntryStatus } from "../../types";
import styles from "../../styles/MyList.module.css";

const STATUS_LABELS: Record<EntryStatus, string> = {
  in_progress: "In Progress",
  completed: "Completed",
  dropped: "Dropped",
  on_hold: "On Hold",
  planned: "Planned",
};

const STATUS_VARIANT: Record<EntryStatus, string> = {
  in_progress: "primary",
  completed: "success",
  dropped: "danger",
  on_hold: "warning",
  planned: "secondary",
};

const STATUS_ORDER: EntryStatus[] = [
  "in_progress",
  "completed",
  "on_hold",
  "planned",
  "dropped",
];

interface EnrichedEntry extends ListEntry {
  title?: string;
  imageUrl?: string;
}

interface MyListProps {
  entries: ListEntry[];
  currentUser: User | null;
}

const MyList = ({ entries, currentUser }: MyListProps) => {
  const router = useRouter();
  const [localEntries, setLocalEntries] = useState<EnrichedEntry[]>(
    entries.map((e) => ({ ...e }))
  );
  const [activeTab, setActiveTab] = useState<"anime" | "manga">("anime");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<{
    status: EntryStatus;
    progress: number;
    rating: number | null;
    notes: string;
  }>({ status: "planned", progress: 0, rating: null, notes: "" });

  const AniAPi = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
  });

  useEffect(() => {
    if (currentUser === null) router.push("/");
  }, [currentUser, router]);

  // Progressively enrich entries with titles and cover images
  useEffect(() => {
    if (!entries.length) return;

    const enrich = async () => {
      for (const entry of entries) {
        try {
          let title: string | undefined;
          let imageUrl: string | undefined;

          if (entry.content_type === "anime") {
            const res = await axios.get(
              `https://api.jikan.moe/v4/anime/${entry.content_id}`
            );
            title = res.data.data.title;
            imageUrl = res.data.data.images?.jpg?.image_url;
            // Respect Jikan rate limit (3 req/s)
            await new Promise((r) => setTimeout(r, 340));
          } else {
            const res = await axios.get(
              `https://api.mangadex.org/manga/${entry.content_id}?includes[]=cover_art`
            );
            const manga = res.data.data;
            const titleObj = manga.attributes?.title as Record<string, string>;
            title = titleObj?.en ?? Object.values(titleObj ?? {})[0];
            const coverRel = manga.relationships?.find(
              (r: { type: string; attributes?: { fileName?: string } }) =>
                r.type === "cover_art"
            );
            if (coverRel?.attributes?.fileName) {
              imageUrl = `https://uploads.mangadex.org/covers/${entry.content_id}/${coverRel.attributes.fileName}.256.jpg`;
            }
          }

          setLocalEntries((prev) =>
            prev.map((e) => (e.id === entry.id ? { ...e, title, imageUrl } : e))
          );
        } catch {
          // leave entry as-is on error
        }
      }
    };

    enrich();
  }, [entries]);

  const animeEntries = localEntries.filter((e) => e.content_type === "anime");
  const mangaEntries = localEntries.filter((e) => e.content_type === "manga");

  // Auto-switch tab if the default section is empty
  useEffect(() => {
    if (animeEntries.length === 0 && mangaEntries.length > 0) {
      setActiveTab("manga");
    }
  }, []);

  // Derived stats
  const completed = localEntries.filter((e) => e.status === "completed").length;
  const inProgress = localEntries.filter((e) => e.status === "in_progress").length;
  const planned = localEntries.filter((e) => e.status === "planned").length;
  const ratedEntries = localEntries.filter((e) => e.rating);
  const avgRating =
    ratedEntries.length > 0
      ? (
          ratedEntries.reduce((s, e) => s + (e.rating ?? 0), 0) /
          ratedEntries.length
        ).toFixed(1)
      : null;

  const openEdit = (entry: EnrichedEntry) => {
    setEditingId(entry.id);
    setEditForm({
      status: entry.status,
      progress: entry.progress,
      rating: entry.rating,
      notes: entry.notes ?? "",
    });
  };

  const saveEdit = async (entryId: number) => {
    try {
      const res = await AniAPi.put(`/api/entries/${entryId}`, editForm);
      setLocalEntries((prev) =>
        prev.map((e) => (e.id === entryId ? { ...e, ...res.data } : e))
      );
      setEditingId(null);
    } catch (err) {
      console.error(err);
    }
  };

  const removeEntry = async (entryId: number) => {
    try {
      await AniAPi.delete(`/api/entries/${entryId}`);
      setLocalEntries((prev) => prev.filter((e) => e.id !== entryId));
    } catch (err) {
      console.error(err);
    }
  };

  const renderEntry = (entry: EnrichedEntry, type: "anime" | "manga") => {
    const href = `/${type === "anime" ? "anime" : "manga"}/${entry.content_id}`;
    const isEditing = editingId === entry.id;
    const unit = type === "anime" ? "Ep" : "Ch";

    return (
      <div key={entry.id} className={styles.entryCard}>
        <div className={styles.entryInner}>
          {/* Cover */}
          {entry.imageUrl ? (
            <div className={styles.entryCover}>
              <Link href={href}>
                <Image
                  src={entry.imageUrl}
                  alt={entry.title ?? entry.content_id}
                  width={88}
                  height={128}
                  className={styles.entryCoverImg}
                  style={{ objectFit: "cover" }}
                />
              </Link>
            </div>
          ) : (
            <div className={styles.entryCoverPlaceholder}>
              {type === "anime" ? "▶" : "📖"}
            </div>
          )}

          {/* Body */}
          <div className={styles.entryBody}>
            <div className={styles.entryInfo}>
              <Link href={href} className={styles.entryTitle}>
                {entry.title ?? "Loading…"}
              </Link>

              {!entry.title && (
                <span className={styles.entryIdFallback}>
                  {entry.content_id}
                </span>
              )}

              <div className={styles.entryMeta}>
                {entry.progress > 0 && (
                  <span className={styles.entryMetaItem}>
                    {unit} {entry.progress}
                  </span>
                )}
                {entry.rating && (
                  <span className={`${styles.entryMetaItem} ${styles.entryMetaStar}`}>
                    ★ {entry.rating}/10
                  </span>
                )}
                {entry.notes && (
                  <span className={styles.entryNotes}>
                    &ldquo;{entry.notes}&rdquo;
                  </span>
                )}
              </div>

              {entry.progress > 0 && (
                <div className={styles.progressRow}>
                  <span className={styles.progressLabel}>
                    {unit} {entry.progress}
                  </span>
                  <div className={styles.progressBarWrap}>
                    <ProgressBar
                      now={entry.progress}
                      max={100}
                      style={{ height: "4px" }}
                      variant={STATUS_VARIANT[entry.status]}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className={styles.entryActions}>
              <button className={styles.btnEdit} onClick={() => openEdit(entry)}>
                Edit
              </button>
              <button
                className={styles.btnRemove}
                onClick={() => removeEntry(entry.id)}
              >
                Remove
              </button>
            </div>
          </div>
        </div>

        {/* Inline edit form */}
        {isEditing && (
          <div className={styles.editForm}>
            <div className={styles.editFormRow}>
              <label className={styles.editLabel}>
                Status
                <select
                  className={styles.editSelect}
                  value={editForm.status}
                  onChange={(e) =>
                    setEditForm((f) => ({
                      ...f,
                      status: e.target.value as EntryStatus,
                    }))
                  }
                >
                  {STATUS_ORDER.map((s) => (
                    <option key={s} value={s}>
                      {STATUS_LABELS[s]}
                    </option>
                  ))}
                </select>
              </label>

              <label className={styles.editLabel}>
                {unit}
                <input
                  type="number"
                  min={0}
                  className={styles.editInput}
                  style={{ width: "72px" }}
                  value={editForm.progress}
                  onChange={(e) =>
                    setEditForm((f) => ({
                      ...f,
                      progress: Number(e.target.value),
                    }))
                  }
                />
              </label>

              <label className={styles.editLabel}>
                Rating
                <input
                  type="number"
                  min={1}
                  max={10}
                  className={styles.editInput}
                  style={{ width: "64px" }}
                  placeholder="1–10"
                  value={editForm.rating ?? ""}
                  onChange={(e) =>
                    setEditForm((f) => ({
                      ...f,
                      rating: e.target.value ? Number(e.target.value) : null,
                    }))
                  }
                />
              </label>
            </div>

            <label className={styles.editLabel} style={{ width: "100%" }}>
              Notes
              <input
                type="text"
                className={styles.editNotesInput}
                placeholder="Optional notes…"
                value={editForm.notes}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, notes: e.target.value }))
                }
              />
            </label>

            <div className={styles.editFormActions}>
              <button className={styles.btnSave} onClick={() => saveEdit(entry.id)}>
                Save
              </button>
              <button
                className={styles.btnCancel}
                onClick={() => setEditingId(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderSection = (
    groupEntries: EnrichedEntry[],
    type: "anime" | "manga"
  ) => {
    if (groupEntries.length === 0) {
      return (
        <div className={styles.emptyTab}>
          No {type} in your list yet.{" "}
          <Link href={type === "manga" ? "/manga" : "/"}>Browse {type}</Link>
        </div>
      );
    }

    const grouped = STATUS_ORDER.reduce<Record<EntryStatus, EnrichedEntry[]>>(
      (acc, s) => {
        acc[s] = groupEntries.filter((e) => e.status === s);
        return acc;
      },
      {} as Record<EntryStatus, EnrichedEntry[]>
    );

    return (
      <section className={styles.section}>
        {STATUS_ORDER.map((status) => {
          const items = grouped[status];
          if (!items.length) return null;
          return (
            <div key={status} className={styles.statusGroup}>
              <div className={styles.statusGroupHeader}>
                <Badge bg={STATUS_VARIANT[status]}>
                  {STATUS_LABELS[status]}
                </Badge>
                <span className={styles.statusGroupCount}>
                  ({items.length})
                </span>
              </div>
              {items.map((entry) => renderEntry(entry, type))}
            </div>
          );
        })}
      </section>
    );
  };

  if (!entries.length) {
    return (
      <div className={styles.empty}>
        <h2 className={styles.emptyTitle}>Your list is empty</h2>
        <p className={styles.emptyText}>
          Start browsing anime and manga to build your list.
        </p>
        <Link href="/" className={styles.browseLink}>
          Browse
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <h2 className={styles.pageTitle}>My List</h2>

        {/* Stats chips */}
        <div className={styles.statsRow}>
          <div className={styles.statChip}>
            <span className={styles.statChipValue}>{localEntries.length}</span>
            <span className={styles.statChipLabel}>Total</span>
          </div>
          <div className={styles.statChip}>
            <span className={styles.statChipValue}>{animeEntries.length}</span>
            <span className={styles.statChipLabel}>Anime</span>
          </div>
          <div className={styles.statChip}>
            <span className={styles.statChipValue}>{mangaEntries.length}</span>
            <span className={styles.statChipLabel}>Manga</span>
          </div>
          {inProgress > 0 && (
            <div className={styles.statChip}>
              <span className={styles.statChipValue}>{inProgress}</span>
              <span className={styles.statChipLabel}>Watching</span>
            </div>
          )}
          {completed > 0 && (
            <div className={styles.statChip}>
              <span className={styles.statChipValue}>{completed}</span>
              <span className={styles.statChipLabel}>Completed</span>
            </div>
          )}
          {planned > 0 && (
            <div className={styles.statChip}>
              <span className={styles.statChipValue}>{planned}</span>
              <span className={styles.statChipLabel}>Planned</span>
            </div>
          )}
          {avgRating && (
            <div className={styles.statChip}>
              <span className={styles.statChipValue}>★ {avgRating}</span>
              <span className={styles.statChipLabel}>Avg Rating</span>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === "anime" ? styles.tabActive : ""}`}
            onClick={() => setActiveTab("anime")}
          >
            Anime
            <span className={styles.tabCount}>{animeEntries.length}</span>
          </button>
          <button
            className={`${styles.tab} ${activeTab === "manga" ? styles.tabActive : ""}`}
            onClick={() => setActiveTab("manga")}
          >
            Manga
            <span className={styles.tabCount}>{mangaEntries.length}</span>
          </button>
        </div>
      </div>

      {/* Active tab content */}
      {activeTab === "anime"
        ? renderSection(animeEntries, "anime")
        : renderSection(mangaEntries, "manga")}
    </div>
  );
};

export default MyList;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const AniAPi = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
  });
  const id = context.query.id as string;

  try {
    const res = await AniAPi.get(`/api/entries/user/${id}`);
    return { props: { entries: res.data } };
  } catch {
    return { props: { entries: [] } };
  }
};
