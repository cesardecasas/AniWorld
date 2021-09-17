import Head from 'next/head'
import { useEffect, useState } from 'react'
import styles from '../styles/Home.module.css'
import CarouselComponent from '../components/Carousel'
import ImgCarousel from '../components/ImgCarousel'
import AnimeCard from '../components/AnimeCard'

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
        <div >
          hello
        </div>
      </div>
      
        {/* <h2>Top Manga</h2>
        <section style={{width:'80%', marginLeft:'3%', height:'60%' }}>
          {animes[0] ? <CarouselComponent type='Manga' animes={manga}/> : <p>Loading</p>}
          
        </section> */}
      
      
      
    </div>
  )
}

export default Home

export const getStaticProps =async()=>{
  const res = await fetch('https://api.jikan.moe/v3/top/anime/1/upcoming')
  const resManga = await fetch('https://api.jikan.moe/v3/top/manga/1')
  const Quote = await fetch('https://animechan.vercel.app/api/random')
  const quoteJson = await Quote.json()
  const mangaData = await resManga.json()
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
