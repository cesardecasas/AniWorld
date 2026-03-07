import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { MangadexMangaAttributes, MangadexRelationship } from "../../types";
import { Loader } from "../ResponseHandlers";

interface MangaIndexCardProps {
  id: string;
  relationships: MangadexRelationship[];
  att: MangadexMangaAttributes;
}

const MangaIndexCard = ({ id, relationships, att }: MangaIndexCardProps) => {
  const [image, setImage] = useState("");

  const populate = async (id: string, att: MangadexRelationship[]) => {
    let file: string | undefined;
    att.forEach((e) => {
      if (e.attributes) {
        file = e.attributes.fileName as string;
      }
    });
    setImage(`https://uploads.mangadex.org/covers/${id}/${file}.512.jpg`);
  };

  useEffect(() => {
    populate(id, relationships);
  }, []);

  return (
    <Link href={`/manga/${id}`} passHref>
      <div
        id={id}
        data-testid="container"
        className="animeCard"
      >
        {image ? (
          <Image
            data-testid="image"
            layout="responsive"
            src={image}
            width={200}
            height={300}
            quality={100}
            className="card-img-top"
            alt="Manga poster"
          />
        ) : (
          <Loader />
        )}
        <div className="card-body">
          <h6 className="card-title" style={{ maxHeight: "60%", overflow: "hide" }}>
            {att.title.en}
          </h6>
        </div>
      </div>
    </Link>
  );
};

export default MangaIndexCard;
