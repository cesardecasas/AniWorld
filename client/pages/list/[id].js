import { Container, Row, Col } from "react-bootstrap"
import axios from 'axios'

const MyList = ()=>{


    return(
        <div>
            <Container>

            </Container>
        </div>
    )
}

export default MyList

export const getServerSideProps =async(context)=>{
    const AniAPi = axios.create({baseURL:'https://aniworld-api.herokuapp.com'})
    const id = context.query.id

    let AnimeList = []
    let MangaList = []

    const res = await AniAPi.get(`/api/list/get/${id}`)

    return{
        props:{
            list:res.data
        }
    }
}