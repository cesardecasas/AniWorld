import React from "react";
import Link from 'next/link'

const MangaCard =(props)=>{
    const {image, name, date, id} = props


    return(
        <div id={id} className="card" style={{width: "93%", marginTop:'4%', marginLeft:'2%', height:'90%', boxShadow:'12px 12px 2px 1px rgba(0, 0, 255, .2)'}}>
            <img src={image} style={{width:'100%', maxHeight:'50%'}} className="card-img-top" alt="Anime poster"/>
            <div className="card-body">
                <h5 className="card-title" style={{maxHeight:'60%', overflow:'clip'}}>{name}</h5>
                {date ? <p className="card-text">Realease Date: {date}</p> :  <p className="card-text">Realease Date: Uknown</p>}
                <Link href={`/manga/${id}`} passHref>
                    <a  className="btn btn-primary" style={{position:'revert'}}>Details</a>
                </Link>
            </div>
        </div>
    )
}

export default MangaCard