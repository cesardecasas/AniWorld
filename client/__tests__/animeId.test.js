const React = require('react')
const { render, screen } = require('@testing-library/react')

// stub useEffect before importing the page so the module's imported useEffect
// (destructured at top-level) doesn't hold the original async implementation
const useEffectSpy = jest.spyOn(React, 'useEffect').mockImplementation(() => {})
const AnimeIdMod = require('../pages/anime/[id]')
const AnimeId = AnimeIdMod.default || AnimeIdMod

const anime = {
  id: '1', anilistId: 1, malId: 1,
  title: 'Test Anime', titleEnglish: null, titleNative: null, synopsis: 'syn',
  coverImage: 'https://s4.anilist.co/img.jpg', bannerImage: null,
  score: 8.6, rank: 12, popularityRank: 40, members: 1000, favourites: 50,
  format: 'TV', status: 'Finished Airing', episodes: 26, duration: 24,
  season: 'Spring', year: 1998, startDate: 'Apr 3, 1998', aired: 'Apr 3, 1998 – Apr 24, 1999',
  nextEpisode: null, source: 'Original', rating: null,
  genres: ['Action'], tags: ['Space'], studios: ['Sunrise'], producers: [],
  trailerUrl: null,
  relations: [{ relation: 'Sequel', id: '5', type: 'anime', title: 'Test Movie', coverImage: null }],
}

const baseProps = { authenticated: false, currentUser: null, ep: [], themes: { openings: ['1: "Tank!"'], endings: [] } }

afterAll(() => useEffectSpy.mockRestore())

test('AnimeId page renders details, theme songs and relations', () => {
  render(React.createElement(AnimeId, { ...baseProps, data: anime }))
  expect(screen.getByRole('heading', { level: 1, name: 'Test Anime' })).toBeInTheDocument()
  expect(screen.getByText(/Tank!/)).toBeInTheDocument()
  expect(screen.getByText('Test Movie')).toBeInTheDocument()
})

test('AnimeId page shows a retry state when data is unavailable', () => {
  render(React.createElement(AnimeId, { ...baseProps, data: null }))
  expect(screen.getByText(/temporarily unavailable/)).toBeInTheDocument()
})
