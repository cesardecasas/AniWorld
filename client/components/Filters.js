import { useState } from "react"
import CheckBox from "./CheckBox"
import EnumInfo from './EnumInfo.json'
import { useRouter } from "next/router"
import DropdownButton from 'react-bootstrap/DropdownButton'
import Dropdown from 'react-bootstrap/Dropdown'

const Filters =()=>{
    const router = useRouter()
    const [rate, setRate] = useState('')
    const [genre, setGenre] = useState('Genre')
    const [genreCode, setCode]=useState(null)
    const [filters, setFilters] = useState(false)

    const onApply =()=>{
        if(genreCode && rate){
            router.push(`${router.asPath}&rated=${rate}&genre=${genreCode}`)
        }
        if(genreCode && !rate){
            router.push(`${router.asPath}&genre=${genreCode}`)
        }
        if(!genreCode && rate){
            router.push(`${router.asPath}&rated=${rate}`)
        } 
        if(router.asPath.includes('rated') ){
            let n = router.asPath.split('page=1')[0]
            router.push(`${n}page=1&rated=${rate}`)
        }   
    }

    const setGenreFilter =(gen)=>{
        console.log(gen)
        setCode(gen.code)
        setGenre(gen.name)
    }

    const onClear =()=>{
        let n = router.asPath.split('page=1')[0]
        setGenre('Genre')
        router.push(`${n}page=1`)
    }
    return(
        <div>
            <h4>Rates</h4>
            {EnumInfo.rated.map((rate, i)=>{
                let n = rate.name.toUpperCase()
                return <CheckBox setfFilter={setRate} key={i} type='rated' name={n}/>})}
            <h4>Genres</h4>
            <DropdownButton id="dropdown-basic-button" title={genre}>
                {EnumInfo.genres.map((genre,i)=><Dropdown.Item onClick={()=>setGenreFilter(genre)} key={i}>{genre.name}</Dropdown.Item>)}
            </DropdownButton>
            <br/>
            <button className='btn btn-dark btn-lg' onClick={onApply}> Apply</button>
            <button className='btn btn-dark btn-lg' style={{margin:'4%'}} onClick={onClear}> Clear</button>
        </div>
    )
}

export default Filters