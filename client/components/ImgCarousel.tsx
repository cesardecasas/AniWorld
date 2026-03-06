import Carousel from "react-bootstrap/Carousel";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { JikanAnime } from "../types";

interface ImgCarouselProps {
  carousel: JikanAnime[];
}

const ImgCarousel = ({ carousel }: ImgCarouselProps) => {
  const [index, setIndex] = useState(0);
  const IMG_WIDTH = 1200;
  const IMG_HEIGHT = 600;

  const handleSelect = (selectedIndex: number) => {
    setIndex(selectedIndex);
  };

  return (
    <Carousel
      activeIndex={index}
      onSelect={handleSelect}
      style={{ width: "60%", gridColumn: "1", gridRow: "1", marginLeft: "15%" }}
    >
      {carousel?.map((item, i) => (
        <Carousel.Item key={i}>
          <Link href={`/anime/${item.mal_id}`}>
            <Image
              className="d-block w-100 imgCarousel"
              src={item.images.jpg.large_image_url}
              alt={item.title}
              width={IMG_WIDTH}
              height={IMG_HEIGHT}
              layout="responsive"
            />
          </Link>
          <Carousel.Caption>
            <h4
              className="CarouselTitle"
              style={{ backgroundColor: "rgba(182, 182, 182, .4)" }}
            >
              {item.title}
            </h4>
          </Carousel.Caption>
        </Carousel.Item>
      ))}
    </Carousel>
  );
};

export default ImgCarousel;
