import Axios from "axios";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import styles from "../../styles/Chapter.module.css";
import type { GetServerSideProps } from "next";
import type { MangadexChapter, MangadexRelationship } from "../../types";

interface ChapterHash {
  hash: string;
  data: string[];
  dataSaver: string[];
}

interface ChapterProps {
  baseURL: string;
  chapter: MangadexChapter;
  chapters: MangadexChapter[];
  chapterHash: ChapterHash;
  mangaId: string | null;
}

const Chapter = ({
  baseURL,
  chapter,
  chapters,
  chapterHash,
  mangaId,
}: ChapterProps) => {
  const router = useRouter();

  const [sortedChapters, setSortedChapters] = useState<MangadexChapter[]>([]);
  const [dataSaver, setDataSaver] = useState(true);

  useEffect(() => {
    const sameLang = chapters.filter(
      (el) =>
        el.attributes.translatedLanguage ===
        chapter.attributes.translatedLanguage,
    );
    setSortedChapters(
      sameLang.sort(
        (a, b) =>
          parseFloat(a.attributes.chapter) - parseFloat(b.attributes.chapter),
      ),
    );
  }, [router.asPath, chapters, chapter]);

  const currentIdx = sortedChapters.findIndex((c) => c.id === chapter.id);
  const prevChapter = currentIdx > 0 ? sortedChapters[currentIdx - 1] : null;
  const nextChapter =
    currentIdx < sortedChapters.length - 1
      ? sortedChapters[currentIdx + 1]
      : null;

  const pages =
    dataSaver && chapterHash.dataSaver?.length > 0
      ? chapterHash.dataSaver
      : chapterHash.data;

  const imgBase = dataSaver
    ? `${baseURL}/data-saver/${chapterHash.hash}/`
    : `${baseURL}/data/${chapterHash.hash}/`;

  const chNum = chapter.attributes.chapter;
  const chTitle = chapter.attributes.title;

  return (
    <div>
      {/* ── Sticky reader bar ── */}
      <div className={styles.readerBar}>
        <div className={styles.readerBarInner}>
          {mangaId && (
            <Link href={`/manga/${mangaId}`} className={styles.backBtn}>
              ← Back
            </Link>
          )}

          <div className={styles.chapterInfo}>
            <div className={styles.chapterNum}>Chapter {chNum}</div>
            {chTitle && <div className={styles.chapterTitle}>{chTitle}</div>}
          </div>

          <button
            className={`${styles.qualityToggle} ${
              dataSaver ? styles.qualityToggleActive : ""
            }`}
            onClick={() => setDataSaver((v) => !v)}
            title="Toggle data saver (lower quality, faster loading)"
          >
            {dataSaver ? "Data Saver ON" : "Data Saver OFF"}
          </button>

          <div className={styles.navBtns}>
            {prevChapter ? (
              <Link
                href={`/chapter/${prevChapter.id}`}
                className={styles.navBtn}
              >
                ← Prev
              </Link>
            ) : (
              <span className={styles.navBtn} aria-disabled="true">
                ← Prev
              </span>
            )}
            {nextChapter ? (
              <Link
                href={`/chapter/${nextChapter.id}`}
                className={styles.navBtn}
              >
                Next →
              </Link>
            ) : (
              <span className={styles.navBtn} aria-disabled="true">
                Next →
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Page images ── */}
      {pages?.length > 0 ? (
        <div className={styles.reader}>
          {pages.map((page, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={page}
              src={`${imgBase}${page}`}
              alt={`Page ${i + 1}`}
              className={styles.pageImg}
              loading={i < 3 ? "eager" : "lazy"}
              decoding="async"
              width={800}
              height={1200}
            />
          ))}
        </div>
      ) : (
        <div className={styles.empty}>No pages available for this chapter.</div>
      )}

      {/* ── Bottom nav ── */}
      <div className={styles.bottomNav}>
        <span className={styles.pageCount}>{pages?.length ?? 0} pages</span>
        <div className={styles.bottomNavBtns}>
          {prevChapter ? (
            <Link href={`/chapter/${prevChapter.id}`} className={styles.navBtn}>
              ← Previous Chapter
            </Link>
          ) : (
            <span className={styles.navBtn} aria-disabled="true">
              ← Previous Chapter
            </span>
          )}
          {nextChapter ? (
            <Link href={`/chapter/${nextChapter.id}`} className={styles.navBtn}>
              Next Chapter →
            </Link>
          ) : (
            <span className={styles.navBtn} aria-disabled="true">
              Next Chapter →
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chapter;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const id = context.query.id as string;
  const client = Axios.create({ baseURL: "https://api.mangadex.org/" });

  const [chapterRes, serverRes] = await Promise.all([
    client.get(`chapter/${id}`),
    client.get(`at-home/server/${id}`),
  ]);

  let mangaId: string | null = null;
  chapterRes.data.data.relationships.forEach((el: MangadexRelationship) => {
    if (el.type === "manga") {
      mangaId = el.id;
    }
  });

  const chaptersRes = mangaId
    ? await client.get(`manga/${mangaId}/feed`)
    : null;

  return {
    props: {
      baseURL: serverRes.data.baseUrl,
      chapter: chapterRes.data.data,
      chapters: chaptersRes?.data.data ?? [],
      chapterHash: serverRes.data.chapter,
      mangaId,
    },
  };
};
