import axios from 'axios'
import MangaCard from '../components/cards/MangaCard'

const Manga = ({manga})=>{

    console.log(manga)


    return(
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', width:'80%', marginLeft:'10%'}}>
            {manga?.data?.map((manga,i)=>
            <MangaCard key={i} name={manga.attributes.title.en} id={manga.id} att={manga.relationships} />
           )}
hello
        </div>
    )
}

export default Manga

export const getStaticProps =async()=>{
    const client = axios.create({baseURL:'https://api.mangadex.org/'})

    const res = await client.get('manga?limit=12')


    return {
        props:{
           manga:res.data
        }
    }
}