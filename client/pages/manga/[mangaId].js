import { useEffect, useState } from "react"
import {useRouter} from 'next/router'
import { getCover } from "../../pages/api/mangadex";
import Axios from "axios";
import Link from 'next/link'

const AnimeDetails = ({details,chapters})=>{

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
        setImage(`https://uploads.mangadex.org/covers/${details.id}/${file}.512.jpg`)
    }

    const missing = 'Chapter #'
    
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
                <h3>Synopsis</h3>
                <p>{description.en}</p>
            </section>
            <h3>Chapter List</h3>
            <section style={{}}>
                {chapters?.sort((a,b)=> a.attributes.chapter - b.attributes.chapter).map((chap,i)=><div key={i}><Link  href={`/chapter/${chap.id}`} passHref><p>{chap.attributes.chapter}.-{chap.attributes.title ? chap.attributes.title :  missing}{ chap.attributes.title ? <></> : chap.attributes.chapter }</p></Link></div>)}

            </section>
        </div>
    )
}

export default AnimeDetails

export const getServerSideProps = async(context)=>{
    const id = context.query.mangaId
    const client = Axios.create({baseURL:'https://api.mangadex.org/'})
    const res = await client.get(`manga/${id}`)
    const chapters = await client.get(`manga/${id}/feed`)

return{
    props:{
        details:res.data.data,
        chapters:chapters.data.data
    }
}

}