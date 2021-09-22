import React from "react";
import Link from 'next/link'
import Image from 'next/image'

const AnimeCard =(props)=>{
    const {image, name, date, id} = props


    return(
        <Link href={`/anime/${id}`} passHref>
            <div id={id} className="animeCard">
                <Image layout="responsive" src={`${image}`} width='100px' quality={100} height='100%' className="card-img-top" alt="Anime poster"/>
                <div className="card-body">
                    <h6 className="card-title" style={{maxHeight:'60%', overflow:'clip'}}>{name}</h6>
                    {date ? <p className="card-text">Realease Date: {date}</p> :  <p className="card-text">Realease Date: Uknown</p>}
                </div>
            </div>
        </Link>
    )
}

export default AnimeCard