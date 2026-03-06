const React = require('react')
const { render } = require('@testing-library/react')
jest.mock('next/router', () => ({
  useRouter: () => ({
    asPath: '/',
    query: {},
    pathname: '/',
    push: jest.fn(),
  }),
}))
const NavMod = require('../components/nav')
const Nav = NavMod.default || NavMod

test('Nav renders and handles props', () => {
  const props = {
    darkMode: false,
    setDarkMode: jest.fn(),
    authenticated: false,
    currentUser: null,
    setCurrentUser: jest.fn(),
    setAuthenticated: jest.fn(),
  }
  const { container } = render(React.createElement(Nav, props))
  expect(container).toBeTruthy()
})
