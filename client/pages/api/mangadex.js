import axios from "axios";

const client = axios.create({baseURL:'https://api.mangadex.org/'})
const dbClient = axios.create({baseURL:'http://mangadb-search.herokuapp.com/mangadb'})

// get manga and chapters https://api.mangadex.org/manga/{id}/aggregate

// https://www.bilibilicomics.com/detail/mc143?utm_source=mgd
//https://www.bilibilicomics.com/mc143/17764?utm_source=mgd&utm_medium=uploader&utm_campaign=143&utm_content=51-2


// get server https://api.mangadex.org/at-home/server/{chapterId}

// get cover https://uploads.mangadex.org/covers/{ manga.id }/{ cover.filename }

export const login =async()=>{
    try {
        const res = await client.post('auth/login')
        return res 
    } catch (error) {
        console.log(error)
    }
}

export const getCover =async(mangaId)=>{
    try {

        const res = await client.get(`cover/${mangaId}`)
        console.log(res, 1)
        return res.data
    } catch (error) {
        console.log(error)
    }
}

export const getManga = async(query, nsfw, page)=>{
    try {
        const res = await dbClient.get(`/search?q=${query}&nsfw=${nsfw}&limit=12&skip=${page}`)
        return res.data
    } catch (error) {
        console.log(error)
    }
}

//https://api.mangadex.org/chapter?manga=17724b7a-c9c3-4186-9a78-9ce1256f3350&volume=1&chapter=1&contentRating[]=safe&contentRating[]=suggestive&contentRating[]=erotica&contentRating[]=pornographic&includes[]=scanlation_group&includes[]=user