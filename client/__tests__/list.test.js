const React = require('react')
const { render } = require('@testing-library/react')
const ListPageMod = require('../pages/list/[id]')
const ListPage = ListPageMod.default || ListPageMod

test('List page renders', () => {
  const list = { anime_id: [] }
  const manga = []
  const props = { list, currentUser: null, manga }
  const { container } = render(React.createElement(ListPage, props))
  expect(container).toBeTruthy()
})

