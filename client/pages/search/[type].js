import {useRouter} from 'next/router'
import { useEffect, useState } from 'react'
import { getAnimeSearch} from '../api/fetch'
import SearchCard from '../../components/SearchCard'
import {Loader} from '../../components/ResponseHandlers'

const SearchDetails =()=>{
    const router = useRouter()

    const[searchResults, setResults] =useState([])
    console.log(router)

    const populate =async()=>{
        let acceptableQuery = router.query.type.split('=')[1].replace('_','/')
        const res = await getAnimeSearch('q='+acceptableQuery)
        setResults(res.results)
        console.log(searchResults)
    }

    useEffect(()=>{
        populate()
    },[router.query.type])
    
    return(
        <section>
            <h3 style={{textAlign:'center'}}>Search Results</h3>
            <div style={{width:'70%', marginLeft:'15%'}}>
                 {searchResults[0] ? searchResults.map((result, i)=><SearchCard score={result.score} synopsis={result.synopsis} key={i} id={result.mal_id} name={result.title} image={result.image_url} rated={result.rated} episodes={result.episodes} />)  : <Loader/>}
            </div>
        </section>
    )
}

export default SearchDetails