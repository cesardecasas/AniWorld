const React = require('react')
const { render } = require('@testing-library/react')
const { ErrorCard, Loader } = require('../components/ResponseHandlers')

test('ErrorCard renders message', () => {
  const { getByText } = render(React.createElement(ErrorCard, { msg: 'Items' }))
  expect(getByText(/No Items Found/i)).toBeTruthy()
})

test('Loader renders loading text', () => {
  const { getByText } = render(React.createElement(Loader))
  expect(getByText(/Loading.../i)).toBeTruthy()
})
