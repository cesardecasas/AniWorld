const React = require('react')
const { render } = require('@testing-library/react')
const ListPageMod = require('../pages/list/[id]')
const ListPage = ListPageMod.default || ListPageMod

test('List page renders', () => {
  const props = { entries: [], currentUser: { id: 1, userName: 'tester' } }
  const { container } = render(React.createElement(ListPage, props))
  expect(container).toBeTruthy()
})

