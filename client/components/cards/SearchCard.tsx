import Link from "next/link";
import Image from "next/image";

interface SearchCardProps {
  name: string;
  image: string;
  rated: string;
  episodes: number;
  id: number;
  synopsis: string;
  score: number;
}

const SearchCard = ({ name, image, rated, episodes, id, synopsis, score }: SearchCardProps) => {
  return (
    <div className="card mb-3" style={{ maxWidth: "100%" }}>
      <div className="row g-0">
        <div className="col-md-4" style={{ width: "100%", height: "100%" }}>
          <Image
            src={image}
            width={400}
            height={510}
            className="img-fluid rounded-start"
            alt="Anime poster"
          />
        </div>
        <div className="col-md-8">
          <div className="card-body">
            <h5 className="card-title">{name}</h5>
            <p className="card-text">Episodes: {episodes}</p>
            <p className="card-text">{score}/10</p>
            <p className="card-text"> {synopsis}</p>
            <p className="card-text">
              <small className="text-muted">Rated: {rated}</small>
            </p>
            <Link href={`/anime/${id}`} className="btn btn-dark" style={{ position: "revert" }}>
              Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchCard;
