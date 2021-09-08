// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import Axios from 'axios'

const Client = Axios.create({baseURL:'https://api.jikan.moe/v3/'})

export const getUpcoming =async()=>{
  try {
    const res = await Client.get('top/anime/1/upcoming')
    return res.data
  } catch (error) {
    console.log(error)
  }
}

export const getDetails = async(id)=>{
  try {
    const res = await Client.get(`anime/${id}`)
    return res.data
  } catch (error) {
    console.log(error)
  }

}