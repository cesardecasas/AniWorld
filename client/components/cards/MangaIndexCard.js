import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import {Loader} from '../ResponseHandlers'


const MangaIndexCard =({id, relationships, att})=>{

    const[manga, setManga] = useState({})
    const[image, setImage] = useState('')



    const populate =async(id, att)=>{
        let file
        att.forEach((e)=>{
            if(e.attributes){
                file = e.attributes.fileName
            }
        })
        setImage(`https://uploads.mangadex.org/covers/${id}/${file}.512.jpg`)
    }

    useEffect(()=>{
        populate(id, relationships)
    },[])


    return(
        <Link href={`/manga/${id}`} passHref>
            <div id={id} style={{backgroundColor:'white'}} data-testid="container" className="animeCard">
                {image ? <Image data-testid="image" layout="responsive" borderRadius='1.5rem 1.5rem 1.5rem 1.5rem' src={image} width='100px' quality={100} height='100%' className="card-img-top" alt="Anime poster"/>: <Loader/>}
                <div className="card-body">
                    <h6 className="card-title" style={{maxHeight:'60%', overflow:'hide'}}>{att.title.en}</h6>
                    {/* <p className="card-text" style={{height:'60px', overflow:'hide'}}>{att.description.en}</p> */}
                </div>
            </div>
        </Link>
    )
}

export default MangaIndexCard