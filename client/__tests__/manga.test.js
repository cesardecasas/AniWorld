const React = require('react')
const { render } = require('@testing-library/react')
const MangaMod = require('../pages/manga')
const Manga = MangaMod.default || MangaMod

test('Manga page renders', () => {
  const { container } = render(React.createElement(Manga))
  expect(container).toBeTruthy()
})
