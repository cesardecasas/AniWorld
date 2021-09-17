import { useEffect, useState } from "react"
import {getDetails, getAnime, getSong} from '../api/fetch'
import {useRouter} from 'next/router'
import { Loader, ErrorCard} from '../../components/ResponseHandlers'
import SongCard from "../../components/SongCard"
import RelatedCard from "../../components/RelatedCard"
import CommentBox from '../../components/CommentBox'

const AnimeDetails = ()=>{

    const route = useRouter()

    const[details, setDetails] = useState({})
    const[aniDetails, setAniDetails] = useState({})
    const[songList,setSongList]= useState([])
    const[error, setError]= useState(false)
    const[load, setLoad] = useState(false)

    const fetchDetails =async(id)=>{
        if(id){
            const res = await getDetails(id)
            const aniRes = await getAnime(res.mal_id)
            setDetails(res)
            if(aniRes.data.documents){
                setAniDetails(aniRes.data.documents[0])
            }
            
        }
        
    }

    const fetchSongs = async()=>{
            setLoad(!load)
            const res = await getSong(aniDetails.id)
            if(res.message === "Zero songs found")(
                setError(!error)
            )
            setLoad(false)
            setSongList(res)
    }
    
    useEffect(()=>{
        fetchDetails(route.query.id)
    },[route.query.id])


    return(
        <div style={{width:'70%', marginLeft:'15%', display:'block', backgroundColor:'rgb(240,248,255)', padding:'1%'}}>
            <section style={{marginTop:'3%'}}>
                <h1>{details.title}</h1>
                <div style={{display:'grid', gridTemplateColumns:'30% 70%'}}>
                    <img  src={details.image_url} alt='Anime Poster' style={{width:'90%'}} />
                    <aside style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', border:'1px solid black', height:'30%', borderRadius:'1.5rem', gridColumn:'2', gridRow:'1'}}>
                        <div className='rating'>
                            {details.rating === 'None' ? <p>Rating: To Be Confirmed</p> : <p>{details.rating}</p>}
                        </div>
                        <div className='premiered'>
                            {details.premiered ?  <p>Premiered on: {details.premiered}</p> :<p>Premiered on: To Be Confirmed</p>}
                        </div>
                        <div className='status'>                        
                            {details.airing ? <p>On emission</p> : details.status === 'Not yet aired' ? <p>Upcoming Realease</p> : <p>Finished</p>}
                        </div>
                    </aside>
                    <aside style={{gridColumn:'2', gridRow:'1', marginTop:'20%'}}>
                        <p>Rating Ranked: {details.rank}</p>
                        <p>Popularity Ranked: #{details.popularity}</p>
                    </aside>
                </div>
                
            </section>
            <section style={{marginTop:'3%'}}>
                {details?.background ? <h4>Background</h4> : <></>}
                <p>{details.background}</p>
                <h4>Synopsis</h4>
                <p>{details.synopsis}</p>
            </section>
            <section>
                <h4>Trailer</h4>
                {details.trailer_url ? <iframe width="75%" height="315" src={details.trailer_url} title="YouTube video player" frameBorder="0" allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe> : <p>No trailer Available</p>}
            </section>
            <h4>Related</h4>

            {aniDetails?.id ?
            <div>
            {songList.data ? <p>Here are the songs preview found</p> :  error ? <></> : <p>Look for songs</p>}
            {songList.data ? <div style={{display:'grid', gridTemplateColumns:'1fr 1fr'}}> 
                                {songList.data.documents.map((song, i)=><SongCard key={i} spotify={song.open_spotify_url} title={song.title} url={song.preview_url} id={i} album={song.album} artist={song.artist} />)}
                            </div>:
                            load ?  <Loader/> : error ? <ErrorCard msg='Songs'/> :
                                    <button className='btn btn-dark btn-lg' onClick={fetchSongs}>Search</button>}
        </div> : <></>
            }
            {/* <div>
                {songList.data ? <p>Here are the songs preview found</p> :  error ? <></> : <p>Look for songs</p>}
                {songList.data ? <div style={{display:'grid', gridTemplateColumns:'1fr 1fr'}}> 
                                    {songList.data.documents.map((song, i)=><SongCard key={i} spotify={song.open_spotify_url} title={song.title} url={song.preview_url} id={i} album={song.album} artist={song.artist} />)}
                                </div>:
                                load ?  <Loader/> : error ? <ErrorCard msg='Songs'/> :
                                        <button className='btn btn-dark btn-lg' onClick={fetchSongs}>Search</button>}
            </div> */}
            <br/>
            <h4>Related Searches</h4>
            <section style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr 1fr'}}>
                {details?.related?.Adaptation?.map((card,i)=><RelatedCard card={card} key={i} type='Adaptacion'/>)}
                {details?.related?.Sequel?.map((card,i)=><RelatedCard card={card} key={i} type='Sequel'/>)}
                {details?.related?.Prequel?.map((card,i)=><RelatedCard card={card} key={i} type='Prequel'/>)}
            </section>
            <br/>
            <section>
                <CommentBox/>
            </section>

        </div>
    )
}

export default AnimeDetails