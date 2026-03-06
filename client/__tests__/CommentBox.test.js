const React = require('react')
const { render } = require('@testing-library/react')
const CommentBoxMod = require('../components/CommentBox')
const CommentBox = CommentBoxMod.default || CommentBoxMod

test('CommentBox renders', () => {
  const { container } = render(React.createElement(CommentBox))
  expect(container).toBeTruthy()
})
