import Head from 'next/head'
import { useEffect, useState } from 'react'
import styles from '../styles/Home.module.css'
import ImgCarousel from '../components/ImgCarousel'
import AnimeCard from '../components/cards/AnimeCard'
import { xmlToJson } from '../components/XMLconverter'

const Home=(props)=> {
  const [animes, setAnimes] = useState([])
  const [manga, setManga] = useState([])
  const [carousel, setCarousel]=useState([])

  const populate =()=>{
    setAnimes(props.animees.top)
    setManga(props.manga.top)
    setCarousel(props.animees.top.slice(0,3))
  }

  useEffect(()=>{
    populate()
  },[])

  return (
    <div className={styles.container}>
      <Head>
        <title>AniWorld</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <section className='quote' style={{width:'80%', marginLeft:'3%', marginTop:'3%'}}>
        <p style={{fontSize:'large', fontWeight:'bolder'}}>{props.quote.anime}</p>
        <p style={{fontStyle:'italic'}}>{props.quote.quote}</p>
        <p style={{fontStyle:'italic'}}>-{props.quote.character}</p>
      </section>
      <div style={{width:'90%', marginLeft:'3%', marginTop:'3%', display:'grid', gridTemplateColumns:'60% 40%'}}>
        <ImgCarousel carousel={carousel}/>
        <section>
          <h4>Top upcoming</h4>
          <div style={{}}>
          {animes.slice(4, 8).map((anime, i)=> <AnimeCard key={i} name={anime.title} image={anime.image_url} date={anime.start_date} id={anime.mal_id}/>)}
          </div>
        </section>
        <div style={{gridColumn:'1', gridRow:'1', marginTop:'95%'}}>
          <h4>News</h4>
        </div>
      </div>
      
      
      
      
    </div>
  )
}

export default Home

export const getStaticProps =async()=>{

  const res = await fetch('https://api.jikan.moe/v3/top/anime/1/upcoming')
  const resManga = await fetch('https://api.jikan.moe/v3/top/manga/1')
  const Quote = await fetch('https://animechan.vercel.app/api/random')
  const xml = await fetch('https://cdn.animenewsnetwork.com/encyclopedia/reports.xml?id=155&type=anime&nlist=all', {headers: {
    'content-type': 'text/xml;charset=UTF-8'
  }})
  // const xmlJson = await xml.json()
  const quoteJson = await Quote.json()
  const mangaData = await resManga.json()
  console.log(xml)
  

  const data = await res.json()
  return{
    props:{
      animees:data,
      manga:mangaData,
      quote:quoteJson
    },
    revalidate:3600
  }
}
