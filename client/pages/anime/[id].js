import { useEffect, useState } from "react"
import {getAnime, getSong} from '../api/fetch'
import {useRouter} from 'next/router'
import { Loader, ErrorCard} from '../../components/ResponseHandlers'
import SongCard from "../../components/cards/SongCard"
import RelatedCard from "../../components/cards/RelatedCard"
import CommentBox from '../../components/CommentBox'
import Image from 'next/image'
import Axios from 'axios'
import Container from 'react-bootstrap/Container'
import Col from 'react-bootstrap/Col'
import Row from 'react-bootstrap/Row'


const AnimeDetails = ({data})=>{
    const route = useRouter()
    

    const[details, setDetails] = useState({})
    const[aniDetails, setAniDetails] = useState({})
    const[songList,setSongList]= useState([])
    const[error, setError]= useState(false)
    const[load, setLoad] = useState(false)

    const fetchDetails =async()=>{
        if(data){
            const aniRes = await getAnime(data.mal_id)
            setDetails(data)
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
        fetchDetails()
    },[route.query.id])


    return(
        <div className='detailsBody' >
            <section style={{marginTop:'3%'}}>
                <h1>{details.title}</h1>
                <Container>
                    <Row xs={1} sm={1} md={2}>
                        <Col  md={4} lg={4}>
                            <div height='100%' width='30px'>
                                { details.image_url ? <Image  src={details.image_url} alt='Anime Poster'  width='100%' height='100%' quality={100} layout='responsive'  /> : <></>}
                            </div>
                        </Col>
                        <Col md={7} lg={7}>
                            <Row>
                                <aside style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', height:'30%', borderRadius:'1.5rem', gridColumn:'2', gridRow:'1', marginTop:'3%'}}>
                                    <div className='rating desc'>
                                        {details.rating === 'None' ? <p className='desc'>Rating: To Be Confirmed</p> : <p className='desc'>{details.rating}</p>}
                                    </div>
                                    <div className='premiered desc'>
                                        {details.premiered ?  <p className='desc'>Premiered on: {details.premiered}</p> :<p className='desc'>Premiered on: To Be Confirmed</p>}
                                    </div>
                                    <div className='status desc'>                        
                                        {details.airing ? <p className='desc'>On emission</p> : details.status === 'Not yet aired' ? <p className='desc'>Upcoming Realease</p> : <p className='desc'>Finished</p>}
                                    </div>
                                </aside>
                            </Row>
                            <Row>
                                <aside style={{gridColumn:'2',marginLeft:'2%', gridRow:'1', marginTop:'20%'}}>
                                    <p>Rating Ranked: {details.rank}</p>
                                    <p>Popularity Ranked: #{details.popularity}</p>
                                </aside>
                            </Row>
                        </Col>
                    </Row>
                </Container>
                
            </section>
            <section style={{marginTop:'3%'}}>
                {details?.background ? <h4>Background</h4> : <></>}
                <p>{details.background}</p>
                <h4>Synopsis</h4>
                <p>{details.synopsis}</p>
            </section>
            <section>
                <h4>Trailer</h4>
                {details.trailer_url ? <iframe className='trailer' width="75%" height="315" src={details.trailer_url} title="YouTube video player" frameBorder="0" allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe> : <p>No trailer Available</p>}
            </section>
            <h4>Related</h4>

            {aniDetails?.id ?
            <div>
            {songList.data ? <p>Here are the songs preview found</p> :  error ? <></> : <p>Look for songs</p>}
            {songList.data ?  
                                <Row xs={1} sm={1} md={2}>
                                {songList.data.documents.map((song, i)=><Col key={i}><SongCard spotify={song.open_spotify_url} title={song.title} url={song.preview_url} id={i} album={song.album} artist={song.artist} /></Col>)}
                                </Row>
                            :
                            load ?  <Loader/> : error ? <ErrorCard msg='Songs'/> :
                                    <button className='btn btn-dark btn-lg' id='search' onClick={fetchSongs}>Search</button>}
        </div> : <></>
            }
            <br/>
            <h4>Related Searches</h4>
            {/* <section style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr 1fr'}}> */}
            <Row xs={2} sm={2} md={4}>
                 {details?.related?.Sequel?.map((card,i)=><Col><RelatedCard card={card} key={i} type='Sequel'/></Col>)}
                {details?.related?.Prequel?.map((card,i)=><Col><RelatedCard card={card} key={i} type='Prequel'/></Col>)}
            </Row>
            {/* </section> */}
            <br/>
            <section>
                <CommentBox/>
            </section>

        </div>
    )
}

export default AnimeDetails


export const getServerSideProps = async(context)=>{
        const id = context.query.id
        const JikanClient = Axios.create({baseURL:'https://api.jikan.moe/v3/'})
        const res = await JikanClient.get(`anime/${id}`)
    return{
        props:{
            data:res.data
        }
    }

}