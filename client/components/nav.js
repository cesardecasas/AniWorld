import {useRouter} from "next/router"
import { useState } from "react"
import Link from "next/link"
import {BiSearch} from 'react-icons/bi'
import Navbar from 'react-bootstrap/Navbar'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import FormControl from 'react-bootstrap/FormControl'
import Navigation from 'react-bootstrap/Nav'

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
        }else if(router.pathname.includes('manga') || router.pathname.includes('chapter')){
            router.push(`/search/anime=${cleanQuery}&page=1`)
        }else{

            router.push(`search/anime=${cleanQuery}&page=1`)
        }
    }
    console.log(router)
    
    return(
        <Navbar collapseOnSelect bg="dark" expand="sm" sticky='top'>
            <Navbar.Brand href="/" style={{color:'white', marginLeft:'4%'}}>AniWorld</Navbar.Brand>
            <Navbar.Toggle aria-controls="responsive-navbar-nav" bg="light" style={{color:'white', backgroundColor:'grey', marginRight:'4%'}}/>
            <Navbar.Collapse id="responsive-navbar-nav">
            <Link href="/manga">
                <Navigation.Link href="#action1">Manga</Navigation.Link>
            </Link>
            <Form className="d-flex"  onSubmit={(e)=>{
                e.preventDefault()
                handleSubmit()}}>
            <FormControl
                type="search"
                placeholder="Search"
                className="mr-2"
                aria-label="Search"
                onChange={(e)=>handleChange(e)}
            />
            <Button variant="outline-success">Search</Button>
            </Form>
            </Navbar.Collapse>
        </Navbar>
        // <nav className="navbar navbar-dark bg-dark" style={{height:'5rem', display:''}}>
        //     <ul className="navbar-nav me-auto mb-2 mb-lg-0">
        //         <li className="nav-item">
        //             <Link href="/">
        //             <a className="nav-link active" aria-current="page" style={{fontSize:'150%', marginLeft:'20%', fontFamily:'sans-serif'}} >AniWorld</a>
        //             </Link>
        //         </li>
        //     </ul>
        //      <u className="navbar-nav me-auto mb-2 mb-lg-0">
        //         <li className="nav-item">
        //             <Link href="/manga">
        //             <a className="nav-link active" aria-current="page" style={{fontSize:'100%', marginLeft:'20%', fontFamily:'sans-serif'}} >Manga</a>
        //             </Link>
        //         </li>
        //      </u>
        //     <form className="d-flex" style={{marginRight:'10%'}} onSubmit={(e)=>{
        //         e.preventDefault()
        //         handleSubmit()}}>
        //         <input className="form-control me-2" style={{width:'150%'}} type="search" placeholder="Search" aria-label="Search" onChange={(e)=>handleChange(e)}/>
        //         <button className="btn btn-outline-success" type="submit"><BiSearch/></button>
        //     </form>
        // </nav>
    )
}

export default Nav