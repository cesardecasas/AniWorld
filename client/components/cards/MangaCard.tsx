import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { MangadexRelationship } from "../../types";
import { Loader } from "../ResponseHandlers";

interface MangaCardProps {
  name: string;
  att: MangadexRelationship[];
  id: string;
}

const MangaCard = ({ name, att, id }: MangaCardProps) => {
  const [image, setImage] = useState("");

  const populate = async (id: string) => {
    let file: string | undefined;
    if (!att || !Array.isArray(att)) return;
    att.forEach((e) => {
      if (e.attributes) {
        file = e.attributes.fileName as string;
      }
    });

    if (file) setImage(`https://uploads.mangadex.org/covers/${id}/${file}.512.jpg`);
  };

  useEffect(() => {
    populate(id);
  }, []);

  return (
    <Link href={`/manga/${id}`} passHref>
      <div className="mangaCard card">
        {image ? (
          <Image
            data-testid="img"
            src={image}
            layout="responsive"
            width={300}
            height={450}
            className="card-img-top manga-cover"
            alt="Manga cover"
          />
        ) : (
          <Loader />
        )}
      </div>
    </Link>
  );
};

export default MangaCard;
