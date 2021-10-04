import { useEffect, useState } from "react"
import {useRouter} from 'next/router'
import { getCover } from "../../pages/api/mangadex";
import Axios from "axios";

const AnimeDetails = ({details})=>{

    const {id, description,title, status}= details.attributes

    const route = useRouter()

    const[image, setImage]= useState('')
    const[load, setLoad] = useState(false)

    const populate =async()=>{
        let cover

        details.relationships.forEach((e)=>{
            if(e.type === 'cover_art'){
                cover = e.id
            }
        })
        const res = await getCover(cover)

        const file = res.data.attributes.fileName
        setImage(`https://uploads.mangadex.org/covers/${details.id}/${file}`)
    }
    
    useEffect(()=>{
        populate()
    },[route.query.id])


    return(
        <div style={{width:'70%', marginLeft:'20%', display:'block'}}>
            <section style={{marginTop:'3%'}}>
                <h1>{title.en}</h1>
                <div style={{display:'grid', gridTemplateColumns:'1fr 1fr'}}>
                    <img  src={image} alt='Anime Poster' style={{width:'60%'}} />
                    <aside>
                        <p>{status}</p>
                    </aside>
                </div>
                
            </section>
            <section style={{marginTop:'3%'}}>
                <h4>Synopsis</h4>
                <p>{description.en}</p>
            </section>
        </div>
    )
}

export default AnimeDetails

export const getServerSideProps = async(context)=>{
    const id = context.query.mangaId
    const client = Axios.create({baseURL:'https://api.mangadex.org/'})
    const res = await client.get(`manga/${id}`)
return{
    props:{
        details:res.data.data
    }
}

}