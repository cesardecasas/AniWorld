import Link from "next/link";
import type { RelatedAnime } from "../../types";

interface RelatedCardProps {
  card: RelatedAnime;
  type?: string;
}

const RelatedCard = ({ card, type }: RelatedCardProps) => {
  return (
    <Link href={`/${card.type}/${card.mal_id}`} style={{ textDecoration: "none" }}>
      <div className="relatedCard">
        {type && <span className="relatedCardType">{type}</span>}
        <p className="relatedCardName">{card.name}</p>
      </div>
    </Link>
  );
};

export default RelatedCard;
