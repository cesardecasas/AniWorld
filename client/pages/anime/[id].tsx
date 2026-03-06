import { useEffect, useState, useMemo } from "react";
import { getAnime, getSong } from "../api/fetch";
import { useRouter } from "next/router";
import { Loader, ErrorCard } from "../../components/ResponseHandlers";
import SongCard from "../../components/cards/SongCard";
import RelatedCard from "../../components/cards/RelatedCard";
import CommentBox from "../../components/CommentBox";
import Image from "next/image";
import axios from "axios";
import Container from "react-bootstrap/Container";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Button from "react-bootstrap/Button";
import Link from "next/link";
import { animeDetails, handleGQL } from "../../queries";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import type { GetServerSideProps } from "next";
import type { JikanAnime, JikanEpisode, User, UserList, SongData, RelatedAnime, AniApiSongResponse } from "../../types";

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

  return (
    <div className="detailsBody">
      <section style={{ marginTop: "8%" }}>
        <Row xs={1} md={2}>
          <Col md={4} lg={4}>
            <div style={{ height: "100%", width: "30px" }}>
              {details?.images?.jpg?.image_url ? (
                <Image
                  src={details.images.jpg.image_url}
                  alt="Anime Poster"
                  width={300}
                  height={450}
                  quality={100}
                  layout="responsive"
                />
              ) : (
                <></>
              )}
            </div>
            {authenticated ? (
              userList?.anime_id?.includes(`${data.mal_id}`) ? (
                <Button
                  style={{ marginTop: "3%" }}
                  variant="dark"
                  onClick={() => removeAnime()}
                >
                  <AiFillHeart style={{ color: "white" }} />
                </Button>
              ) : (
                <Button
                  style={{ marginTop: "3%" }}
                  variant="dark"
                  onClick={() => addAnime()}
                >
                  <AiOutlineHeart style={{ color: "white" }} />
                </Button>
              )
            ) : (
              <></>
            )}
          </Col>
          <Col md={7} lg={7} style={{ marginTop: "13%" }}>
            <h1>{details.title}</h1>
            <p>{details.synopsis}</p>
          </Col>
        </Row>
      </section>
      <section style={{ marginTop: "3%" }}>
        {details?.background ? <h4>Background</h4> : <></>}
        <p>{details.background}</p>
      </section>
      <section>
        <h4>Trailer</h4>
        {details?.trailer?.url ? (
          <iframe
            className="trailer"
            width="75%"
            height="315"
            src={details.trailer.embed_url ?? ""}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        ) : (
          <p>No trailer Available</p>
        )}
      </section>
      <h4>Related</h4>

      {aniDetails?.id ? (
        <div>
          {songList?.data ? (
            <p>Here are the songs preview found</p>
          ) : error ? (
            <></>
          ) : (
            <p>Look for songs</p>
          )}
          {songList?.data ? (
            <Row xs={1} sm={1} md={2}>
              {songList.data.documents.map((song, i) => (
                <Col key={i}>
                  <SongCard
                    spotify={song.open_spotify_url}
                    title={song.title}
                    url={song.preview_url}
                    id={i}
                    album={song.album}
                    artist={song.artist}
                  />
                </Col>
              ))}
            </Row>
          ) : load ? (
            <Loader />
          ) : error ? (
            <ErrorCard msg="Songs" />
          ) : (
            <button className="btn btn-dark btn-lg" id="search" onClick={fetchSongs}>
              Search
            </button>
          )}
        </div>
      ) : (
        <></>
      )}

      {ep ? (
        <section style={{ marginTop: "2%" }}>
          <h3>Episodes</h3>
          <Row xs={1} sm={1} md={2}>
            {ep?.map((el, i) => (
              <Col key={i} className="chapters">
                <a href={el.url} target="_blank" rel="noopener noreferrer">
                  <p
                    style={{
                      border: "2px solid black",
                      borderRadius: "1.5rem",
                      color: "black",
                      textDecorationColor: "black",
                      backgroundColor: "white",
                      textAlign: "center",
                    }}
                  >
                    {el.mal_id}.-{el.title}
                  </p>
                </a>
              </Col>
            ))}
          </Row>
        </section>
      ) : (
        <></>
      )}

      <br />
      <h4>Related Search</h4>
      <Row xs={2} sm={2} md={4}>
        {details?.related?.Sequel?.map((card, i) => (
          <Col key={i}>
            <RelatedCard card={card} type="Sequel" />
          </Col>
        ))}
        {details?.related?.Prequel?.map((card, i) => (
          <Col key={i}>
            <RelatedCard card={card} type="Prequel" />
          </Col>
        ))}
      </Row>
      <br />
      <section>
        <CommentBox />
      </section>
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
