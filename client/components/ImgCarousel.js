import Carousel from "react-bootstrap/Carousel";
import {useState} from 'react'
import Link from "next/link";

const ImgCarousel =({carousel})=>{
    const [index, setIndex] = useState(0);

    const handleSelect = (selectedIndex, e) => {
      setIndex(selectedIndex);
    };
  
    return (
      <Carousel activeIndex={index} onSelect={handleSelect} style={{width:'80%', gridColumn:'1', gridRow:'1'}}>

          {carousel?.map((item,i)=>(
              <Carousel.Item key={i}>
                  <Link href={`/anime/${item.mal_id}`}>
              <img
                className="d-block w-100"
                src={item.image_url}
                alt="First slide"
                height='600px'
              />
              </Link>
              <Carousel.Caption>
              <h3 style={{backgroundColor:'rgba(182, 182, 182, .4)'}}>{item.title}</h3>
            </Carousel.Caption>
            </Carousel.Item>
          ))}
      </Carousel>
    
    )
}

export default ImgCarousel