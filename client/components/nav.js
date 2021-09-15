import {useRouter} from "next/router"
import { useState } from "react"
import Link from "next/link"
import {BiSearch} from 'react-icons/bi'

const Nav = ()=>{

    const[query, setQuery] =useState()
    const router = useRouter()

    const handleChange =(e)=>{
        setQuery(e.target.value)
    }

    const handleSubmit =()=>{
        const cleanQuery = query.replace(' ','_')
        if(router.pathname.includes('search')){
            router.push(`anime=${cleanQuery}&page=1`)
        }else if(router.pathname.includes('anime')){
            router.push(`/search/anime=${cleanQuery}&page=1`)
        }else{

            router.push(`search/anime=${cleanQuery}&page=1`)
        }
    }

    
    return(
        <nav className="navbar navbar-dark bg-dark" style={{height:'5rem'}}>
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                <li className="nav-item">
                    <Link href="/">
                    <a className="nav-link active" aria-current="page" style={{fontSize:'150%', marginLeft:'20%', fontFamily:'sans-serif'}} >AniWorld</a>
                    </Link>
                </li>
            </ul>
            <form className="d-flex" style={{marginRight:'10%'}} onSubmit={(e)=>{
                e.preventDefault()
                handleSubmit()}}>
                <input className="form-control me-2" style={{width:'150%'}} type="search" placeholder="Search" aria-label="Search" onChange={(e)=>handleChange(e)}/>
                <button className="btn btn-outline-success" type="submit"><BiSearch/></button>
            </form>
        </nav>
    )
}

export default Nav