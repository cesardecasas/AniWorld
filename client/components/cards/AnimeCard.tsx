import React from "react";
import Link from "next/link";
import Image from "next/image";

interface AnimeCardProps {
  image: string;
  name: string;
  date: string;
  id: number;
}

const AnimeCard = ({ image, name, date, id }: AnimeCardProps) => {
  return (
    <Link href={`/anime/${id}`} passHref>
      <div id={String(id)} data-testid="container" className="animeCard">
        <Image
          data-testid="image"
          layout="responsive"
          src={image}
          width={200}
          height={300}
          quality={100}
          className="card-img-top"
          alt="Anime poster"
        />
        <div className="card-body">
          <h6 className="card-title" style={{ maxHeight: "60%", overflow: "hidden" }}>
            {name}
          </h6>
          <p className="card-text">
            Release Date: {date || "Unknown"}
          </p>
        </div>
      </div>
    </Link>
  );
};

export default AnimeCard;
