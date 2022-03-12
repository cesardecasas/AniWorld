import {useRouter} from 'next/router'
import { useEffect, useState } from 'react'
import { getAnimeSearch} from '../api/fetch'
import SearchCard from '../../components/cards/SearchCard'
import {Loader} from '../../components/ResponseHandlers'
import Pagination from '../../components/Pagination'
import Filters from '../../components/Filters'
import { getManga } from '../api/mangadex'
import MangaSearchCard from '../../components/cards/MangaSearchCard'
import Offcanvas from 'react-bootstrap/Offcanvas'
import Button from 'react-bootstrap/Button'


const SearchDetails =({results, resultsManga})=>{
    const router = useRouter()

    const[searchResults, setResults] =useState([])
    const[manga, setManga] =useState([])
    const[showManga, setShowManga] = useState(false)
    const[showNSFW, setNSFW] = useState(false)
    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    
    const populate =()=>{
        setResults(results)
        setManga(resultsManga)
    }

    const handleChange =()=>{
        setShowManga(!showManga)
    }


    useEffect(()=>{
        populate()
    },[router.asPath, showManga])
    
    return(
        <section style={{display:'grid', gridTemplateColumns:'15% 70% 15%'}}>
            <Button size='sm' style={{gridColumn:'1', marginTop:'20%', marginLeft:'8%'}} variant="dark" onClick={handleShow} className="me-2">
                Filters
            </Button>
            <Offcanvas show={show} onHide={handleClose}>
                <Offcanvas.Header closeButton>
                <Offcanvas.Title>Filters</Offcanvas.Title>
                </Offcanvas.Header>
                <div className="form-check">
                    <input className="form-check-input" type="radio" name="flexRadioDefault" id="flexRadioDefault1" onChange={()=>handleChange()}/>
                    <label className="form-check-label" htmlFor="flexRadioDefault1">
                        Manga only
                    </label>
                </div>
                {/* <Filters/> */}
            </Offcanvas>
            <h3 style={{textAlign:'center',gridColumn:'2'}}>Search Results</h3>
            <div style={{gridColumn:'2'}}>
                {showManga ? manga?.map((man, i)=><MangaSearchCard man={man} key={i} />) : <></>}
                {showManga ? <></> : searchResults[0] ? searchResults.map((result, i)=><SearchCard score={result.score} synopsis={result.synopsis} key={i} id={result.mal_id} name={result.title} image={result.images.jpg.image_url} rated={result.rated} episodes={result.episodes} />)  : <Loader/>}
            </div>
             {router.query.type ? <Pagination/> : <Loader/>}
        </section>
    )
}

export default SearchDetails

export const getServerSideProps = async(context)=>{
    

    let acceptableQuery =  context.query.type.split('anime=')[1].replace('_','/')
    const resResults = await getAnimeSearch('q='+acceptableQuery)
    let query =  context.query.type.split('anime=')[1].replace('_','+').split('page=')[0]
    let page = context.query.type.split('page=')[1]
    const skip = (page*12)-12
    const resManga = await getManga(query, skip)


    return{
        props:{
            results:resResults.data,
            resultsManga:resManga
        }
    }
}