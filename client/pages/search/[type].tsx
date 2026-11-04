import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { listAnime } from "../../lib/anime";
import SearchCard from "../../components/cards/SearchCard";
import { getManga } from "../../lib/mangadex";
import MangaSearchCard from "../../components/cards/MangaSearchCard";
import Offcanvas from "react-bootstrap/Offcanvas";
import Filters from "../../components/Filters";
import styles from "../../styles/Search.module.css";
import type { GetServerSideProps } from "next";
import type { Anime, MangadexManga } from "../../types";

interface SearchDetailsProps {
  results: Anime[];
  hasNextPage: boolean;
  resultsManga: MangadexManga[];
  searchQuery: string;
}

const SearchDetails = ({ results, hasNextPage, resultsManga, searchQuery }: SearchDetailsProps) => {
  const router = useRouter();

  const [searchResults, setResults] = useState<Anime[]>(results);
  const [manga, setManga] = useState<MangadexManga[]>(resultsManga);
  const [showManga, setShowManga] = useState(false);
  const [show, setShow] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setResults(results);
    setManga(resultsManga);
    const type = router.query.type as string;
    if (type) {
      setPage(parseInt(type.split("page=")[1]) || 1);
    }
  }, [router.asPath, results, resultsManga]);

  const changePage = (next: boolean) => {
    const url = router.asPath;
    const newPage = next ? page + 1 : page - 1;
    router.push(url.replace(`page=${page}`, `page=${newPage}`));
  };

  return (
    <div className={styles.page}>
      {/* ── Header ── */}
      <div className={styles.header}>
        <h1 className={styles.heading}>
          Results for{" "}
          <span className={styles.query}>&ldquo;{searchQuery}&rdquo;</span>
        </h1>
        <div className={styles.controls}>
          <div className={styles.toggle}>
            <button
              className={`${styles.toggleBtn} ${!showManga ? styles.active : ""}`}
              onClick={() => setShowManga(false)}
            >
              Anime
            </button>
            <button
              className={`${styles.toggleBtn} ${showManga ? styles.active : ""}`}
              onClick={() => setShowManga(true)}
            >
              Manga
            </button>
          </div>
          <button className={styles.filterBtn} onClick={() => setShow(true)}>
            ⚙ Filters
          </button>
        </div>
      </div>

      {/* ── Filters offcanvas ── */}
      <Offcanvas show={show} onHide={() => setShow(false)}>
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Filters</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Filters />
        </Offcanvas.Body>
      </Offcanvas>

      {/* ── Results grid ── */}
      <div className={styles.grid}>
        {showManga ? (
          manga.length > 0 ? (
            manga.map((man, i) => <MangaSearchCard man={man} key={i} />)
          ) : (
            <p className={styles.empty}>No manga results found.</p>
          )
        ) : searchResults.length > 0 ? (
          searchResults.map((result) => (
            <SearchCard
              key={result.id}
              score={result.score}
              id={result.id}
              name={result.title}
              image={result.coverImage}
              format={result.format}
              episodes={result.episodes}
            />
          ))
        ) : (
          <p className={styles.empty}>No anime results found.</p>
        )}
      </div>

      {/* ── Pagination ── */}
      {router.query.type && (
        <div className={styles.pagination}>
          <button
            className={styles.pageBtn}
            disabled={page <= 1}
            onClick={() => changePage(false)}
          >
            ← Previous
          </button>
          <span className={styles.pageNum}>{page}</span>
          <button
            className={styles.pageBtn}
            disabled={showManga ? manga.length < 12 : !hasNextPage}
            onClick={() => changePage(true)}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
};

export default SearchDetails;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const type = context.query.type as string;
  const rawQuery = type.split("anime=")[1]?.split("&")[0] ?? "";
  const searchQuery = rawQuery.replace(/_/g, " ");

  const page = parseInt(type.split("page=")[1]) || 1;

  // Optional filters from the URL (values are AniList genre names and format enums)
  const genre = type.match(/genre=([^&]+)/)?.[1]?.replace(/_/g, " ");
  const format = type.match(/format=([A-Z_]+)/)?.[1];

  const skip = page * 12 - 12;
  const [anime, resManga] = await Promise.all([
    listAnime({
      search: searchQuery.trim() || undefined,
      genre,
      format,
      page,
      perPage: 24,
      sort: searchQuery.trim() ? ["SEARCH_MATCH"] : ["POPULARITY_DESC"],
    }).catch((error) => {
      console.error("Anime search failed:", error?.message);
      return { results: [], hasNextPage: false };
    }),
    getManga(searchQuery, skip),
  ]);

  context.res.setHeader("Cache-Control", "public, s-maxage=600, stale-while-revalidate=3600");

  return {
    props: {
      results: anime.results,
      hasNextPage: anime.hasNextPage,
      resultsManga: resManga ?? [],
      searchQuery,
    },
  };
};
