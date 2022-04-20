export const animeDetails = `
query ($id : Int){
  Media(idMal : $id, type: ANIME){
    title {
      userPreferred
    }
    id
    idMal
    description
    episodes
    averageScore
    genres
    trailer {
      id
      thumbnail
      site
    }
    coverImage {
      extraLarge
      large
      medium
    }
    bannerImage
    streamingEpisodes {
      title
      thumbnail
      url
      site
    }
  }
}
`