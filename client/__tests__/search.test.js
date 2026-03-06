const React = require('react')
const { render } = require('@testing-library/react')
const SearchMod = require('../pages/search/[type]')
const Search = SearchMod.default || SearchMod

test('Search page renders', () => {
  const { container } = render(React.createElement(Search, { results: [], resultsManga: [] }))
  expect(container).toBeTruthy()
})
