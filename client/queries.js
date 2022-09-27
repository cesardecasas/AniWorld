export const animeDetails = `
query ($id: Int) {
  Media(idMal: $id) {
    id
    siteUrl
    title {
      romaji
      userPreferred
    }
    coverImage {
      extraLarge
      color
    }
    mediaListEntry {
      id
    }
    isFavourite
    bannerImage
    description(asHtml: true)
    episodes
    chapters
    format
    relations {
      edges {
        relationType(version: 2)
        node {
          id
          siteUrl
          title {
            userPreferred
          }
          coverImage {
            large
            color
          }
          format
          status
        }
      }
    }
    recommendations(perPage: 6, sort: [ RATING_DESC ]) {
      nodes {
        mediaRecommendation {
          id
          siteUrl
          title {
            userPreferred
          }
          coverImage {
            large
            color
          }
          format
          status
        }
        rating
        userRating
      }
      pageInfo {
        total
      }
    }
    characters(sort: [ROLE, ID], perPage: 12) {
      edges {
        id
        role
        node {
          name {
            full
          }
          image {
            large
          }
          siteUrl
        }
      }
    }
    staff(perPage: 12) {
      edges {
        id
        role
        node {
          siteUrl
          image {
            large
          }
          name {
            full
          }
        }
      }
    }
    stats {
      statusDistribution {
        status
        amount
      }
    }
    externalLinks {
      url
      site
    }
    tags {
      name
      description
      isMediaSpoiler
      isGeneralSpoiler
      isAdult
    }
  }
}
`

export const animeSearch = `
query ($search: String) {
  Page(perPage: 50) {
    media(search: $search) {
      id
      status
      img: coverImage {
        large
      }
      title {
        userPreferred
      }
      format
      url: siteUrl
      mediaListEntry {
        id
        status
      }
    }
  }
}`


export const animeBySeason = `
query ($season: MediaSeason, $seasonYear: Int) {
  Page(perPage: 4) {
    media(season:$season, seasonYear:$seasonYear) {
      idMal
      id
      status
      description
      img: coverImage {
        large
      }
      title {
        userPreferred
      }
      format
      url: siteUrl
      mediaListEntry {
        id
        status
      }
    }
  }
}`

export const animeSorted = `
query ( $sort: [MediaSort], $status: MediaStatus ) {
  Page(perPage: 50) {
    media(status: $status, sort: $sort) {
      meanScore
      id
      status
      img: coverImage {
        large
      }
      title {
        userPreferred
      }
      format
      url: siteUrl
      mediaListEntry {
        id
        status
      }
    }
  }
}`