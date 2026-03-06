const React = require('react')

// Simple next/image mock that renders a plain img for tests.
// It accepts string src or object-style src and forwards other props.
function NextImage(props) {
  const { src, alt = '', width, height, className, 'data-testid': dataTestId } = props
  let resolvedSrc = ''
  if (!src) resolvedSrc = ''
  else if (typeof src === 'string') resolvedSrc = src
  else if (src && typeof src === 'object' && src.src) resolvedSrc = src.src

  const style = {}
  if (width) style.width = width
  if (height) style.height = height

  return React.createElement('img', { src: resolvedSrc, alt, style, className, 'data-testid': dataTestId })
}

module.exports = NextImage
