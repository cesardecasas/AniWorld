import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import type { MangadexManga } from "../../types";
import styles from "../../styles/Search.module.css";

interface MangaSearchCardProps {
  man: MangadexManga;
}

const MangaSearchCard = ({ man }: MangaSearchCardProps) => {
  const { id, relationships, attributes } = man;
  const [image, setImage] = useState("");

  useEffect(() => {
    const coverRel = relationships.find((r) => r.type === "cover_art");
    const fileName = coverRel?.attributes?.fileName as string | undefined;
    if (fileName) {
      setImage(`https://uploads.mangadex.org/covers/${id}/${fileName}.512.jpg`);
    }
  }, [id]);

  const title =
    attributes.title.en || Object.values(attributes.title)[0] || "";

  return (
    <Link href={`/manga/${id}`} className={styles.card}>
      <div className={styles.imgWrap}>
        {image && (
          <Image
            data-testid="img"
            src={image}
            alt={title}
            fill
            style={{ objectFit: "cover" }}
          />
        )}
      </div>
      <div className={styles.cardInfo}>
        <p className={styles.cardTitle} data-testid="title">
          {title}
        </p>
        {attributes.status && (
          <p className={styles.cardMeta}>{attributes.status}</p>
        )}
      </div>
    </Link>
  );
};

export default MangaSearchCard;
