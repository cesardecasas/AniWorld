import Link from "next/dist/client/link"
import Image from 'next/image'
import { useEffect, useState } from "react"
import { Loader } from "../ResponseHandlers"


const MangaSearchCard =(props)=>{
    console.log(props)
    const {id, relationships} = props.man

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
        setManga(props.man)
        populate(id, relationships)
    },[])



    return(
        <div className="card mb-3" style={{maxWidth:'100%'}}>
        <div className="row g-0">
            <div className="col-md-4" width='100%' height='100%'>
            { image ? <Image data-testid="img" src={image} height='300%' width='250%' className="card-img-top" alt="Anime poster"/> : <Loader/>}                        </div>
            <div className="col-md-8">
            <div className="card-body">
                <h5 className="card-title" data-testid="title">{manga?.attributes?.title.en}</h5>
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