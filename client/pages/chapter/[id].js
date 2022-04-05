import Axios from 'axios'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

const Chapter =({baseURL, chapter,chapters, chapterHash})=>{
    const router = useRouter()

    const[chapterIds, setChapters] = useState([])
    const[currentChapter, setCurrentChapter] = useState('')


    const changePage =(e)=>{
        let url = router.asPath
        let idx

        chapterIds.forEach((el,i)=>{
            if(el.id === currentChapter){
                idx = i
            }
        })

        if(e.target.innerHTML === 'Next'){
            router.push(`${url.replace(`chapter/${currentChapter}`, `chapter/${chapterIds[idx+1]?.id}`)}`)
        } else if(e.target.innerHTML === 'Previous'){
            router.push(`${url.replace(`chapter/${currentChapter}`, `chapter/${chapterIds[idx-1]?.id}`)}`)
        }
    }

    useEffect(()=>{
        const n = chapters.filter(el => el.attributes.translatedLanguage === chapter.attributes.translatedLanguage)
        setChapters(n?.sort((a,b)=> a.attributes.chapter - b.attributes.chapter))
        setCurrentChapter(chapter.id)
    },[router.asPath])

    return(
        <div   style={{display:'flex', flexDirection:'column', width:'80%', marginLeft:'10%'}}>
            <h3 style={{margin:'3%'}}>The images take a little time to load, please be patient</h3>
            <section className='chapter'>
                {chapterHash?.data?.map((page,i)=><Image width='200%' height='200%' layout='responsive' key={i} src={`${baseURL}/data/${chapterHash.hash}/${page}`} />)}
            </section>
            <nav aria-label="Page navigation example" style={{gridColumn:'2', marginTop:'5%'}}>
                <ul className="pagination justify-content-center">
                    {currentChapter === chapterIds[0]?.id ?  <li className="page-item disabled">
                    <a className="page-link">Previous</a>
                    </li> : 
                    <a className="page-link" onClick={(e)=>changePage(e)}>Previous</a>
                    }
                    <li className="page-item">
                        <a className="page-link" onClick={(e)=>changePage(e)} >Next</a>
                    </li>
                </ul>
            </nav>
        </div>
    )
}

export default Chapter

export const getServerSideProps = async(context)=>{
    const id = context.query.id
    const client = Axios.create({baseURL:'https://api.mangadex.org/'})
    const chapter = await client.get(`chapter/${id}`)
    const server = await client.get(`/at-home/server/${id}`)
    let mangaId
    chapter.data.data.relationships.forEach((el)=>{
        if(el.type === 'manga'){
            mangaId = el.id
        }
    })

    const chapters = await client.get(`manga/${mangaId}/feed`)

return{
    props:{
        baseURL:server.data.baseUrl,
        chapter:chapter.data.data,
        chapters:chapters.data.data, 
        chapterHash: server.data.chapter
    }
}

}