import { Container, Row, Col } from "react-bootstrap"
import axios from 'axios'
import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import MangaSearchCard from "../../components/cards/MangaSearchCard"
import SearchCard from '../..//components/cards/SearchCard'

const MyList = ({list, currentUser, manga})=>{

    const Jinkan = axios.create({baseURL:'https://api.jikan.moe/v3/'})
    const MangaDex = axios.create({baseURL:'https://api.mangadex.org/'})
    const router = useRouter()

    const [MangaList, setML] = useState([])
    const [AnimeList, setAL] = useState([])

    const populate=()=>{
        if(list?.anime_id?.length !== AnimeList.length){
            list.anime_id.forEach(async(el)=>{
                const an = await Jinkan.get(`anime/${el}`)
                setAL([...AnimeList, an.data])
            })
        }
    
        setML(manga)
    }


    useEffect(()=>{
        if(currentUser === null){
            router.push('/')
        }
        populate()
    },[])


    return(
        <div>
            <Container>
                {!MangaList[0] && !AnimeList[0] ? <h2>Need Something to Watch/Read? Click Here</h2> :<></>}
                {MangaList[0] ? <h3>Manga</h3> : <></>}
                {MangaList?.map((el, i)=><MangaSearchCard key={i} man={el}/>)}
                {AnimeList[0] ? <h3>Anime</h3> :<></>}
                {AnimeList?.map((el, i)=><SearchCard score={el.score} synopsis={el.synopsis} key={i} id={el.mal_id} name={el.title} image={el.image_url} rated={el.rated} episodes={el.episodes}  />)}


            </Container>
        </div>
    )
}

export default MyList

export const getServerSideProps =async(context)=>{
    const AniAPi = axios.create({baseURL:'https://aniworld-api.herokuapp.com'})
    const MangaDex = axios.create({baseURL:'https://api.mangadex.org/'})



    const id = context.query.id

    const res = await AniAPi.get(`/api/list/get/${id}`)

    let str = ''
    res.data.manga_id.forEach((el)=>{
        str = str + '&ids[]='+el
    })
    const an = await MangaDex.get(`manga?includes[]=cover_art&${str}`)
    
    


    return{
        props:{
            list:res.data, 
            manga:an.data.data
        }
    }
}