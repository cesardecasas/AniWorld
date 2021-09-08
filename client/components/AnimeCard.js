import React from "react";
import Link from 'next/link'

const AnimeCard =(props)=>{
    const {image, name, date, id} = props


    return(
        <div className="card" style={{width: "17rem", marginTop:'4%', marginLeft:'2%', height:'26rem', boxShadow:'12px 12px 2px 1px rgba(0, 0, 255, .2)'}}>
            <img src={image} style={{width:'17rem', maxHeight:'50%'}} className="card-img-top" alt="Anime poster"/>
            <div className="card-body">
                <h5 className="card-title" style={{maxHeight:'60%', overflow:'clip'}}>{name}</h5>
                <p className="card-text">Realease Date: {date ? date : <p>Uknown</p>}</p>
                <Link href={`/anime/${id}`} passHref>
                    <a  className="btn btn-primary" style={{position:'revert'}}>Details</a>
                </Link>
            </div>
        </div>
    )
}

export default AnimeCard