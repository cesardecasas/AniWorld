import {useRouter} from 'next/router'
import { useEffect, useState } from 'react'
import { getAnimeSearch} from '../api/fetch'
import SearchCard from '../../components/cards/SearchCard'
import {Loader} from '../../components/ResponseHandlers'
import Pagination from '../../components/Pagination'
import Filters from '../../components/Filters'
import { getManga } from '../api/mangadex'
import MangaSearchCard from '../../components/cards/MangaSearchCard'

const SearchDetails =()=>{
    const router = useRouter()

    const[searchResults, setResults] =useState([])
    const[manga, setManga] =useState([])
    const[showManga, setShowManga] = useState(false)
    const[showNSFW, setNSFW] = useState(false)
    
    const populate =()=>{
        if(router.query.type){
            let acceptableQuery =  router.query.type.split('anime=')[1].replace('_','/')
            getAnimeSearch('q='+acceptableQuery).then(r=>setResults(r.results))
            let query =  router.query.type.split('anime=')[1].replace('_','+')
            let page = router.query.type.split('page=')[1]
            const skip = (page*12)-12
            getManga(query,showNSFW, skip).then(r=>setManga(r.results))
            
        }
    }

    const handleChange =()=>{
        setShowManga(!showManga)
    }


    useEffect(()=>{
        populate()
    },[router.asPath, showManga])
    
    return(
        <section style={{display:'grid', gridTemplateColumns:'15% 70% 15%'}}>
            <aside style={{gridColumn:'1',gridRow:'2', marginTop:'20%', marginLeft:'8%'}}>
            <div className="form-check">
                <input className="form-check-input" type="radio" name="flexRadioDefault" id="flexRadioDefault1" onChange={()=>handleChange()}/>
                <label className="form-check-label" htmlFor="flexRadioDefault1">
                    Manga only
                </label>
            </div>

                <Filters/>
            </aside>
            <h3 style={{textAlign:'center',gridColumn:'2'}}>Search Results</h3>
            <div style={{gridColumn:'2'}}>
                {showManga ? manga?.map((man, i)=><MangaSearchCard man={man} key={i} />) : <></>}
                {searchResults[0] ? searchResults.map((result, i)=><SearchCard score={result.score} synopsis={result.synopsis} key={i} id={result.mal_id} name={result.title} image={result.image_url} rated={result.rated} episodes={result.episodes} />)  : <Loader/>}
            </div>
             {router.query.type ? <Pagination/> : <Loader/>}
        </section>
    )
}

export default SearchDetails