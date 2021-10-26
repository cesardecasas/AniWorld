import {useRouter} from "next/router"
import { useEffect, useState } from "react"
import Link from "next/link"
import {BiSearch} from 'react-icons/bi'
import Navbar from 'react-bootstrap/Navbar'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import FormControl from 'react-bootstrap/FormControl'
import Navigation from 'react-bootstrap/Nav'
import {BsMoon, BsSun} from 'react-icons/bs'

const Nav = ({darkMode, setDarkMode})=>{


    const[query, setQuery] =useState()
    const[color, setColor] =useState('black')
    const[bg, setBg] =useState('white')
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


    useEffect(()=>{

        if(darkMode){
            setBg('black')
            setColor('white')
        }else{
            setBg('white')
            setColor('black')
        }

    },[darkMode])
    
    return(
        <Navbar collapseOnSelect bg='dark' expand="sm" sticky='top'>
            <Link href='/'>
                <Navbar.Brand style={{color:'white', marginLeft:'4%'}}>AniWorld</Navbar.Brand>
            </Link>
            <Navbar.Toggle aria-controls="responsive-navbar-nav" bg="light" style={{color:'white', backgroundColor:'grey', marginRight:'4%'}}/>
            <Navbar.Collapse id="responsive-navbar-nav">
            <Link href="/manga">
                <Navigation.Link href="#action1" style={{color:'white'}}>Manga</Navigation.Link>
            </Link>
            {/* {darkMode ? <BsSun className='icon' style={{color:'white'}} onClick={()=>setDarkMode(!darkMode)} /> : <BsMoon style={{color:'white'}} onClick={()=>setDarkMode(!darkMode)} className='icon'/>} */}
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
            <Button variant='outline-light' ><BiSearch/></Button>
            </Form>
            </Navbar.Collapse>
        </Navbar>
    )
}

export default Nav