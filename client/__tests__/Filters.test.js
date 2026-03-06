const React = require('react')
const { render } = require('@testing-library/react')
const FiltersMod = require('../components/Filters')
const Filters = FiltersMod.default || FiltersMod

test('Filters renders', () => {
  const { container } = render(React.createElement(Filters))
  expect(container).toBeTruthy()
})
