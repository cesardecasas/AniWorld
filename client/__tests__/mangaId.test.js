const React = require('react')
const { render } = require('@testing-library/react')

// stub useEffect before importing the page so the module's imported useEffect
// (destructured at top-level) doesn't hold the original async implementation
const useEffectSpy = jest.spyOn(React, 'useEffect').mockImplementation(() => {})
const MangaIdMod = require('../pages/manga/[mangaId]')
const MangaId = MangaIdMod.default || MangaIdMod

test('MangaId page renders', () => {
  const details = { id: 'm1', attributes: { year: '2020', description: { en: 'desc' }, title: { en: 'Test Manga' }, status: 'ongoing', publicationDemographic: 'shounen' } }
  const chapters = []
  const cover = { attributes: { fileName: 'coverfile' } }
  const props = { details, chapters, cover, currentUser: null, authenticated: false }
  const { container } = render(React.createElement(MangaId, props))
  expect(container).toBeTruthy()

  useEffectSpy.mockRestore()
})
