import Carousel from "react-bootstrap/Carousel";
import {useEffect, useState} from 'react'
import Link from "next/link";
import Image from 'next/image'
import useWindowDimensions from "./customHooks/useWindow";

const ImgCarousel =({carousel})=>{
    const [index, setIndex] = useState(0);
    const [imgWidth, setWidth] = useState('500%');
    const [imgHeight, setHeight] = useState('600px')

    const handleSelect = (selectedIndex, e) => {
      setIndex(selectedIndex);
    };

    
  
    // useEffect(()=>{
    //   if(window.innerWidth < 480){
    //     setWidth('600%')
    //     setHeight('650px')
    //   }else if(window.innerWidth > 480 && window.innerWidth > 770){
    //     setWidth('650%')
    //     setHeight('700px')
    //   }else if(window.innerWidth > 770){
    //     setWidth('500%')
    //     setHeight('600px')
    //   }
    // },[window.innerWidth])

    return (
      <Carousel activeIndex={index} onSelect={handleSelect} style={{width:'60%', gridColumn:'1', gridRow:'1', marginLeft:'15%'}}>

          {carousel?.map((item,i)=>(
              <Carousel.Item key={i}>
                  <Link href={`/anime/${item.mal_id}`}>
              <Image
                className="d-block w-100 imgCarousel"
                src={item.image_url}
                alt="First slide"
                height={imgHeight}
                width={imgWidth}
                layout="responsive"
              />
              </Link>
              <Carousel.Caption>
              <h4 className='CarouselTitle' style={{backgroundColor:'rgba(182, 182, 182, .4)',}}>{item.title}</h4>
            </Carousel.Caption>
            </Carousel.Item>
          ))}
      </Carousel>
    
    )
}

export default ImgCarousel