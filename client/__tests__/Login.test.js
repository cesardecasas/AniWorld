const React = require('react')
const { render } = require('@testing-library/react')
const LoginMod = require('../pages/Login')
const Login = LoginMod.default || LoginMod

test('Login page renders', () => {
  const { container } = render(React.createElement(Login))
  expect(container).toBeTruthy()
})
