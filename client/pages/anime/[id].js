import { useEffect, useState } from "react"
import {getDetails, getAnime, getSong} from '../api/fetch'
import router, {useRouter} from 'next/router'
import { Loader, ErrorCard} from '../../components/ResponseHandlers'
import SongCard from "../../components/SongCard"


const AnimeDetails = ()=>{

    const route = useRouter()

    const[details, setDetails] = useState({})
    const[aniDetails, setAniDetails] = useState({})
    const[songList,setSongList]= useState([])
    const[error, setError]= useState(false)
    const[load, setLoad] = useState(false)

    const fetchDetails =async(id)=>{
        if(!id){
            router.push('/')
            return
        }
        const res = await getDetails(id)
        const aniRes = await getAnime(res.mal_id)
        setDetails(res)
        setAniDetails(aniRes.data.documents[0])
    }

    const fetchSongs = async()=>{
            setLoad(!load)
            const res = await getSong(aniDetails.id)
            if(res.message === "Zero songs found")(
                setError(!error)
            )
            setSongList(res)
            setLoad(false)
       
        
    }
    
    useEffect(()=>{
        fetchDetails(route.query.id)
    },[])


    return(
        <div style={{width:'70%', marginLeft:'20%', display:'block'}}>
            <section style={{marginTop:'3%'}}>
                <h1>{details.title}</h1>
                <div style={{display:'grid', gridTemplateColumns:'1fr 1fr'}}>
                    <img  src={details.image_url} alt='Anime Poster' style={{width:'60%'}} />
                    <aside>
                        {details.rating === 'None' ? <p>Rating: To Be Confirmed</p> : <p>Rating: {details.rating}</p>}
                        {details.premiered ?  <p>Premiered on: {details.premiered}</p> :<p>Premiered on: To Be Confirmed</p>}
                        {details.airing ? <p>On emission</p> : details.status === 'Not yet aired' ? <p>Upcoming Realease</p> : <p>Finished</p>}
                    </aside>
                </div>
                
            </section>
            <section style={{marginTop:'3%'}}>
                <h4>Synopsis</h4>
                <p>{details.synopsis}</p>
            </section>
            <section>
                <h4>Trailer</h4>
                {details.trailer_url ? <iframe width="75%" height="315" src={details.trailer_url} title="YouTube video player" frameBorder="0" allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe> : <p>No trailer Available</p>}
            </section>
            
            <div>
                {songList.data ? <p>Here are the songs preview found</p> :  error ? <p></p> : <p>Look for songs</p>}
                {songList.data ? <div style={{display:'grid', gridTemplateColumns:'1fr 1fr'}}> 
                                    {songList.data.documents.map((song, i)=><SongCard key={i} spotify={song.open_spotify_url} title={song.title} url={song.preview_url} id={i} album={song.album} artist={song.artist} />)}
                                </div>:
                                load ?  <Loader/> : error ? <ErrorCard msg='Songs'/> :
                                        <button className='btn btn-dark btn-lg' onClick={fetchSongs}> Search</button>}
            </div>
        </div>
    )
}

export default AnimeDetails