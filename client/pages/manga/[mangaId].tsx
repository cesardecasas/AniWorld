import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { getCover } from "../../pages/api/mangadex";
import Axios from "axios";
import Link from "next/link";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Image from "next/image";
import Button from "react-bootstrap/Button";
import Dropdown from "react-bootstrap/Dropdown";
import type { GetServerSideProps } from "next";
import type { MangadexManga, MangadexChapter, MangadexRelationship, User, UserList } from "../../types";

interface ChapterDisplay {
  chap: MangadexChapter;
  displayTitle: string;
}

function computeChapterDisplay(
  chapters: MangadexChapter[] = [],
  missingLabel = "Chapter #"
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
  const { year, description, title, status, publicationDemographic } =
    details.attributes;

  const route = useRouter();

  const [image, setImage] = useState("");
  const [load, setLoad] = useState(false);
  const [userList, setList] = useState<Partial<UserList>>({});
  const [lang, setLang] = useState<string[]>([]);
  const [chapterArr, setChapterArr] = useState<MangadexChapter[]>([]);
  const [currentLang, setCurrentLang] = useState("en");

  const aniapi = Axios.create({
    baseURL: "https://aniworld-api.herokuapp.com",
  });

  const populate = async () => {
    const file = cover?.attributes?.fileName;
    setImage(`https://uploads.mangadex.org/covers/${details.id}/${file}.512.jpg`);
    const arr: string[] = [];
    chapters.forEach((e, i) => {
      if (!lang.includes(e.attributes.translatedLanguage)) {
        arr.push(e.attributes.translatedLanguage);
        if (i === chapters.length - 1) {
          setLang(Array.from(new Set(arr)));
        }
      }
    });
    const n = chapters.filter(
      (el) => el.attributes.translatedLanguage === currentLang
    );
    setChapterArr(n);
  };

  const missing = "Chapter #";

  const addManga = async () => {
    const body = { type: "manga", newItem: `${details.id}` };
    const item = await aniapi.put(`/api/list/update/${currentUser?.id}`, body);
    setList(item.data);
  };

  const removeManga = async () => {
    const arr = userList.anime_id?.splice(1, details.id as any);
    const body = { type: "manga", arr };
    const item = await aniapi.put(`/api/list/remove/${currentUser?.id}`, body);
    setList(item.data[1][0]);
  };

  useEffect(() => {
    const fetchData = async () => {
      await populate();
      if (currentUser?.id) {
        const userList = await aniapi.get(`/api/list/get/${currentUser.id}`);
        setList(userList.data);
      }
    };
    fetchData();
  }, [route.query.id, currentLang, currentUser]);

  return (
    <div className="page-container">
      <div className="detailsBody">
        <section style={{ marginTop: "1rem" }}>
          <h1>{title.en}</h1>
          <Row className="g-3">
            <Col md={4} xs={12}>
              <div>
                {image ? (
                  <div
                    style={{ width: "100%", borderRadius: 8, overflow: "hidden" }}
                  >
                    <Image
                      src={image}
                      width={400}
                      height={560}
                      alt={`${title.en} cover`}
                      className="manga-cover"
                      style={{ width: "100%", height: "auto", display: "block" }}
                    />
                  </div>
                ) : (
                  <div
                    style={{
                      width: "100%",
                      height: 200,
                      background: "#eee",
                      borderRadius: 8,
                    }}
                  />
                )}
              </div>

              {authenticated && (
                <div style={{ marginTop: "1rem" }}>
                  {userList?.manga_id?.includes(`${details.id}`) ? (
                    <Button variant="dark" onClick={() => removeManga()}>
                      Remove from List
                    </Button>
                  ) : (
                    <Button variant="dark" onClick={() => addManga()}>
                      Add to List
                    </Button>
                  )}
                </div>
              )}
            </Col>

            <Col md={8} xs={12}>
              <aside
                className="d-flex flex-wrap align-items-center gap-2"
                style={{ marginTop: "0.5rem" }}
              >
                <span className="badge info-badge bg-white text-dark">
                  Status: {status}
                </span>
                <span className="badge info-badge bg-white text-dark">
                  Genre:{" "}
                  {Array.isArray(publicationDemographic)
                    ? publicationDemographic.join(", ")
                    : publicationDemographic}
                </span>
                <span className="badge info-badge bg-white text-dark">
                  Release: {year}
                </span>
              </aside>
            </Col>
          </Row>
        </section>

        <section style={{ marginTop: "1.5rem" }}>
          <h3>Synopsis</h3>
          <p className="lead">{description.en}</p>
        </section>

        <section style={{ marginTop: "1rem" }}>
          <div className="d-flex align-items-center justify-content-between">
            <h3>Chapter List</h3>
            {lang.length > 1 && (
              <Dropdown>
                <Dropdown.Toggle variant="dark" id="dropdown-basic">
                  Language: {currentLang}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  {lang.map((el, i) => (
                    <Dropdown.Item key={i} onClick={() => setCurrentLang(el)}>
                      {el}
                    </Dropdown.Item>
                  ))}
                </Dropdown.Menu>
              </Dropdown>
            )}
          </div>

          <ul className="list-group chapter-list" style={{ marginTop: "0.75rem" }}>
            {computeChapterDisplay(chapterArr, missing).map((item, i) => (
              <li key={i} className="list-group-item chapter-item">
                <Link
                  href={`/chapter/${item.chap.id}`}
                  className="chapter-link d-block"
                >
                  <strong>{item.chap.attributes.chapter}.-</strong>{" "}
                  {item.displayTitle}
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
