const React = require('react')
const { render } = require('@testing-library/react')
const FooterMod = require('../components/footer')
const Footer = FooterMod.default || FooterMod

test('Footer renders', () => {
  const { container } = render(React.createElement(Footer))
  expect(container).toBeTruthy()
})
