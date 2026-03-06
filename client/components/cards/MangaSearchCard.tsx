import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import type { MangadexManga } from "../../types";
import { Loader } from "../ResponseHandlers";

interface MangaSearchCardProps {
  man: MangadexManga;
}

const MangaSearchCard = ({ man }: MangaSearchCardProps) => {
  const { id, relationships } = man;

  const [manga, setManga] = useState<MangadexManga | null>(null);
  const [image, setImage] = useState("");

  const populate = async (id: string, att: typeof relationships) => {
    let file: string | undefined;
    att.forEach((e) => {
      if (e.attributes) {
        file = e.attributes.fileName as string;
      }
    });

    setImage(`https://uploads.mangadex.org/covers/${id}/${file}.512.jpg`);
  };

  useEffect(() => {
    setManga(man);
    populate(id, relationships);
  }, [id]);

  return (
    <div className="manga-search-card card mb-3">
      <div className="manga-search-inner">
        <div className="manga-cover-col">
          {image ? (
            <Image
              data-testid="img"
              src={image}
              layout="responsive"
              width={300}
              height={450}
              className="card-img-top manga-search-cover"
              alt="Manga poster"
            />
          ) : (
            <Loader />
          )}
        </div>
        <div className="manga-info-col">
          <div className="card-body">
            <h5 className="card-title" data-testid="title">
              {manga?.attributes?.title?.en || String(manga?.attributes?.title ?? "")}
            </h5>
            <p className="card-text manga-description">
              {manga?.attributes?.description?.en || ""}
            </p>
            <p className="card-text">
              <small className="text-muted">
                {manga?.attributes?.publicationDemographic || ""}
              </small>
            </p>
            <Link href={`/manga/${id}`} className="btn details-btn">
              Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MangaSearchCard;
