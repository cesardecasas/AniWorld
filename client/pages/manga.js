import axios from 'axios'
import MangaCard from '../components/cards/MangaCard'
import Container from 'react-bootstrap/Container'
import Col from 'react-bootstrap/Col'
import Row from 'react-bootstrap/Row'

const Manga = ({manga})=>{


    return(
        <div>
            <h2 style={{textAlign:'center'}} >Most Popular Manga</h2>

                <Container style={{width:'90%', marginLeft:'5%'}}>
                    <Row xs={3} sm={3} md={4} >
                    {manga?.data?.map((manga,i)=>
                    <Col  key={i}>
                        <MangaCard name={manga.attributes.title.en} id={manga.id} att={manga.relationships} />
                    </Col>
                    )}
                    </Row> 
                </Container>
        </div>
    )
}

export default Manga

export const getStaticProps =async()=>{
    const client = axios.create({baseURL:'https://api.mangadex.org/'})

    const res = await client.get('manga?limit=12&includes[]=cover_art&originalLanguage[]=en&availableTranslatedLanguage[]=en')


    return {
        props:{
           manga:res.data
        },
        revalidate:3600
    }
}