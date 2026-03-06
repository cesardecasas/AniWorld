const React = require('react')
const { render } = require('@testing-library/react')
const MangaIndexCardMod = require('../components/cards/MangaIndexCard')
const MangaIndexCard = MangaIndexCardMod.default || MangaIndexCardMod

const mockAtt = { title: { en: 'Test Manga' } }

test('MangaIndexCard renders', () => {
  const { container } = render(React.createElement(MangaIndexCard, { id: '1', relationships: [], att: mockAtt }))
  expect(container).toBeTruthy()
})
