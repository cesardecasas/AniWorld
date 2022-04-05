import axios from 'axios'
import MangaCard from '../components/cards/MangaCard'
import Container from 'react-bootstrap/Container'
import Col from 'react-bootstrap/Col'
import Row from 'react-bootstrap/Row'
import Button from 'react-bootstrap/Button'
import { useState } from 'react'
import MangaSearchCard from '../components/cards/MangaSearchCard'

const Manga = ({manga, recent})=>{

    const [random, setRandom] = useState({})
    const client = axios.create({baseURL:'https://api.mangadex.org/'})


    const getRandomManga = async()=>{
        try {
            const manga = await client.get('manga/random?includes[]=cover_art')
            setRandom(manga.data.data)
        } catch (error) {
            console.log(error)
        }
    }

    return(
        <div>
                <Container style={{width:'90%', marginLeft:'5%'}}>
                    <Row xs={1} sm={1} md={2} >
                        <Col>
                            <h2 style={{textAlign:'center'}} >Most Popular Manga</h2>
                            <Row xs={2} sm={2} md={2}>
                                {manga?.data?.map((manga,i)=>
                                    <Col  key={i}>
                                        <MangaCard name={manga.attributes.title.en} id={manga.id} att={manga.relationships} />
                                    </Col>
                                )}
                            </Row>
                        </Col>
                        <Col>
                            <h2 style={{textAlign:'center'}} >This Year Released</h2>
                            <Row xs={2} sm={2} md={2}>
                                {recent?.data?.map((el, i)=>
                                    <Col key={i}>
                                        <MangaCard name={el.attributes.title.en} id={el.id} att={el.relationships} />
                                    </Col>
                                )}
                            </Row>
                        </Col>
                    </Row> 

                    <p>Unsure what to read? find a random manga</p>
                    <Button variant='dark' style={{marginBottom:'3%'}} onClick={()=>getRandomManga()}>Find!</Button>
                   {random.attributes ? <MangaSearchCard man={random} /> : <></>}

                </Container>
        </div>
    )
}

export default Manga

export const getStaticProps =async()=>{
    const client = axios.create({baseURL:'https://api.mangadex.org/'})
    const d = new Date()
    let year = d.getFullYear()

    const res = await client.get('manga?limit=4&includes[]=cover_art&originalLanguage[]=en&availableTranslatedLanguage[]=en')
    const nRes = await client.get(`manga?limit=4&offset=0&year=${year}&includes[]=cover_art&originalLanguage[]=en&availableTranslatedLanguage[]=en`)


    return {
        props:{
           manga:res.data,
           recent:nRes.data
        },
        revalidate:3600
    }
}