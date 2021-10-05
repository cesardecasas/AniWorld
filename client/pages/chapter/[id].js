import Axios from 'axios'
import Image from 'next/image'

const Chapter =({baseURL, chapter})=>{



    return(
        <div   style={{display:'flex', flexDirection:'column', width:'80%', marginLeft:'10%'}}>
            <section style={{width:'70%', height:'80%', marginLeft:'15%'}}>
            {chapter?.attributes?.data?.map((page,i)=><Image width='100%' height='200%' layout='responsive' key={i} src={`${baseURL}/data/${chapter.attributes.hash}/${page}`} />)}
            </section>
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