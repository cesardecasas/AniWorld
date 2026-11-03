import { useEffect, useState, useMemo } from "react";
import { getAnime, getSong } from "../api/fetch";
import { useRouter } from "next/router";
import { Loader, ErrorCard } from "../../components/ResponseHandlers";
import SongCard from "../../components/cards/SongCard";
import RelatedCard from "../../components/cards/RelatedCard";
import Image from "next/image";
import axios from "axios";
import { animeDetails } from "../../queries";
import styles from "../../styles/AnimeDetail.module.css";
import type { GetServerSideProps } from "next";
import type {
  JikanAnime,
  JikanEpisode,
  User,
  AniApiSongResponse,
  ListEntry,
  EntryStatus,
  AppComment,
} from "../../types";

interface AniApiAnimeDoc {
  id: number;
  mal_id: number;
}

interface AnimeDetailsProps {
  data: JikanAnime;
  authenticated: boolean;
  currentUser: User | null;
  ep: JikanEpisode[];
  pics: unknown;
  AniList: unknown;
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
  pics,
  AniList,
}: AnimeDetailsProps) => {
  const route = useRouter();

  const [aniDetails, setAniDetails] = useState<Partial<AniApiAnimeDoc>>({});
  const [songList, setSongList] = useState<AniApiSongResponse>({});
  const [error, setError] = useState(false);
  const [load, setLoad] = useState(false);
  const [entry, setEntry] = useState<ListEntry | null>(null);
  const [comments, setComments] = useState<AppComment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const aniapi = useMemo(
    () => axios.create({ baseURL: process.env.NEXT_PUBLIC_API_URL }),
    []
  );

  const fetchEntry = async () => {
    if (!currentUser?.id) return;
    try {
      const res = await aniapi.get(
        `/api/entries/check/${currentUser.id}/anime/${data.mal_id}`
      );
      setEntry(res.data);
    } catch {
      setEntry(null);
    }
  };

  const addToList = async (status: EntryStatus = "planned") => {
    if (!currentUser?.id) return;
    try {
      const res = await aniapi.post("/api/entries/upsert", {
        user_id: currentUser.id,
        content_id: String(data.mal_id),
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
      const res = await aniapi.get(`/api/comment/getall/${data.mal_id}`);
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
        owner_id: String(data.mal_id),
        type: "anime",
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

  const fetchSongs = async () => {
    setLoad(true);
    const res = await getSong(aniDetails.id!);
    if (res.message === "Zero songs found") setError(true);
    setLoad(false);
    setSongList(res);
  };

  useEffect(() => {
    const init = async () => {
      try {
        if (data) {
          const aniRes = await getAnime(data.mal_id);
          if (
            aniRes?.data?.documents &&
            Array.isArray(aniRes.data.documents) &&
            aniRes.data.documents.length > 0
          ) {
            setAniDetails(aniRes.data.documents[0]);
          }
        }
      } catch (err) {
        console.error("fetchDetails error", err);
        setError(true);
      }
    };

    init();
    fetchEntry();
    fetchComments();
  }, [route.query.id, currentUser, data]);

  const heroImage = data?.images?.jpg?.large_image_url;
  const hasRelated =
    (data?.related?.Sequel?.length ?? 0) > 0 ||
    (data?.related?.Prequel?.length ?? 0) > 0;

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
          {data?.images?.jpg?.image_url && (
            <div className={styles.coverWrap}>
              <Image
                src={data.images.jpg.image_url}
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
              {data.score > 0 && (
                <span className={`${styles.badge} ${styles.badgeScore}`}>
                  ★ {data.score.toFixed(1)}
                </span>
              )}
              {data.type && <span className={styles.badge}>{data.type}</span>}
              {data.status && <span className={styles.badge}>{data.status}</span>}
              {data.episodes && <span className={styles.badge}>{data.episodes} eps</span>}
              {data.duration && <span className={styles.badge}>{data.duration}</span>}
              {data.rating && <span className={styles.badge}>{data.rating}</span>}
              {(data.year ?? data.aired?.prop?.from?.year) && (
                <span className={styles.badge}>
                  {data.year ?? data.aired.prop.from.year}
                </span>
              )}
            </div>
            {data.genres?.length > 0 && (
              <div className={styles.genreTags}>
                {data.genres.map((g) => (
                  <span key={g.mal_id} className={styles.genreTag}>
                    {g.name}
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
            <p className={styles.bodyText}>{data.synopsis}</p>
          </section>
        )}

        {/* Stats */}
        {(data.rank || data.popularity || data.scored_by || data.members) && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Stats</h2>
            <div className={styles.statsGrid}>
              {data.score > 0 && (
                <div className={styles.statCard}>
                  <span className={styles.statValue}>{data.score.toFixed(2)}</span>
                  <span className={styles.statLabel}>
                    Score{data.scored_by ? ` · ${data.scored_by.toLocaleString()} users` : ""}
                  </span>
                </div>
              )}
              {data.rank && (
                <div className={styles.statCard}>
                  <span className={styles.statValue}>#{data.rank.toLocaleString()}</span>
                  <span className={styles.statLabel}>Ranked</span>
                </div>
              )}
              {data.popularity && (
                <div className={styles.statCard}>
                  <span className={styles.statValue}>#{data.popularity.toLocaleString()}</span>
                  <span className={styles.statLabel}>Popularity</span>
                </div>
              )}
              {data.members && (
                <div className={styles.statCard}>
                  <span className={styles.statValue}>{data.members.toLocaleString()}</span>
                  <span className={styles.statLabel}>Members</span>
                </div>
              )}
              {data.favorites && (
                <div className={styles.statCard}>
                  <span className={styles.statValue}>{data.favorites.toLocaleString()}</span>
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
                <p className={styles.infoValue}>{data.studios.map((s) => s.name).join(", ")}</p>
              </div>
            )}
            {data.producers?.length > 0 && (
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Producers</span>
                <p className={styles.infoValue}>{data.producers.map((p) => p.name).join(", ")}</p>
              </div>
            )}
            {data.source && (
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Source</span>
                <p className={styles.infoValue}>{data.source}</p>
              </div>
            )}
            {data.aired?.string && (
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Aired</span>
                <p className={styles.infoValue}>{data.aired.string}</p>
              </div>
            )}
            {data.season && data.year && (
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Season</span>
                <p className={styles.infoValue}>
                  {data.season.charAt(0).toUpperCase() + data.season.slice(1)} {data.year}
                </p>
              </div>
            )}
            {data.broadcast?.string && (
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Broadcast</span>
                <p className={styles.infoValue}>{data.broadcast.string}</p>
              </div>
            )}
          </div>
        </section>

        {/* Genres & themes */}
        {[...(data.genres ?? []), ...(data.themes ?? []), ...(data.demographics ?? [])].length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Genres & Themes</h2>
            <div className={styles.contentTags}>
              {[...(data.genres ?? []), ...(data.themes ?? []), ...(data.demographics ?? [])].map((g) => (
                <span key={g.mal_id} className={styles.contentTag}>{g.name}</span>
              ))}
            </div>
          </section>
        )}

        {/* Background */}
        {data.background && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Background</h2>
            <p className={styles.bodyText}>{data.background}</p>
          </section>
        )}

        {/* Trailer */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Trailer</h2>
          {data?.trailer?.embed_url ? (
            <div className={styles.trailerWrap}>
              <iframe
                src={data.trailer.embed_url}
                title={`${data.title} trailer`}
                allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <p className={styles.noTrailer}>No trailer available</p>
          )}
        </section>

        {/* Songs */}
        {aniDetails?.id && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Soundtrack</h2>
            {songList?.data ? (
              <div className={styles.songsGrid}>
                {songList.data.documents.map((song, i) => (
                  <SongCard
                    key={i}
                    spotify={song.open_spotify_url}
                    title={song.title}
                    url={song.preview_url}
                    id={i}
                    album={song.album}
                    artist={song.artist}
                  />
                ))}
              </div>
            ) : load ? (
              <Loader />
            ) : error ? (
              <ErrorCard msg="Songs" />
            ) : (
              <>
                <p className={styles.songsPrompt}>Search for soundtrack previews for this anime.</p>
                <button className={styles.searchBtn} onClick={fetchSongs}>Find Soundtrack</button>
              </>
            )}
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
                  <a href={el.url} target="_blank" rel="noopener noreferrer" className={styles.episodeLink}>
                    <span className={styles.episodeNum}>Ep. {el.mal_id}</span>
                    <span className={styles.episodeTitle}>{el.title}</span>
                  </a>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Related */}
        {hasRelated && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Related</h2>
            <div className={styles.relatedRow}>
              {data?.related?.Sequel?.map((card, i) => (
                <RelatedCard key={`sq-${i}`} card={card} type="Sequel" />
              ))}
              {data?.related?.Prequel?.map((card, i) => (
                <RelatedCard key={`pr-${i}`} card={card} type="Prequel" />
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
              <button
                className={styles.reviewSubmit}
                onClick={submitComment}
                disabled={submitting || !commentText.trim()}
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
  const JikanClient = axios.create({ baseURL: "https://api.jikan.moe/v4/" });
  const res = await JikanClient.get(`anime/${id}`);
  const episodes = await JikanClient.get(`anime/${id}/episodes`);
  const pictures = await JikanClient.get(`anime/${id}/pictures`);

  const variables = { id };
  const url = "https://graphql.anilist.co";
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ query: animeDetails, variables }),
  };

  let nData: unknown;
  const handleResponse = (response: Response) => response.json().then((json) => response.ok ? json : Promise.reject(json));
  const handleError = (error: unknown) => console.error(error);

  await fetch(url, options)
    .then(handleResponse)
    .then((data) => (nData = data))
    .catch(handleError);

  return {
    props: {
      data: res.data.data,
      ep: episodes.data.data,
      pics: pictures.data,
      AniList: (nData as any)?.data ?? null,
    },
  };
};
