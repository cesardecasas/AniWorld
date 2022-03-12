// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import Axios from 'axios'

const JikanClient = Axios.create({baseURL:'https://api.jikan.moe/v4/'})

const AniClient = Axios.create({baseURL:'https://api.aniapi.com/v1/'})

const NewsClient = Axios.create({baseURL:'https://cdn.animenewsnetwork.com/encyclopedia/'})

export const getUpcoming =async()=>{
  try {
    const res = await JikanClient.get('top/anime/1/upcoming')
    return res.data
  } catch (error) {
    console.log(error)
  }
}

export const getDetails = async(id)=>{
  try {
    const res = await JikanClient.get(`anime/${id}`)
    return res.data
  } catch (error) {
    console.log(error)
  }

}

export const getMangaDetails =async(id)=>{
  try {
    const res = await JikanClient.get(`manga/${id}`)
    return res.data
  } catch (error) {
    console.log(error)
  }
}

export const getAnime =async(id)=>{
  try {
    const res = await AniClient.get(`anime?mal_id=${id}`)
    return res.data
  } catch (error) {
    console.log(error)
  }
}

export const getSong =async(id)=>{
  try {
    const res = await AniClient.get(`song?anime_id=${id}`)
    return res.data
  } catch (error) {
    console.log(error)

  }
}

export const getAnimeSearch =async(query)=>{
  try {
  //  await JikanClient.get(`/search/anime?${query}`).then(r=>{return r.data})
    const res = await JikanClient.get(`anime?${query}`)
    return res.data
  } catch (error) {
    console.log(error)
  }
}
// , {headers: {
//   'content-type': 'text/xml;charset=UTF-8'
// }}

export const getNews =async()=>{
  try {
    const res = await NewsClient.get('reports.xml?id=155&type=anime&nlist=all', {headers: {
      'Content-Type': 'application/xml;charset=UTF-8',
      'Access-Control-Allow-Origin':'http://localhost:3000/',
      'Vary': 'Origin'
    }})
    console.log(res)
    return res.data
  } catch (error) {
    console.log(error)
  }
}