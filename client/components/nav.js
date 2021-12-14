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
import {FaUserCircle} from 'react-icons/fa'
import NavDropdown  from "react-bootstrap/NavDropdown"

const Nav = ({darkMode, setDarkMode, authenticated, currentUser, setCurrentUser, setAuthenticated})=>{


    const[query, setQuery] =useState('')
    const[color, setColor] =useState('black')
    const[bg, setBg] =useState('white')
    const router = useRouter()

    const handleChange =(e)=>{
        setQuery(e.target.value)
    }
    
    const logOut =()=>{
        setCurrentUser(null)
        setAuthenticated(false)
        localStorage.clear()
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
        console.log(1)
    }


    useEffect(()=>{

    },[currentUser])
    
    return(
        <Navbar collapseOnSelect bg='dark' expand="sm" sticky='top'>
            <Link href='/' passHref>
                <Navigation.Link id='brand' style={{color:'white', marginLeft:'4%', fontSize:'20px'}}>AniWorld</Navigation.Link>
            </Link>
            <Navbar.Toggle aria-controls="responsive-navbar-nav" bg="light" style={{color:'white', backgroundColor:'grey', marginRight:'4%'}}/>
            <Navbar.Collapse id="responsive-navbar-nav">
            <Link href="/manga" passHref>
                <Navigation.Link  style={{color:'white'}}>Manga</Navigation.Link>
            </Link>
            {authenticated && currentUser ? 
            <NavDropdown
                id="nav-dropdown-dark-example"
                title={currentUser?.userName}
                menuVariant="dark"
            >
                <Link href={`/list/${currentUser?.id}`}  passHref>
                    <NavDropdown.Item >My List</NavDropdown.Item>
                </Link>
                <NavDropdown.Item onClick={()=> logOut()}>Log Out</NavDropdown.Item>
            </NavDropdown> : 
            <Link href='/Login' passHref>
                <Navigation.Link  style={{color:'white'}}>Login</Navigation.Link>
            </Link>
            }
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