const React = require('react')
const { render } = require('@testing-library/react')
const LayoutMod = require('../components/Layout')
const Layout = LayoutMod.default || LayoutMod

test('Layout renders children', () => {
  const { getByText } = render(React.createElement(Layout, null, React.createElement('div', null, 'Child Content')))
  expect(getByText(/Child Content/i)).toBeTruthy()
})
