import { Container, Row, Col } from "react-bootstrap"
import axios from 'axios'
import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import MangaSearchCard from "../../components/cards/MangaSearchCard"
import SearchCard from '../..//components/cards/SearchCard'

const MyList = ({list, manga, anime, currentUser})=>{

    const Jinkan = axios.create({baseURL:'https://api.jikan.moe/v3/'})
    const MangaDex = axios.create({baseURL:'https://api.mangadex.org/'})
    const router = useRouter()

    const [MangaList, setML] = useState([])
    const [AnimeList, setAL] = useState([])


    useEffect(()=>{
        if(currentUser === null){
            router.push('/')
        }

        if(list?.anime_id?.length > 0){
            list.anime_id.forEach(async(el)=>{
                const an = await Jinkan.get(`anime/${el}`)
                setAL([...AnimeList, an.data])
            })
        }
    
        if(list?.manga_id?.length > 0){
            list.manga_id.forEach(async(el)=>{
                const an = await MangaDex.get(`manga/${el}?includes[]=cover_art`)
                setML([...MangaList, an.data.data])
            })
        }
    },[])


    return(
        <div>
            <Container>
                {!MangaList[0] && !AnimeList[0] ? <h2>Need Something to Watch/Read? Click here</h2> :<></>}
                {MangaList[0] ? <h3>Manga</h3> : <></>}
                {MangaList[0] ? MangaList.map((el, i)=><MangaSearchCard key={i} man={el}  />) : <></>}
                {AnimeList[0] ? <h3>Anime</h3> :<></>}
                {AnimeList[0] ? AnimeList.map((el, i)=><SearchCard score={el.score} synopsis={el.synopsis} key={i} id={el.mal_id} name={el.title} image={el.image_url} rated={el.rated} episodes={el.episodes}  />) : <></>}


            </Container>
        </div>
    )
}

export default MyList

export const getServerSideProps =async(context)=>{
    const AniAPi = axios.create({baseURL:'https://aniworld-api.herokuapp.com'})


    const id = context.query.id


    const res = await AniAPi.get(`/api/list/get/${id}`)

    


    return{
        props:{
            list:res.data
        }
    }
}