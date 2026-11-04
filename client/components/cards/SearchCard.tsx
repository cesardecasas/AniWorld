import Link from "next/link";
import Image from "next/image";
import styles from "../../styles/Search.module.css";

interface SearchCardProps {
  name: string;
  image: string | null;
  format: string | null;
  episodes: number | null;
  id: string;
  score: number | null;
}

const SearchCard = ({ name, image, format, episodes, id, score }: SearchCardProps) => {
  const meta = [format, episodes && `${episodes} eps`].filter(Boolean).join(" · ");

  return (
    <Link href={`/anime/${id}`} className={styles.card}>
      <div className={styles.imgWrap}>
        {image && (
          <Image
            src={image}
            alt={name}
            fill
            style={{ objectFit: "cover" }}
          />
        )}
        {score > 0 && (
          <span className={styles.scoreBadge}>★ {score.toFixed(1)}</span>
        )}
      </div>
      <div className={styles.cardInfo}>
        <p className={styles.cardTitle}>{name}</p>
        {meta && <p className={styles.cardMeta}>{meta}</p>}
      </div>
    </Link>
  );
};

export default SearchCard;
