const React = require('react')
const { render } = require('@testing-library/react')
jest.mock('next/router', () => ({
  useRouter: () => ({
    asPath: '/search/anime=foo&page=1',
    query: { type: 'search/anime=foo&page=1' },
    pathname: '/',
    push: jest.fn(),
  }),
}))
const Pagination = require('../components/Pagination')
const Comp = Pagination.default || Pagination

test('Pagination renders Next and Previous links', () => {
  const { getByText } = render(React.createElement(Comp))
  expect(getByText(/Next/i)).toBeTruthy()
  expect(getByText(/Previous/i)).toBeTruthy()
})
