import Axios from "axios";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import type { GetServerSideProps } from "next";
import type { MangadexChapter, MangadexRelationship } from "../../types";

interface ChapterHash {
  hash: string;
  data: string[];
}

interface ChapterProps {
  baseURL: string;
  chapter: MangadexChapter;
  chapters: MangadexChapter[];
  chapterHash: ChapterHash;
}

const Chapter = ({ baseURL, chapter, chapters, chapterHash }: ChapterProps) => {
  const router = useRouter();

  const [chapterIds, setChapters] = useState<MangadexChapter[]>([]);
  const [currentChapter, setCurrentChapter] = useState("");

  const changePage = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const target = e.target as HTMLElement;
    let url = router.asPath;
    let idx = -1;

    chapterIds.forEach((el, i) => {
      if (el.id === currentChapter) {
        idx = i;
      }
    });

    if (target.innerHTML === "Next") {
      router.push(
        `${url.replace(
          `chapter/${currentChapter}`,
          `chapter/${chapterIds[idx + 1]?.id}`
        )}`
      );
    } else if (target.innerHTML === "Previous") {
      router.push(
        `${url.replace(
          `chapter/${currentChapter}`,
          `chapter/${chapterIds[idx - 1]?.id}`
        )}`
      );
    }
  };

  useEffect(() => {
    const n = chapters.filter(
      (el) =>
        el.attributes.translatedLanguage === chapter.attributes.translatedLanguage
    );
    setChapters(
      n?.sort(
        (a, b) =>
          parseFloat(a.attributes.chapter) - parseFloat(b.attributes.chapter)
      )
    );
    setCurrentChapter(chapter.id);
  }, [router.asPath]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "80%",
        marginLeft: "10%",
      }}
    >
      <h3 style={{ margin: "3%" }}>
        The images take a little time to load, please be patient
      </h3>
      <section className="chapter">
        {chapterHash?.data?.map((page, i) => (
          <Image
            key={i}
            src={`${baseURL}/data/${chapterHash.hash}/${page}`}
            layout="responsive"
            width={800}
            height={1200}
            alt={`page-${i}`}
          />
        ))}
      </section>
      <nav
        aria-label="Page navigation example"
        style={{ gridColumn: "2", marginTop: "5%" }}
      >
        <ul className="pagination justify-content-center">
          <li
            className={`page-item ${
              currentChapter === chapterIds[0]?.id ? "disabled" : ""
            }`}
          >
            <a
              className="page-link"
              onClick={
                currentChapter === chapterIds[0]?.id
                  ? undefined
                  : (e) => changePage(e)
              }
            >
              Previous
            </a>
          </li>
          <li className="page-item">
            <a className="page-link" onClick={(e) => changePage(e)}>
              Next
            </a>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Chapter;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const id = context.query.id as string;
  const client = Axios.create({ baseURL: "https://api.mangadex.org/" });
  const chapter = await client.get(`chapter/${id}`);
  const server = await client.get(`/at-home/server/${id}`);
  let mangaId: string | undefined;
  chapter.data.data.relationships.forEach((el: MangadexRelationship) => {
    if (el.type === "manga") {
      mangaId = el.id;
    }
  });

  const chapters = await client.get(`manga/${mangaId}/feed`);

  return {
    props: {
      baseURL: server.data.baseUrl,
      chapter: chapter.data.data,
      chapters: chapters.data.data,
      chapterHash: server.data.chapter,
    },
  };
};
