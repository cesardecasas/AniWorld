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
import type { JikanAnime, JikanEpisode, User, UserList, AniApiSongResponse } from "../../types";

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

const AnimeDetails = ({
  data,
  authenticated,
  currentUser,
  ep,
  pics,
  AniList,
}: AnimeDetailsProps) => {
  const route = useRouter();

  const [details, setDetails] = useState<Partial<JikanAnime>>({});
  const [aniDetails, setAniDetails] = useState<Partial<AniApiAnimeDoc>>({});
  const [songList, setSongList] = useState<AniApiSongResponse>({});
  const [error, setError] = useState(false);
  const [load, setLoad] = useState(false);
  const [userList, setList] = useState<Partial<UserList>>({});
  const aniapi = useMemo(
    () => axios.create({ baseURL: "https://aniworld-api.herokuapp.com" }),
    []
  );

  const addAnime = async () => {
    const body = { type: "anime", newItem: `${data.mal_id}` };
    const item = await aniapi.put(`/api/list/update/${currentUser?.id}`, body);
    setList(item.data);
  };

  const removeAnime = async () => {
    let idx = userList?.anime_id?.indexOf(`${data.mal_id}`) ?? -1;
    const arr = userList?.anime_id?.splice(idx, 0);
    const body = { type: "anime", arr };
    const item = await aniapi.put(`/api/list/remove/${currentUser?.id}`, body);
    setList(item.data[1][0]);
  };

  const fetchSongs = async () => {
    setLoad(!load);
    const res = await getSong(aniDetails.id!);
    if (res.message === "Zero songs found") setError(!error);
    setLoad(false);
    setSongList(res);
  };

  useEffect(() => {
    const init = async () => {
      try {
        if (data) {
          console.log("data", data);
          const aniRes = await getAnime(data.mal_id);
          setDetails(data);
          if (
            aniRes &&
            aniRes.data &&
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

      try {
        if (currentUser?.id) {
          const userList = await aniapi.get(`/api/list/get/${currentUser.id}`);
          setList(userList.data);
        }
      } catch (err) {
        console.error("fetch user list error", err);
      }
    };
    init();
  }, [route.query.id, currentUser, data, aniapi]);

  const heroImage = data?.images?.jpg?.large_image_url;
  const hasRelated =
    (details?.related?.Sequel?.length ?? 0) > 0 ||
    (details?.related?.Prequel?.length ?? 0) > 0;

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
              {data.type && (
                <span className={styles.badge}>{data.type}</span>
              )}
              {data.status && (
                <span className={styles.badge}>{data.status}</span>
              )}
              {data.episodes && (
                <span className={styles.badge}>{data.episodes} eps</span>
              )}
              {data.duration && (
                <span className={styles.badge}>{data.duration}</span>
              )}
              {data.rating && (
                <span className={styles.badge}>{data.rating}</span>
              )}
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
            {authenticated && (
              <div className={styles.heroActions}>
                {userList?.anime_id?.includes(`${data.mal_id}`) ? (
                  <button className={styles.removeBtn} onClick={removeAnime}>
                    ♥ Remove from List
                  </button>
                ) : (
                  <button className={styles.addBtn} onClick={addAnime}>
                    ♡ Add to List
                  </button>
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
                  <span className={styles.statValue}>
                    {data.score.toFixed(2)}
                  </span>
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
                <p className={styles.infoValue}>
                  {data.studios.map((s) => s.name).join(", ")}
                </p>
              </div>
            )}
            {data.producers?.length > 0 && (
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Producers</span>
                <p className={styles.infoValue}>
                  {data.producers.map((p) => p.name).join(", ")}
                </p>
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
                  {data.season.charAt(0).toUpperCase() + data.season.slice(1)}{" "}
                  {data.year}
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
        {[...( data.genres ?? []), ...(data.themes ?? []), ...(data.demographics ?? [])].length > 0 && (
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
        {details.background && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Background</h2>
            <p className={styles.bodyText}>{details.background}</p>
          </section>
        )}

        {/* Trailer */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Trailer</h2>
          {details?.trailer?.embed_url ? (
            <div className={styles.trailerWrap}>
              <iframe
                src={details.trailer.embed_url}
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
                <p className={styles.songsPrompt}>
                  Search for soundtrack previews for this anime.
                </p>
                <button className={styles.searchBtn} onClick={fetchSongs}>
                  Find Soundtrack
                </button>
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
                  <a
                    href={el.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.episodeLink}
                  >
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
              {details?.related?.Sequel?.map((card, i) => (
                <RelatedCard key={`sq-${i}`} card={card} type="Sequel" />
              ))}
              {details?.related?.Prequel?.map((card, i) => (
                <RelatedCard key={`pr-${i}`} card={card} type="Prequel" />
              ))}
            </div>
          </section>
        )}

        {/* Reviews */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Reviews</h2>
          <div className={styles.reviewBox}>
            <label className={styles.reviewLabel}>Leave a review</label>
            <textarea className={styles.reviewTextarea} rows={3} placeholder="Share your thoughts..." />
            <button className={styles.reviewSubmit}>Submit</button>
          </div>
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

  const handleResponse = (response: Response) => {
    return response.json().then((json) => {
      return response.ok ? json : Promise.reject(json);
    });
  };
  const handleData = (data: unknown) => data;
  const handleError = (error: unknown) => console.error(error);

  await fetch(url, options)
    .then(handleResponse)
    .then(handleData)
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
