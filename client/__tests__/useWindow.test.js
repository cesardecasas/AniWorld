const React = require('react')
const { render } = require('@testing-library/react')
const useWindowDimensions = require('../components/customHooks/useWindow')

function TestComp() {
  const dims = useWindowDimensions.default || useWindowDimensions
  const val = dims()
  return React.createElement('div', { 'data-testid': 'dims' }, JSON.stringify(val))
}

test('useWindowDimensions hook returns an object with width and height', () => {
  const { getByTestId } = render(React.createElement(TestComp))
  const el = getByTestId('dims')
  expect(el.textContent).toContain('width')
  expect(el.textContent).toContain('height')
})
