const React = require('react')
const { render } = require('@testing-library/react')
const CheckBoxMod = require('../components/CheckBox')
const CheckBox = CheckBoxMod.default || CheckBoxMod

test('CheckBox renders', () => {
  const { container } = render(React.createElement(CheckBox))
  expect(container).toBeTruthy()
})
