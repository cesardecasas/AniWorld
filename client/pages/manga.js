import axios from 'axios'

const Manga = ({manga})=>{




    return(
        <div>
            {manga?.results?.map((manga,i)=>
            <div key={i}>
                <p>{manga.title}</p>
                <img src={manga.mainCover}/>
            </div>)}
hello
        </div>
    )
}

export default Manga

export const getStaticProps =async()=>{
    const dbClient = axios.create({baseURL:'http://mangadb-search.herokuapp.com/mangadb'})

    const res = await dbClient.get('?sortby=rating&ascending=false&nsfw=false&limit=12&skip=0', {method:'GET'})


    return {
        props:{
           manga:res.data
        }
    }
}