import Link from "next/dist/client/link"
import Image from 'next/image'
import { useEffect, useState } from "react"
import axios from "axios"
import { getCover } from "../../pages/api/mangadex";
import { Loader } from "../ResponseHandlers"


const MangaSearchCard =(props)=>{
    const{id, rating} = props.man
    const client = axios.create({baseURL:'https://api.mangadex.org/manga'})

    const[manga, setManga] = useState({})
    const[image, setImage] = useState('')


    const populate =async(id, att)=>{
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

    useEffect(async()=>{
        const inf = await client.get(`/${id}`)
        setManga(inf.data.data)
        populate(id,inf.data.data.relationships)
    },[])



    return(
        <div className="card mb-3" style={{maxWidth:'100%'}}>
        <div className="row g-0">
            <div className="col-md-4" width='100%' height='100%'>
            { image ? <Image data-testid="img" src={image} height='300%' width='250%' className="card-img-top" alt="Anime poster"/> : <Loader/>}                        </div>
            <div className="col-md-8">
            <div className="card-body">
                <h5 className="card-title">{manga?.attributes?.title.en}</h5>
                <p className="card-text">{rating.bayesian}/10</p>
                <p className="card-text" style={{height:'90px', overflow:'hidden'}}> {manga?.attributes?.description.en}</p>
                <p className="card-text"><small className="text-muted"> {manga?.attributes?.publicationDemographic}</small></p>
                <Link href={`/manga/${id}`} passHref>
                    <a  className="btn btn-primary" style={{position:'revert'}}>Details</a>
                </Link>
            </div>
            </div>
        </div>
        </div>
    )
}

export default MangaSearchCard