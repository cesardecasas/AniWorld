import { useEffect, useState } from "react"
import {useRouter} from 'next/router'
import { getCover } from "../../pages/api/mangadex";
import Axios from "axios";
import Link from 'next/link'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Image from 'next/image'

const AnimeDetails = ({details,chapters, cover})=>{

    const {year, description,title, status, publicationDemographic}= details.attributes

    const route = useRouter()

    const[image, setImage]= useState('')
    const[load, setLoad] = useState(false)

    const populate =async()=>{
        const file = cover?.attributes?.fileName
        setImage(`https://uploads.mangadex.org/covers/${details.id}/${file}.512.jpg`)
    }

    const missing = 'Chapter #'
    
    useEffect(()=>{
        populate()
    },[route.query.id])


    return(
        <div className='detailsBody' style={{width:'70%', marginLeft:'20%', display:'block'}}>
            <section style={{marginTop:'3%'}}>
                <h1>{title.en}</h1>
                    <Row xs={1} sm={1} md={2}>
                        <Col>
                            <img  src={image} width='90%' height='90%' quality={100} layout='responsive'  alt='Manga Poster'  />
                        </Col>
                        <Col>
                            <aside style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', height:'30%', borderRadius:'1.5rem', gridColumn:'2', gridRow:'1', marginTop:'3%'}}>
                                    <div className='rating desc'>
                                        <p className='desc'>Status: {status}</p>
                                    </div>
                                    <div className='premiered desc'>
                                        <p className='desc'>Genre: {publicationDemographic}</p>
                                    </div>
                                    <div className='status desc'>     
                                        <p className='desc'>Realease year: {year}</p>                   
                                    </div>
                                </aside>
                        </Col>
                    </Row>                
            </section>
            <section style={{marginTop:'3%'}}>
                <h3>Synopsis</h3>
                <p>{description.en}</p>
            </section>
            <h3>Chapter List</h3>
            <section style={{}}>
                {chapters?.sort((a,b)=> a.attributes.chapter - b.attributes.chapter).map((chap,i)=><div key={i} className='chapters'><Link  href={`/chapter/${chap.id}`} passHref><p style={{border:'2px solid black', borderRadius:'1.5rem'}}>{chap.attributes.chapter}.-{chap.attributes.title ? chap.attributes.title :  missing}{ chap.attributes.title ? <></> : chap.attributes.chapter }</p></Link></div>)}

            </section>
        </div>
    )
}

export default AnimeDetails

export const getServerSideProps = async(context)=>{
    const id = context.query.mangaId
    const client = Axios.create({baseURL:'https://api.mangadex.org/'})
    
    

    const res = await client.get(`manga/${id}`)
    let cover
    res.data.data.relationships.forEach((e)=>{
        if(e.type === 'cover_art'){
            cover = e.id
        }
    })
    const resCover = await getCover(cover)
    const chapters = await client.get(`manga/${id}/feed`)


return{
    props:{
        details:res.data.data,
        chapters:chapters.data.data,
        cover:resCover.data
    }
}

}