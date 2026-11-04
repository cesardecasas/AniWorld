import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { getCover } from "../../lib/mangadex";
import Axios from "axios";
import Link from "next/link";
import Image from "next/image";
import Dropdown from "react-bootstrap/Dropdown";
import styles from "../../styles/MangaDetail.module.css";
import type { GetServerSideProps } from "next";
import type {
  MangadexManga,
  MangadexChapter,
  MangadexRelationship,
  User,
  ListEntry,
  EntryStatus,
  AppComment,
} from "../../types";

const STATUS_LABELS: Record<EntryStatus, string> = {
  in_progress: "Reading",
  completed: "Completed",
  dropped: "Dropped",
  on_hold: "On Hold",
  planned: "Plan to Read",
};

interface ChapterDisplay {
  chap: MangadexChapter;
  displayTitle: string;
}

function computeChapterDisplay(
  chapters: MangadexChapter[] = [],
  missingLabel = "Chapter #",
): ChapterDisplay[] {
  const arr = (chapters || []).slice().sort((a, b) => {
    const an = parseFloat(a.attributes.chapter) || 0;
    const bn = parseFloat(b.attributes.chapter) || 0;
    return an - bn;
  });

  const titleTotal: Record<string, number> = {};
  arr.forEach((c) => {
    const raw = (c.attributes.title || "").trim();
    const normalized = raw ? raw.replace(/\s+/g, " ").toLowerCase() : "";
    const key = normalized || `__NO_TITLE__${c.attributes.chapter}`;
    titleTotal[key] = (titleTotal[key] || 0) + 1;
  });

  const titleSeen: Record<string, number> = {};
  return arr.map((c) => {
    const raw = (c.attributes.title || "").trim();
    const normalized = raw ? raw.replace(/\s+/g, " ").toLowerCase() : "";
    const key = normalized || `__NO_TITLE__${c.attributes.chapter}`;
    let displayTitle: string;
    if (!raw) {
      displayTitle = missingLabel;
    } else if (titleTotal[key] > 1) {
      titleSeen[key] = (titleSeen[key] || 0) + 1;
      displayTitle = `${raw} (Part ${titleSeen[key]})`;
    } else {
      displayTitle = raw;
    }
    return { chap: c, displayTitle };
  });
}

interface MangaDetailsProps {
  details: MangadexManga;
  chapters: MangadexChapter[];
  cover: { attributes?: { fileName?: string } } | null;
  currentUser: User | null;
  authenticated: boolean;
}

const AnimeDetails = ({
  details,
  chapters,
  cover,
  currentUser,
  authenticated,
}: MangaDetailsProps) => {
  const {
    year,
    description,
    title,
    status,
    publicationDemographic,
    contentRating,
    originalLanguage,
    lastChapter,
    lastVolume,
    updatedAt,
    tags,
    links,
  } = details.attributes;

  const route = useRouter();

  const [image, setImage] = useState("");
  const [entry, setEntry] = useState<ListEntry | null>(null);
  const [lang, setLang] = useState<string[]>([]);
  const [chapterArr, setChapterArr] = useState<MangadexChapter[]>([]);
  const [currentLang, setCurrentLang] = useState("en");
  const [comments, setComments] = useState<AppComment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const aniapi = Axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
  });

  const populate = async () => {
    const file = cover?.attributes?.fileName;
    setImage(
      `https://uploads.mangadex.org/covers/${details.id}/${file}.512.jpg`,
    );
    const allLangs = Array.from(
      new Set(chapters.map((c) => c.attributes.translatedLanguage)),
    );
    setLang(allLangs);
    setChapterArr(chapters.filter((el) => el.attributes.translatedLanguage === currentLang));
  };

  const missing = "Chapter #";

  const addToList = async (status: EntryStatus = "planned") => {
    if (!currentUser?.id) return;
    try {
      const res = await aniapi.post("/api/entries/upsert", {
        user_id: currentUser.id,
        content_id: details.id,
        content_type: "manga",
        status,
      });
      setEntry(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const updateEntryStatus = async (status: EntryStatus) => {
    if (!entry) return;
    try {
      const res = await aniapi.put(`/api/entries/${entry.id}`, { status });
      setEntry(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const removeFromList = async () => {
    if (!entry) return;
    try {
      await aniapi.delete(`/api/entries/${entry.id}`);
      setEntry(null);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchComments = async () => {
    try {
      const res = await aniapi.get(`/api/comment/getall/${details.id}`);
      setComments(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const submitComment = async () => {
    if (!commentText.trim() || !currentUser?.id) return;
    setSubmitting(true);
    try {
      const res = await aniapi.post("/api/comment/create", {
        user_id: currentUser.id,
        owner_id: details.id,
        type: "manga",
        content: commentText.trim(),
      });
      setComments((prev) => [res.data, ...prev]);
      setCommentText("");
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const deleteComment = async (commentId: number) => {
    try {
      await aniapi.delete(`/api/comment/delete/${commentId}`);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await populate();
      fetchComments();
      if (currentUser?.id) {
        try {
          const res = await aniapi.get(
            `/api/entries/check/${currentUser.id}/manga/${details.id}`
          );
          setEntry(res.data);
        } catch {
          setEntry(null);
        }
      }
    };
    fetchData();
  }, [route.query.id, currentLang, currentUser]);

  return (
    <div>
      {/* ── Hero ── */}
      <section className={styles.hero}>
        {image && (
          <div
            className={styles.heroBg}
            style={{ backgroundImage: `url(${image})` }}
          />
        )}
        <div className={styles.heroContent}>
          {image && (
            <div className={styles.coverWrap}>
              <Image
                src={image}
                width={180}
                height={256}
                alt={`${title.en} cover`}
                style={{ width: "100%", height: "auto", display: "block" }}
              />
            </div>
          )}
          <div className={styles.heroInfo}>
            <h1 className={styles.title}>{title.en ?? Object.values(title)[0]}</h1>
            <div className={styles.badges}>
              {status && (
                <span className={`${styles.badge} ${styles.badgeAccent}`}>
                  {status}
                </span>
              )}
              {year && <span className={styles.badge}>{year}</span>}
              {publicationDemographic && (
                <span className={styles.badge}>
                  {Array.isArray(publicationDemographic)
                    ? publicationDemographic.join(", ")
                    : publicationDemographic}
                </span>
              )}
              {contentRating && (
                <span className={styles.badge}>{contentRating}</span>
              )}
              {originalLanguage && (
                <span className={styles.badge}>{originalLanguage.toUpperCase()}</span>
              )}
            </div>
            {tags && tags.filter((t) => t.attributes.group === "genre").length > 0 && (
              <div className={styles.genreTags}>
                {tags
                  .filter((t) => t.attributes.group === "genre")
                  .map((t) => (
                    <span key={t.id} className={styles.genreTag}>
                      {t.attributes.name.en ?? Object.values(t.attributes.name)[0]}
                    </span>
                  ))}
              </div>
            )}
            {description.en && (
              <p className={styles.heroSynopsis}>{description.en}</p>
            )}
            {authenticated && (
              <div className={styles.heroActions}>
                {entry ? (
                  <>
                    <select
                      className={styles.statusSelect}
                      value={entry.status}
                      onChange={(e) => updateEntryStatus(e.target.value as EntryStatus)}
                    >
                      {(Object.keys(STATUS_LABELS) as EntryStatus[]).map((s) => (
                        <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                      ))}
                    </select>
                    <button className={styles.removeBtn} onClick={removeFromList}>
                      ✕ Remove from List
                    </button>
                  </>
                ) : (
                  <>
                    <button className={styles.addBtn} onClick={() => addToList("planned")}>
                      ♡ Plan to Read
                    </button>
                    <button className={styles.addBtn} onClick={() => addToList("in_progress")}>
                      ▶ Start Reading
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Content ── */}
      <div className={styles.content}>
        {description.en && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Synopsis</h2>
            <p className={styles.synopsisText}>{description.en}</p>
          </section>
        )}

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Details</h2>
          <div className={styles.infoGrid}>
            {status && (
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Status</span>
                <p className={styles.infoValue}>{status}</p>
              </div>
            )}
            {year && (
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Year</span>
                <p className={styles.infoValue}>{year}</p>
              </div>
            )}
            {originalLanguage && (
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Original Language</span>
                <p className={styles.infoValue}>{originalLanguage.toUpperCase()}</p>
              </div>
            )}
            {contentRating && (
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Content Rating</span>
                <p className={styles.infoValue}>{contentRating}</p>
              </div>
            )}
            {lastChapter && (
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Last Chapter</span>
                <p className={styles.infoValue}>{lastChapter}</p>
              </div>
            )}
            {lastVolume && (
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Last Volume</span>
                <p className={styles.infoValue}>{lastVolume}</p>
              </div>
            )}
            {updatedAt && (
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Last Updated</span>
                <p className={styles.infoValue}>
                  {new Date(updatedAt).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
        </section>

        {tags && tags.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Genres & Themes</h2>
            <div className={styles.contentTags}>
              {tags.map((t) => (
                <span key={t.id} className={styles.contentTag}>
                  {t.attributes.name.en ?? Object.values(t.attributes.name)[0]}
                </span>
              ))}
            </div>
          </section>
        )}

        {links && Object.keys(links).length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>External Links</h2>
            <div className={styles.externalLinks}>
              {links.mal && (
                <a
                  href={`https://myanimelist.net/manga/${links.mal}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.externalLink}
                >
                  MyAnimeList
                </a>
              )}
              {links.al && (
                <a
                  href={`https://anilist.co/manga/${links.al}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.externalLink}
                >
                  AniList
                </a>
              )}
              {links.mu && (
                <a
                  href={`https://www.mangaupdates.com/series.html?id=${links.mu}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.externalLink}
                >
                  MangaUpdates
                </a>
              )}
              {links.raw && (
                <a
                  href={links.raw}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.externalLink}
                >
                  Raw
                </a>
              )}
            </div>
          </section>
        )}

        {/* Reviews */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Reviews</h2>
          {authenticated && (
            <div style={{ marginBottom: "1.5rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <textarea
                rows={3}
                placeholder="Share your thoughts..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                style={{ width: "100%", padding: "0.6rem", borderRadius: "6px", border: "1px solid var(--bs-border-color)", resize: "vertical" }}
              />
              <button
                onClick={submitComment}
                disabled={submitting || !commentText.trim()}
                style={{ alignSelf: "flex-start", padding: "0.4rem 1rem" }}
              >
                {submitting ? "Posting..." : "Submit"}
              </button>
            </div>
          )}
          {comments.length === 0 ? (
            <p style={{ color: "gray" }}>No reviews yet. Be the first!</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {comments.map((c) => (
                <div
                  key={c.id}
                  style={{ border: "1px solid var(--bs-border-color)", borderRadius: "8px", padding: "1rem" }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.4rem" }}>
                    <strong>{c.User?.userName ?? "User"}</strong>
                    <span style={{ fontSize: "0.8rem", color: "gray" }}>
                      {new Date(c.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p style={{ margin: 0 }}>{c.content}</p>
                  {currentUser && Number(currentUser.id) === c.user_id && (
                    <button
                      onClick={() => deleteComment(c.id)}
                      style={{ marginTop: "0.5rem", fontSize: "0.8rem", color: "red", background: "none", border: "none", cursor: "pointer", padding: 0 }}
                    >
                      Delete
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        <section className={styles.section}>
          <div className={styles.chapterHeader}>
            <h2 className={styles.sectionTitle}>Chapters</h2>
            {lang.length > 1 && (
              <Dropdown>
                <Dropdown.Toggle variant="dark" id="dropdown-basic" size="sm">
                  {currentLang.toUpperCase()}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  {lang.map((el, i) => (
                    <Dropdown.Item key={i} onClick={() => setCurrentLang(el)}>
                      {el.toUpperCase()}
                    </Dropdown.Item>
                  ))}
                </Dropdown.Menu>
              </Dropdown>
            )}
          </div>

          <ul className={styles.chapterList}>
            {computeChapterDisplay(chapterArr, missing).map((item, i) => (
              <li key={i} className={styles.chapterItem}>
                <Link
                  href={`/chapter/${item.chap.id}`}
                  className={styles.chapterLink}
                >
                  <span className={styles.chapterNum}>
                    Ch. {item.chap.attributes.chapter}
                  </span>
                  <span className={styles.chapterTitle}>
                    {item.displayTitle}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
};

export default AnimeDetails;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const id = context.query.mangaId as string;
  const client = Axios.create({ baseURL: "https://api.mangadex.org/" });

  const res = await client.get(`manga/${id}`);
  let coverId: string | undefined;
  res.data.data.relationships.forEach((e: MangadexRelationship) => {
    if (e.type === "cover_art") {
      coverId = e.id;
    }
  });
  const resCover = coverId ? await getCover(coverId) : null;
  const chapters = await client.get(`manga/${id}/feed`);

  return {
    props: {
      details: res.data.data,
      chapters: chapters.data.data,
      cover: resCover?.data ?? null,
    },
  };
};
