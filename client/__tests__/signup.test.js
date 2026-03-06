const React = require('react')
const { render } = require('@testing-library/react')
const SignupMod = require('../pages/signup')
const Signup = SignupMod.default || SignupMod

test('Signup page renders', () => {
  const { container } = render(React.createElement(Signup))
  expect(container).toBeTruthy()
})
