import { useEffect, useState } from "react"
import {useRouter} from 'next/router'
import { getCover } from "../../pages/api/mangadex";
import Axios from "axios";
import Link from 'next/link'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Image from 'next/image'
import Button from 'react-bootstrap/Button'
import Dropdown from "react-bootstrap/Dropdown";

const AnimeDetails = ({details,chapters, cover, currentUser, authenticated})=>{

    const {year, description,title, status, publicationDemographic}= details.attributes

    const route = useRouter()

    const[image, setImage]= useState('')
    const[load, setLoad] = useState(false)
    const[userList, setList] = useState({})
    const[lang, setLang] = useState([])
    const[chapterArr, setChapterArr]=useState([])
    const[currentLang, setCurrentLang] = useState('en')

    const aniapi = Axios.create({baseURL:'https://aniworld-api.herokuapp.com'})


    const populate =async()=>{
        const file = cover?.attributes?.fileName
        setImage(`https://uploads.mangadex.org/covers/${details.id}/${file}.512.jpg`)
        let arr = []
        chapters.forEach((e, i)=>{
            if(!lang.includes(e.attributes.translatedLanguage)){
                arr.push(e.attributes.translatedLanguage)
                if(i === chapters.length - 1){
                    setLang([...new Set(arr)])

                }
            }
        })
        const n = chapters.filter(el => el.attributes.translatedLanguage === currentLang)
        setChapterArr(n)
    }

    const missing = 'Chapter #'

    const addManga = async()=>{
        const body = {
            type:'manga',
            newItem:`${details.id}`
        }
        const item =  await aniapi.put(`/api/list/update/${currentUser.id}`, body)
        setList(item.data)
    }

    const removeManga = async()=>{
        const arr = userList.anime_id.splice(1, `${details.id}`)
        const body = {
            type:'manga',
            arr:arr
        }
        const item =  await aniapi.put(`/api/list/remove/${currentUser.id}`, body)
        setList(item.data[1][0])
    }
    
    useEffect(async()=>{
        populate()
        if(currentUser?.id){
            const userList = await aniapi.get(`/api/list/get/${currentUser.id}`)
            setList(userList.data)
        }
    },[route.query.id, currentLang])


    return(
        <div className='detailsBody' style={{width:'70%', marginLeft:'20%', display:'block'}}>
            <section style={{marginTop:'3%'}}>
                <h1>{title.en}</h1>
                    <Row xs={1} sm={1} md={2}>
                        <Col>
                            <img  src={image} width='90%' height='90%' quality={100} layout='responsive'  alt='Manga Poster'  />
                            {authenticated ? userList?.manga_id?.includes(`${details.id}`) ? <Button style={{marginTop:'3%'}} variant='dark' onClick={()=>removeManga()}>Remove from List</Button>  : <Button style={{marginTop:'3%'}} variant='dark' onClick={()=>addManga()}>Add to List</Button> : <></>}

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
            {lang.length > 1 ? <Dropdown>
                <Dropdown.Toggle variant="dark" id="dropdown-basic" style={{margin:'3%'}}>
                    Language: {currentLang}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                    {lang.map((el, i)=><Dropdown.Item key={i} onClick={()=>setCurrentLang(el)}>{el}</Dropdown.Item>)}
                </Dropdown.Menu>
            </Dropdown> : <></>}
            <section style={{}}>
                {chapterArr?.sort((a,b)=> a.attributes.chapter - b.attributes.chapter).map((chap,i)=><div key={i} className='chapters'><Link  href={`/chapter/${chap.id}`} passHref><p style={{border:'2px solid black', borderRadius:'1.5rem'}}>{chap.attributes.chapter}.-{chap.attributes.title ? chap.attributes.title :  missing}{ chap.attributes.title ? <></> : chap.attributes.chapter }</p></Link></div>)}

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