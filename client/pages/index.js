import Head from 'next/head'
import { useEffect, useState } from 'react'
import styles from '../styles/Home.module.css'
import ImgCarousel from '../components/ImgCarousel'
import AnimeCard from '../components/cards/AnimeCard'
import axios from 'axios'

const Home=(props)=> {
  const [animes, setAnimes] = useState([])
  const [manga, setManga] = useState([])
  const [carousel, setCarousel]=useState([])
  const [seasonAnimes, setSeasonAnimes] = useState([])

  const populate =()=>{
    setAnimes(props.animees.top)
    setSeasonAnimes(props.season.anime)
    setManga(props.manga.top)
    setCarousel(props.animees.top.slice(0,3))
  }

  useEffect(()=>{
    populate()
  },[])

  return (
    <div className={styles.container} >
      <Head>
        <title>AniWorld</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <section className='quote' style={{width:'80%', marginLeft:'3%', marginTop:'3%'}}>
        <p style={{fontSize:'large', fontWeight:'bolder'}}>{props.quote.anime}</p>
        <p data-testid="quote" style={{fontStyle:'italic'}}>{props.quote.quote}</p>
        <p style={{fontStyle:'italic'}}>-{props.quote.character}</p>
      </section>
      <div style={{width:'90%', marginLeft:'3%', marginTop:'3%', display:'grid', gridTemplateColumns:'60% 40%'}}>
        <ImgCarousel carousel={carousel}/>
        <section>
          <h4>Top upcoming</h4>
          <div style={{}}>
          {animes.slice(4, 9).map((anime, i)=> <AnimeCard key={i} name={anime.title} image={anime.image_url} date={anime.start_date} id={anime.mal_id}/>)}
          </div>
        </section>
        <div style={{gridColumn:'1', gridRow:'1', marginTop:'80%',marginLeft:'5%', width:'90%'}}>
          <h4>Season Animes</h4>
          {seasonAnimes.slice(3,9).map((anime,i )=> <AnimeCard key={i} name={anime.title} image={anime.image_url} id={anime.mal_id} date={anime.airing_start} />)}
        </div>
      </div>
    </div>
  )
}

export default Home

export const getStaticProps =async()=>{
  const date = new Date()

  const season = getSeason(date.getMonth())

  const client = axios.create({baseURL:'https://api.mangadex.org/'})


  

  const res = await fetch('https://api.jikan.moe/v3/top/anime/1/upcoming')
  const mangaRes = await client.get('manga?limit=12')
  const Quote = await fetch('https://animechan.vercel.app/api/random')
  const seasonAnimes = await fetch(`https://api.jikan.moe/v3/season/${date.getFullYear()}/${season}`) 

  const quoteJson = await Quote.json()
  const seasonJson = await seasonAnimes.json()
  const data = await res.json()


  return{
    props:{
      animees:data,
      manga:mangaRes.data.data,
      quote:quoteJson,
      season:seasonJson
    },
    revalidate:3600
  }
}

const getSeason =(month) => {

  if (month <= 2  && month <= 4) {
      return 'spring';
  } else if (month <= 5 && month <= 7) {
      return 'summer';
  }else if (month <= 8 && month <= 10) {
      return 'fall';
  }
  // Months 11, 0, 1
  return 'winter';
}
