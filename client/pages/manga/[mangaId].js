import { useEffect, useState } from "react"
import {getMangaDetails} from '../api/fetch'
import {useRouter} from 'next/router'



const AnimeDetails = ()=>{

    const route = useRouter()

    const[details, setDetails] = useState({})
    const[error, setError]= useState(false)
    const[load, setLoad] = useState(false)

    const fetchDetails =async(id)=>{
        // if(id){
        //     const res = await getMangaDetails(id)
        //     setDetails(res)
        // }
        
    }
    
    useEffect(()=>{
        console.log(route)
        fetchDetails(route.query.mangaId)
    },[route.query.id])


    return(
        <div style={{width:'70%', marginLeft:'20%', display:'block'}}>
            <section style={{marginTop:'3%'}}>
                <h1>{details.title}</h1>
                <div style={{display:'grid', gridTemplateColumns:'1fr 1fr'}}>
                    <img  src={details.image_url} alt='Anime Poster' style={{width:'60%'}} />
                    <aside>
                        {details.score === 'None' ? <p>Rating: To Be Confirmed</p> : <p>Rating: {details.score}</p>}
                        {details.published ?  <p>Published on: {details.published.string}</p> :<p>Premiered on: To Be Confirmed</p>}
                        {details.publishing ? <p>Publishing</p> : <p>Finished</p>}
                    </aside>
                </div>
                
            </section>
            <section style={{marginTop:'3%'}}>
                <h4>Background</h4>
                <p>{details.background}</p>
                <h4>Synopsis</h4>
                <p>{details.synopsis}</p>
            </section>
        </div>
    )
}

export default AnimeDetails