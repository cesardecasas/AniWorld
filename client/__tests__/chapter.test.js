const React = require('react')
const { render } = require('@testing-library/react')
const ChapterMod = require('../pages/chapter/[id]')
const Chapter = ChapterMod.default || ChapterMod

test('Chapter page renders', () => {
  const baseURL = 'https://example.com'
  const chapter = { id: 'c1', attributes: { translatedLanguage: 'en' } }
  const chapters = [ { id: 'c1', attributes: { translatedLanguage: 'en', chapter: 1 } }, { id: 'c2', attributes: { translatedLanguage: 'en', chapter: 2 } } ]
  const chapterHash = { data: [] , hash: 'h' }
  const props = { baseURL, chapter, chapters, chapterHash }
  const { container } = render(React.createElement(Chapter, props))
  expect(container).toBeTruthy()
})

