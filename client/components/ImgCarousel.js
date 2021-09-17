import Carousel from "react-bootstrap/Carousel";
import {useState} from 'react'
import Link from "next/link";

const ImgCarousel =({carousel})=>{
    const [index, setIndex] = useState(0);

    const handleSelect = (selectedIndex, e) => {
      setIndex(selectedIndex);
    };
  
    return (
      <Carousel activeIndex={index} onSelect={handleSelect} style={{width:'70%', marginLeft:'5%'}}>

          {carousel?.map((item,i)=>(
              <Carousel.Item key={i}>
                  <Link href={`/anime/${item.mal_id}`}>
              <img
                className="d-block w-100"
                src={item.image_url}
                alt="First slide"
                height='500px'
              />
              </Link>
            </Carousel.Item>
          ))}
      </Carousel>
    
    )
}

export default ImgCarousel