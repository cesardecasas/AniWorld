import Axios from 'axios'
import Image from 'next/image'

const Chapter =({baseURL, chapter})=>{



    return(
        <div   style={{display:'inline'}}>
            {chapter?.attributes?.data?.map((page,i)=><Image width='300px' height='500px' key={i} src={`${baseURL}/data/${chapter.attributes.hash}/${page}`} />)}
        </div>
    )
}

export default Chapter

export const getServerSideProps = async(context)=>{
    const id = context.query.id
    const client = Axios.create({baseURL:'https://api.mangadex.org/'})
    const chapter = await client.get(`chapter/${id}`)
    const server = await client.get(`/at-home/server/${id}`)

return{
    props:{
        baseURL:server.data.baseUrl,
        chapter:chapter.data.data
    }
}

}