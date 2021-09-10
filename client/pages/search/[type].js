import {useRouter, withRouter} from 'next/router'
import { useEffect, useState } from 'react'
import { getAnimeSearch} from '../api/fetch'
import SearchCard from '../../components/SearchCard'
import {Loader} from '../../components/ResponseHandlers'
import Pagination from '../../components/Pagination'
import Filters from '../../components/Filters'

const SearchDetails =(props)=>{
    const {router} =props

    const[searchResults, setResults] =useState([])
    console.log(router)
    const populate =()=>{
        if(!router.query.type){
            router.push('/')
            return
        }else{
            let acceptableQuery =  router.query.type.split('anime=')[1].replace('_','/')
            getAnimeSearch('q='+acceptableQuery).then(r=>setResults(r.results))}
    }



    useEffect(()=>{
        populate()
    },[router.asPath])
    
    return(
        <section style={{display:'grid', gridTemplateColumns:'15% 70% 15%'}}>
            <aside style={{gridColumn:'1',gridRow:'2', marginTop:'20%', marginLeft:'8%'}}>
                <Filters/>
            </aside>
            <h3 style={{textAlign:'center',gridColumn:'2'}}>Search Results</h3>
            <div style={{gridColumn:'2'}}>
                 {searchResults[0] ? searchResults.map((result, i)=><SearchCard score={result.score} synopsis={result.synopsis} key={i} id={result.mal_id} name={result.title} image={result.image_url} rated={result.rated} episodes={result.episodes} />)  : <Loader/>}
            </div>
            <Pagination/>
        </section>
    )
}

export default withRouter(SearchDetails)