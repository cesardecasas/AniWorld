// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import Axios from 'axios'

const JikanClient = Axios.create({baseURL:'https://api.jikan.moe/v3/'})

const AniClient = Axios.create({baseURL:'https://api.aniapi.com/v1/'})

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