import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import RelatedCard from "../../components/cards/RelatedCard";
import Image from "next/image";
import { api, apiError } from "../../lib/api";
import { Honeypot, Turnstile, turnstileEnabled } from "../../components/BotGuard";
import { getAnimePage, isNotFound } from "../../lib/anime";
import styles from "../../styles/AnimeDetail.module.css";
import type { GetServerSideProps } from "next";
import type {
  Anime,
  AnimeEpisode,
  AnimeThemes,
  User,
  ListEntry,
  EntryStatus,
  AppComment,
} from "../../types";

interface AnimeDetailsProps {
  data: Anime | null;
  authenticated: boolean;
  currentUser: User | null;
  ep: AnimeEpisode[];
  themes: AnimeThemes;
}

const STATUS_LABELS: Record<EntryStatus, string> = {
  in_progress: "Watching",
  completed: "Completed",
  dropped: "Dropped",
  on_hold: "On Hold",
  planned: "Plan to Watch",
};

const AnimeDetails = ({
  data,
  authenticated,
  currentUser,
  ep,
  themes,
}: AnimeDetailsProps) => {
  const route = useRouter();

  const [entry, setEntry] = useState<ListEntry | null>(null);
  const [comments, setComments] = useState<AppComment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [website, setWebsite] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [commentAttempt, setCommentAttempt] = useState(0);
  const [commentError, setCommentError] = useState("");

  const fetchEntry = async () => {
    if (!currentUser?.id || !data) return;
    try {
      const res = await api.get(
        `/me/entries/anime/${data.id}`
      );
      setEntry(res.data);
    } catch {
      setEntry(null);
    }
  };

  const addToList = async (status: EntryStatus = "planned") => {
    if (!currentUser?.id || !data) return;
    try {
      const res = await api.put("/me/entries", {
        content_id: data.id,
        content_type: "anime",
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
      const res = await api.patch(`/entries/${entry.id}`, { status });
      setEntry(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const removeFromList = async () => {
    if (!entry) return;
    try {
      await api.delete(`/entries/${entry.id}`);
      setEntry(null);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchComments = async () => {
    if (!data) return;
    try {
      const res = await api.get(`/titles/${data.id}/comments`);
      setComments(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const submitComment = async () => {
    if (!commentText.trim() || !currentUser?.id || !data) return;
    setSubmitting(true);
    setCommentError("");
    try {
      const res = await api.post("/comments", {
        owner_id: data.id,
        type: "anime",
        content: commentText.trim(),
        website,
        turnstileToken,
      });
      setComments((prev) => [res.data, ...prev]);
      setCommentText("");
    } catch (err) {
      setCommentError(apiError(err, "Couldn't post your review. Please try again."));
    } finally {
      setSubmitting(false);
      // Turnstile tokens are single-use
      setTurnstileToken("");
      setCommentAttempt((n) => n + 1);
    }
  };

  const deleteComment = async (commentId: number) => {
    try {
      await api.delete(`/comments/${commentId}`);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchEntry();
    fetchComments();
  }, [route.query.id, currentUser, data]);

  if (!data) {
    return (
      <div className={styles.section} style={{ textAlign: "center", padding: "4rem 1rem" }}>
        <h1 className={styles.sectionTitle}>This page is temporarily unavailable</h1>
        <p className={styles.bodyText}>
          The anime database didn&apos;t respond in time. Please try again in a moment.
        </p>
        <button className={styles.retryBtn} onClick={() => route.replace(route.asPath)}>
          Try again
        </button>
      </div>
    );
  }

  const heroImage = data.bannerImage ?? data.coverImage;
  const relations = data.relations;
  const openings = themes?.openings ?? [];
  const endings = themes?.endings ?? [];
  const nextAiring = data.nextEpisode
    ? `Episode ${data.nextEpisode.episode} · ${new Date(data.nextEpisode.airingAt * 1000).toUTCString().slice(5, 16)}`
    : null;

  return (
    <div>
      {/* ── Hero ── */}
      <section className={styles.hero}>
        {heroImage && (
          <div
            className={styles.heroBg}
            style={{ backgroundImage: `url(${heroImage})` }}
          />
        )}
        <div className={styles.heroContent}>
          {data.coverImage && (
            <div className={styles.coverWrap}>
              <Image
                src={data.coverImage}
                alt={data.title}
                width={200}
                height={300}
                style={{ width: "100%", height: "auto", display: "block" }}
              />
            </div>
          )}
          <div className={styles.heroInfo}>
            <h1 className={styles.title}>{data.title}</h1>
            <div className={styles.badges}>
              {data.score != null && data.score > 0 && (
                <span className={`${styles.badge} ${styles.badgeScore}`}>
                  ★ {data.score.toFixed(1)}
                </span>
              )}
              {data.format && <span className={styles.badge}>{data.format}</span>}
              {data.status && <span className={styles.badge}>{data.status}</span>}
              {data.episodes && <span className={styles.badge}>{data.episodes} eps</span>}
              {data.duration && <span className={styles.badge}>{data.duration} min</span>}
              {data.rating && <span className={styles.badge}>{data.rating}</span>}
              {data.year && <span className={styles.badge}>{data.year}</span>}
            </div>
            {data.genres?.length > 0 && (
              <div className={styles.genreTags}>
                {data.genres.map((g) => (
                  <span key={g} className={styles.genreTag}>
                    {g}
                  </span>
                ))}
              </div>
            )}
            {data.synopsis && (
              <p className={styles.heroSynopsis}>{data.synopsis}</p>
            )}

            {/* ── List actions ── */}
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
                      ♡ Plan to Watch
                    </button>
                    <button className={styles.addBtn} onClick={() => addToList("in_progress")}>
                      ▶ Start Watching
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

        {/* Synopsis */}
        {data.synopsis && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Synopsis</h2>
            <p className={styles.bodyText} style={{ whiteSpace: "pre-line" }}>{data.synopsis}</p>
          </section>
        )}

        {/* Stats */}
        {(data.rank || data.popularityRank || data.members) && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Stats</h2>
            <div className={styles.statsGrid}>
              {data.score != null && data.score > 0 && (
                <div className={styles.statCard}>
                  <span className={styles.statValue}>{data.score.toFixed(1)}</span>
                  <span className={styles.statLabel}>Score</span>
                </div>
              )}
              {data.rank && (
                <div className={styles.statCard}>
                  <span className={styles.statValue}>#{data.rank.toLocaleString()}</span>
                  <span className={styles.statLabel}>Ranked</span>
                </div>
              )}
              {data.popularityRank && (
                <div className={styles.statCard}>
                  <span className={styles.statValue}>#{data.popularityRank.toLocaleString()}</span>
                  <span className={styles.statLabel}>Popularity</span>
                </div>
              )}
              {data.members && (
                <div className={styles.statCard}>
                  <span className={styles.statValue}>{data.members.toLocaleString()}</span>
                  <span className={styles.statLabel}>Members</span>
                </div>
              )}
              {data.favourites && (
                <div className={styles.statCard}>
                  <span className={styles.statValue}>{data.favourites.toLocaleString()}</span>
                  <span className={styles.statLabel}>Favorites</span>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Info grid */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Details</h2>
          <div className={styles.infoGrid}>
            {data.studios?.length > 0 && (
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Studio</span>
                <p className={styles.infoValue}>{data.studios.join(", ")}</p>
              </div>
            )}
            {data.producers?.length > 0 && (
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Producers</span>
                <p className={styles.infoValue}>{data.producers.join(", ")}</p>
              </div>
            )}
            {data.source && (
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Source</span>
                <p className={styles.infoValue}>{data.source}</p>
              </div>
            )}
            {data.aired && (
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Aired</span>
                <p className={styles.infoValue}>{data.aired}</p>
              </div>
            )}
            {data.season && data.year && (
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Season</span>
                <p className={styles.infoValue}>
                  {data.season} {data.year}
                </p>
              </div>
            )}
            {nextAiring && (
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Next episode</span>
                <p className={styles.infoValue}>{nextAiring}</p>
              </div>
            )}
          </div>
        </section>

        {/* Genres & themes */}
        {data.genres.length + data.tags.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Genres & Themes</h2>
            <div className={styles.contentTags}>
              {[...data.genres, ...data.tags].map((g) => (
                <span key={g} className={styles.contentTag}>{g}</span>
              ))}
            </div>
          </section>
        )}

        {/* Trailer */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Trailer</h2>
          {data.trailerUrl ? (
            <div className={styles.trailerWrap}>
              <iframe
                src={data.trailerUrl}
                title={`${data.title} trailer`}
                allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <p className={styles.noTrailer}>No trailer available</p>
          )}
        </section>

        {/* Theme songs */}
        {(openings.length > 0 || endings.length > 0) && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Theme Songs</h2>
            <div className={styles.themeGrid}>
              {openings.length > 0 && (
                <div>
                  <h3 className={styles.themeHeading}>Openings</h3>
                  <ol className={styles.themeList}>
                    {openings.map((song, i) => <li key={i}>{song}</li>)}
                  </ol>
                </div>
              )}
              {endings.length > 0 && (
                <div>
                  <h3 className={styles.themeHeading}>Endings</h3>
                  <ol className={styles.themeList}>
                    {endings.map((song, i) => <li key={i}>{song}</li>)}
                  </ol>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Episodes */}
        {ep && ep.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              Episodes{" "}
              <span style={{ fontSize: "0.8rem", fontWeight: 400, color: "var(--text-secondary)" }}>
                ({ep.length})
              </span>
            </h2>
            <div className={styles.episodeGrid}>
              {ep.map((el, i) => (
                <div key={i} className={styles.episodeItem}>
                  {el.url ? (
                    <a href={el.url} target="_blank" rel="noopener noreferrer" className={styles.episodeLink}>
                      {el.number && <span className={styles.episodeNum}>Ep. {el.number}</span>}
                      <span className={styles.episodeTitle}>{el.title}</span>
                    </a>
                  ) : (
                    <span className={styles.episodeLink}>
                      {el.number && <span className={styles.episodeNum}>Ep. {el.number}</span>}
                      <span className={styles.episodeTitle}>{el.title}</span>
                    </span>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Related */}
        {relations.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Related</h2>
            <div className={styles.relatedRow}>
              {relations.map((r) => (
                <RelatedCard key={`${r.relation}-${r.type}-${r.id}`} card={r} />
              ))}
            </div>
          </section>
        )}

        {/* Reviews */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Reviews</h2>

          {authenticated && (
            <div className={styles.reviewBox} style={{ marginBottom: "1.5rem" }}>
              <label className={styles.reviewLabel}>Leave a review</label>
              <textarea
                className={styles.reviewTextarea}
                rows={3}
                placeholder="Share your thoughts..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
              />
              <Honeypot value={website} onChange={setWebsite} />
              <Turnstile key={commentAttempt} onToken={setTurnstileToken} />
              <button
                className={styles.reviewSubmit}
                onClick={submitComment}
                disabled={submitting || !commentText.trim() || (turnstileEnabled && !turnstileToken)}
              >
                {submitting ? "Posting..." : "Submit"}
              </button>
              {commentError && <p style={{ color: "#e5484d", margin: 0 }}>{commentError}</p>}
            </div>
          )}

          {comments.length === 0 ? (
            <p style={{ color: "gray" }}>No reviews yet. Be the first!</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {comments.map((c) => (
                <div
                  key={c.id}
                  style={{
                    border: "1px solid var(--bs-border-color)",
                    borderRadius: "8px",
                    padding: "1rem",
                  }}
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

      </div>
    </div>
  );
};

export default AnimeDetails;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const id = context.query.id as string;

  try {
    const { anime, episodes, themes } = await getAnimePage(id);

    // The page holds no per-user data (lists and comments load in the browser), so the CDN
    // can cache it. That cuts API traffic and absorbs crawler bursts.
    context.res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");

    return { props: { data: anime, ep: episodes, themes } };
  } catch (error) {
    if (isNotFound(error)) return { notFound: true };
    console.error(`Anime ${id} failed:`, (error as Error)?.message);
    return { props: { data: null, ep: [], themes: { openings: [], endings: [] } } };
  }
};
