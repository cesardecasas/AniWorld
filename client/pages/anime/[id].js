import { useEffect, useState } from "react"
import {getDetails} from '../api/fetch'
import {useRouter} from 'next/router'


const AnimeDetails = (props)=>{

    const route = useRouter()

    const[details, setDetails] = useState({})

    const fetchDetails =async(id)=>{
        const res = await getDetails(id)
        setDetails(res)
    }
    
    useEffect(()=>{
        fetchDetails(route.query.id)
    },[])


    return(
        <div style={{width:'70%', marginLeft:'15%', display:'block'}}>
            <section style={{marginTop:'3%'}}>
                <h1>{details.title}</h1>
                <div style={{display:'grid', gridTemplateColumns:'1fr 1fr'}}>
                    <img  src={details.image_url} alt='Anime Poster' sizes='150%'/>
                    <aside>
                        {details.rating === 'None' ? <p>Rating: To Be Confirmed</p> : <p>Rating: {details.premiered}</p>}
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
                {details.trailer_url ? <iframe width="560" height="315" src={details.trailer_url} title="YouTube video player" frameBorder="0" allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe> : <p>No trailer Available</p>}
            </section>
        </div>
    )
}

export default AnimeDetails