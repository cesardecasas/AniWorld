const React = require('react')

// Simple next/link mock that renders an anchor containing children.
function NextLink(props) {
  const { href, children } = props
  return React.createElement('a', { href }, children)
}

module.exports = NextLink
