import React from 'react'

const Nav = ()=>{


    return(
        <nav className="navbar navbar-dark bg-dark" style={{height:'5rem'}}>
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                <li className="nav-item">
                    <a className="nav-link active" aria-current="page" style={{fontSize:'150%', marginLeft:'20%', fontFamily:'sans-serif'}} href="/">AniWorld</a>
                </li>
            </ul>
            <form className="d-flex">
                <input className="form-control me-2" type="search" placeholder="Search" aria-label="Search"/>
                <button className="btn btn-outline-success" type="submit">Search</button>
            </form>
        </nav>
    )
}

export default Nav