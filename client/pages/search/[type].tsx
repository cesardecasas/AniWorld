import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { getAnimeSearch } from "../api/fetch";
import SearchCard from "../../components/cards/SearchCard";
import { Loader } from "../../components/ResponseHandlers";
import { getManga } from "../api/mangadex";
import MangaSearchCard from "../../components/cards/MangaSearchCard";
import Offcanvas from "react-bootstrap/Offcanvas";
import Filters from "../../components/Filters";
import styles from "../../styles/Search.module.css";
import type { GetServerSideProps } from "next";
import type { JikanAnime, MangadexManga } from "../../types";

interface SearchDetailsProps {
  results: JikanAnime[];
  resultsManga: MangadexManga[];
  searchQuery: string;
}

const SearchDetails = ({ results, resultsManga, searchQuery }: SearchDetailsProps) => {
  const router = useRouter();

  const [searchResults, setResults] = useState<JikanAnime[]>([]);
  const [manga, setManga] = useState<MangadexManga[]>([]);
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
          searchResults.map((result, i) => (
            <SearchCard
              key={i}
              score={result.score}
              synopsis={result.synopsis}
              id={result.mal_id}
              name={result.title}
              image={result.images.jpg.image_url}
              rating={result.rating}
              episodes={result.episodes}
            />
          ))
        ) : (
          <div className={styles.empty}>
            <Loader />
          </div>
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

  // Parse optional filter params from the URL
  const ratedMatch = type.match(/rated=([^&]+)/);
  const genreMatch = type.match(/genre=([^&]+)/);
  const rated = ratedMatch?.[1] ?? null;
  const genreId = genreMatch?.[1] ?? null;

  // Build Jikan query with filters + page
  const acceptableQuery = rawQuery.replace("_", "/");
  let jikanQuery = `q=${acceptableQuery}&page=${page}`;
  if (rated) jikanQuery += `&rating=${rated}`;
  if (genreId) jikanQuery += `&genres=${genreId}`;

  const resResults = await getAnimeSearch(jikanQuery);

  const mangaQuery = rawQuery.replace("_", "+").split("page=")[0];
  const skip = page * 12 - 12;
  const resManga = await getManga(mangaQuery, skip);

  return {
    props: {
      results: resResults.data ?? [],
      resultsManga: resManga ?? [],
      searchQuery,
    },
  };
};
