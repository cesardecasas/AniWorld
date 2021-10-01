import React, { useEffect, useState } from "react";
import Link from 'next/link'
import Image from 'next/image'
import { getCover } from "../../pages/api/mangadex";

const MangaCard =(props)=>{
    const {name,att, id} = props
    const [image, setImage] = useState('')
    
    const populate =async(id)=>{
        let cover 
        att.forEach((e)=>{
            if(e.type === 'cover_art'){
                cover = e.id
            }
        })
        const res = await getCover(cover)
        const file = res.data.attributes.fileName
        setImage(`https://uploads.mangadex.org/covers/${id}/${file}`)
    }


    useEffect(()=>{
        populate(id)
    },[])

    return(
        <Link href={`/manga/${id}`} passHref>
            <div className="card" style={{width: "93%", marginTop:'5%', marginLeft:'2%', height:'80%', boxShadow:'12px 12px 2px 1px rgba(0, 0, 255, .2)'}}>
                { image ? <Image src={image} height='300%' width='150%' className="card-img-top" alt="Anime poster"/> : <></>}            
            </div>
        </Link>
    )
}

export default MangaCard