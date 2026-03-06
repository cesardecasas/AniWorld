const React = require('react')
const { render } = require('@testing-library/react')
const AppMod = require('../pages/_app')
const App = AppMod.default || AppMod

test('App component renders without crashing', () => {
  const Component = () => React.createElement('div', null, 'page')
  const pageProps = {}
  const { container } = render(React.createElement(App, { Component, pageProps }))
  expect(container).toBeTruthy()
})
