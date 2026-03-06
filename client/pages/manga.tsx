import axios from "axios";
import MangaCard from "../components/cards/MangaCard";
import Container from "react-bootstrap/Container";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Button from "react-bootstrap/Button";
import { useState } from "react";
import MangaSearchCard from "../components/cards/MangaSearchCard";
import type { GetStaticProps } from "next";
import type { MangadexManga } from "../types";

interface MangaPageData {
  data: MangadexManga[];
}

interface MangaProps {
  manga: MangaPageData;
  recent: MangaPageData;
}

const Manga = ({ manga, recent }: MangaProps) => {
  const [random, setRandom] = useState<MangadexManga | null>(null);
  const client = axios.create({ baseURL: "https://api.mangadex.org/" });

  const getRandomManga = async () => {
    try {
      const res = await client.get("manga/random?includes[]=cover_art");
      setRandom(res.data.data);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>
      <Container className="page-container">
        <Row xs={1} sm={1} md={2}>
          <Col>
            <h2 style={{ textAlign: "center" }}>Most Popular Manga</h2>
            <Row xs={2} sm={2} md={2}>
              {manga?.data?.map((m, i) => (
                <Col key={i}>
                  <MangaCard
                    name={m.attributes.title.en}
                    id={m.id}
                    att={m.relationships}
                  />
                </Col>
              ))}
            </Row>
          </Col>
          <Col>
            <h2 style={{ textAlign: "center" }}>This Year Released</h2>
            <Row xs={2} sm={2} md={2}>
              {recent?.data?.map((el, i) => (
                <Col key={i}>
                  <MangaCard
                    name={el.attributes.title.en}
                    id={el.id}
                    att={el.relationships}
                  />
                </Col>
              ))}
            </Row>
          </Col>
        </Row>

        <p>Unsure what to read? find a random manga</p>
        <Button
          variant="dark"
          style={{ marginBottom: "3%" }}
          onClick={() => getRandomManga()}
        >
          Find!
        </Button>
        {random?.attributes ? <MangaSearchCard man={random} /> : <></>}
      </Container>
    </div>
  );
};

export default Manga;

export const getStaticProps: GetStaticProps = async () => {
  const client = axios.create({ baseURL: "https://api.mangadex.org/" });
  const d = new Date();
  const year = d.getFullYear();

  const res = await client.get(
    "manga?limit=4&includes[]=cover_art&originalLanguage[]=en&availableTranslatedLanguage[]=en"
  );
  const nRes = await client.get(
    `manga?limit=4&offset=0&year=${year}&includes[]=cover_art&originalLanguage[]=en&availableTranslatedLanguage[]=en`
  );

  return {
    props: {
      manga: res.data,
      recent: nRes.data,
    },
    revalidate: 3600,
  };
};
