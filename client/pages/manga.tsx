import axios from "axios";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import MangaSearchCard from "../components/cards/MangaSearchCard";
import styles from "../styles/Manga.module.css";
import type { GetStaticProps } from "next";
import type { MangadexManga } from "../types";

function getCoverUrl(manga: MangadexManga): string {
  const rel = manga.relationships.find((r) => r.type === "cover_art");
  const fileName = rel?.attributes?.fileName;
  return fileName
    ? `https://uploads.mangadex.org/covers/${manga.id}/${fileName}.512.jpg`
    : "";
}

function getTitle(manga: MangadexManga): string {
  return (
    manga.attributes.title.en ??
    Object.values(manga.attributes.title)[0] ??
    "Unknown"
  );
}

const PosterCard = ({ manga }: { manga: MangadexManga }) => {
  const cover = getCoverUrl(manga);
  const title = getTitle(manga);
  return (
    <Link href={`/manga/${manga.id}`} className={styles.posterLink}>
      <div className={styles.posterCard}>
        <div className={styles.posterImgWrap}>
          {cover && (
            <Image
              src={cover}
              alt={title}
              fill
              style={{ objectFit: "cover" }}
              sizes="148px"
            />
          )}
        </div>
        <p className={styles.posterTitle}>{title}</p>
      </div>
    </Link>
  );
};

interface MangaProps {
  popular: MangadexManga[];
  recentlyUpdated: MangadexManga[];
  newThisYear: MangadexManga[];
}

const Manga = ({ popular, recentlyUpdated, newThisYear }: MangaProps) => {
  const [random, setRandom] = useState<MangadexManga | null>(null);
  const [loadingRandom, setLoadingRandom] = useState(false);

  const getRandomManga = async () => {
    setLoadingRandom(true);
    try {
      const res = await axios.get(
        "https://api.mangadex.org/manga/random?includes[]=cover_art"
      );
      setRandom(res.data.data);
    } catch (error) {
      console.log(error);
    }
    setLoadingRandom(false);
  };

  const featured = popular[0];
  const featuredCover = featured ? getCoverUrl(featured) : "";
  const featuredTitle = featured ? getTitle(featured) : "";
  const featuredDesc = featured?.attributes.description?.en ?? "";

  return (
    <div className={styles.page}>
      {/* ── Hero ── */}
      {featured && (
        <section className={styles.hero}>
          {featuredCover && (
            <div
              className={styles.heroBg}
              style={{ backgroundImage: `url(${featuredCover})` }}
            />
          )}
          <div className={styles.heroContent}>
            {featuredCover && (
              <div className={styles.heroCover}>
                <Image
                  src={featuredCover}
                  alt={featuredTitle}
                  fill
                  style={{ objectFit: "cover" }}
                  priority
                />
              </div>
            )}
            <div className={styles.heroInfo}>
              <div className={styles.heroEyebrow}>Featured Manga</div>
              <h1 className={styles.heroTitle}>{featuredTitle}</h1>
              {featured.attributes.status && (
                <span className={styles.heroBadge}>
                  {featured.attributes.status}
                </span>
              )}
              {featuredDesc && (
                <p className={styles.heroSynopsis}>{featuredDesc}</p>
              )}
              <Link href={`/manga/${featured.id}`} className={styles.heroBtn}>
                Read Now →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── Sections ── */}
      <div className={styles.sections}>
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionHeading}>Most Popular</h2>
          </div>
          <div className={styles.scrollRow}>
            {popular.map((m) => (
              <PosterCard key={m.id} manga={m} />
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionHeading}>Recently Updated</h2>
          </div>
          <div className={styles.scrollRow}>
            {recentlyUpdated.map((m) => (
              <PosterCard key={m.id} manga={m} />
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionHeading}>New This Year</h2>
          </div>
          <div className={styles.scrollRow}>
            {newThisYear.map((m) => (
              <PosterCard key={m.id} manga={m} />
            ))}
          </div>
        </section>

        {/* ── Random ── */}
        <section className={styles.randomSection}>
          <div className={styles.randomHeader}>
            <div>
              <h2 className={styles.sectionHeading}>Feeling Lucky?</h2>
              <p className={styles.randomSub}>Discover a random manga</p>
            </div>
            <button
              className={styles.randomBtn}
              onClick={getRandomManga}
              disabled={loadingRandom}
            >
              {loadingRandom ? "Finding…" : "Random Manga"}
            </button>
          </div>
          {random && (
            <div className={styles.randomResult}>
              <MangaSearchCard man={random} />
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Manga;

export const getStaticProps: GetStaticProps = async () => {
  const client = axios.create({ baseURL: "https://api.mangadex.org/" });
  const year = new Date().getFullYear();
  const base = "includes[]=cover_art&availableTranslatedLanguage[]=en";

  const [popularRes, recentRes, yearRes] = await Promise.all([
    client.get(`manga?limit=12&order[followedCount]=desc&${base}`),
    client.get(`manga?limit=12&order[latestUploadedChapter]=desc&${base}`),
    client.get(`manga?limit=12&year=${year}&order[followedCount]=desc&${base}`),
  ]);

  return {
    props: {
      popular: popularRes.data.data,
      recentlyUpdated: recentRes.data.data,
      newThisYear: yearRes.data.data,
    },
    revalidate: 3600,
  };
};
