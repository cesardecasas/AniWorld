import Link from "next/link";
import type { AnimeRelation } from "../../types";

interface RelatedCardProps {
  card: AnimeRelation;
}

const RelatedCard = ({ card }: RelatedCardProps) => {
  // Manga pages are keyed by MangaDex ids, so related manga open a title search instead
  const href =
    card.type === "anime"
      ? `/anime/${card.id}`
      : `/search/anime=${encodeURIComponent(card.title.replace(/\s+/g, "_"))}&page=1`;

  return (
    <Link href={href} style={{ textDecoration: "none" }}>
      <div className="relatedCard">
        <span className="relatedCardType">{card.relation}</span>
        <p className="relatedCardName">{card.title}</p>
      </div>
    </Link>
  );
};

export default RelatedCard;
