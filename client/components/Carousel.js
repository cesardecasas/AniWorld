import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import AnimeCard from "./AnimeCard";
import MangaCard from "./MangaCard";

const CarouselComponent =({animes, type})=>{

    const responsive = {
        desktop: {
          breakpoint: { max: 3000, min: 1024 },
          items: 3,
          slidesToSlide: 3 // optional, default to 1.
        },
        tablet: {
          breakpoint: { max: 1024, min: 464 },
          items: 2,
          slidesToSlide: 2 // optional, default to 1.
        },
        mobile: {
          breakpoint: { max: 464, min: 0 },
          items: 1,
          slidesToSlide: 1 // optional, default to 1.
        }
      };

    return(
        <Carousel
            additionalTransfrom={1}
            slidesToSlide={1}
            swipeable={true}
            draggable={true}
            showDots={true}
            responsive={responsive}
            ssr={true}
            autoPlaySpeed={1000}
            customTransition="all .5"
            transitionDuration={500}
            containerClass="carousel-container"
            removeArrowOnDeviceType={["tablet", "mobile"]}
            dotListClass="custom-dot-list-style"
            itemClass="carousel-item-padding-40-px"
            >
                {type ==='Manga' ? 
                animes.map((anime, i)=> <MangaCard key={i} name={anime.title} image={anime.image_url} date={anime.start_date} id={anime.mal_id}/>)
                : 
                animes.map((anime, i)=> <AnimeCard key={i} name={anime.title} image={anime.image_url} date={anime.start_date} id={anime.mal_id}/>)} 
        </Carousel>
    )
}

export default CarouselComponent


