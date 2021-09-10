import { useRouter } from "next/router"
import { useEffect, useState } from "react"

const Pagination =()=>{

    const router = useRouter()

    const [page, setPage] = useState(0)
    
    const changePage =(e)=>{
        let url = router.asPath
        if(e.target.innerHTML === 'Next'){
            router.push(`${url.replace(`page=${page}`, `page=${page+1}`)}`)
        } else if(e.target.innerHTML === 'Previous'){
            router.push(`${url.replace(`page=${page}`, `page=${page-1}`)}`)
        }
    }


    useEffect(()=>{
        setPage(parseInt(router.query.type.split('page=')[1]))
    },[router.query.type])


    return(
        <nav aria-label="Page navigation example" style={{gridColumn:'2'}}>
        <ul className="pagination justify-content-center">
            {page === 1 ?  <li className="page-item disabled">
            <a className="page-link">Previous</a>
            </li> : 
            <a className="page-link" onClick={(e)=>changePage(e)}>Previous</a>
            }
            <li className="page-item">
                <a className="page-link" onClick={(e)=>changePage(e)} >Next</a>
            </li>
        </ul>
        </nav>
    )
}

export default Pagination