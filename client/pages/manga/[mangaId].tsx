import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { getCover } from "../../pages/api/mangadex";
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
  UserList,
} from "../../types";

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
    setImage(
      `https://uploads.mangadex.org/covers/${details.id}/${file}.512.jpg`,
    );
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
      (el) => el.attributes.translatedLanguage === currentLang,
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
            {authenticated &&
              (userList?.manga_id?.includes(`${details.id}`) ? (
                <button className={styles.removeBtn} onClick={removeManga}>
                  − Remove from List
                </button>
              ) : (
                <button className={styles.addBtn} onClick={addManga}>
                  + Add to List
                </button>
              ))}
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
