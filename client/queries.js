export const animeDetails = `
query ($id : Int){
    Media(idMal : $id, type: ANIME){
      title{
        english
      }
      id
      idMal
      genres
      trailer {
        id
      }
      coverImage {
        extraLarge
        large
        medium
        color
      }
      bannerImage
    }
}
`