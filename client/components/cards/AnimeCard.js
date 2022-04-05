import React from "react";
import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from "react";

const AnimeCard =(props)=>{
    const {image, name, date, id, darkMode} = props

    const [bg, setBg] = useState('white')
    const [color, setColor] = useState('black')

    useEffect(()=>{
        if(darkMode){
            setBg('black')
            setColor('white')
          }else if(!darkMode){
            setColor('black')
            setBg('white')
          }
    },[darkMode])


    return(
        <Link href={`/anime/${id}`} passHref>
            <div id={id} data-testid="container" className="animeCard bg-white">
                <Image data-testid="image" layout="responsive" borderRadius='1.5rem 1.5rem 1.5rem 1.5rem' src={image} width='100px' quality={100} height='100%' className="card-img-top" alt="Anime poster"/>
                <div className="card-body">
                    <h6 className="card-title" style={{maxHeight:'60%', overflow:'hide', color:color}}>{name}</h6>
                    {date ? <p style={{color:color}} className="card-text">Realease Date: {date}</p> :  <p style={{color:color}} className="card-text">Realease Date: Unknown</p>}
                </div>
            </div>
        </Link>
    )
}

export default AnimeCard