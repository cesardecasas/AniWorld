const React = require('react')
const { render } = require('@testing-library/react')

// stub useEffect before importing the page so the module's imported useEffect
// (destructured at top-level) doesn't hold the original async implementation
const useEffectSpy = jest.spyOn(React, 'useEffect').mockImplementation(() => {})
const AnimeIdMod = require('../pages/anime/[id]')
const AnimeId = AnimeIdMod.default || AnimeIdMod

test('AnimeId page renders', () => {
  const data = { mal_id: 1, images: { jpg: { image_url: 'https://example.com/img.jpg' } }, title: 'Test Anime', synopsis: 'syn' }
  const props = { data, authenticated: false, currentUser: null, ep: [], pics: {}, AniList: {} }
  const { container } = render(React.createElement(AnimeId, props))
  expect(container).toBeTruthy()

  useEffectSpy.mockRestore()
})

