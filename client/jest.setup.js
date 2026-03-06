// Centralized test setup and mocks
// - Add jest-dom matchers
// - Provide browser globals used in components
// - Silence Next.js Image/Link related warnings by mocking their behavior

// In v6+ of @testing-library/jest-dom the package exports the matchers directly.
// Importing the package registers the jest-dom matchers (no /extend-expect path).
require('@testing-library/jest-dom')

// Mock window APIs commonly used in components
if (typeof window !== 'undefined') {
  // matchMedia mock
  window.matchMedia = window.matchMedia || function () {
    return {
      matches: false,
      addListener: function () {},
      removeListener: function () {},
      addEventListener: function () {},
      removeEventListener: function () {},
      dispatchEvent: function () { return false }
    };
  };

  // scrollTo mock
  window.scrollTo = window.scrollTo || function () {}

  // localStorage mock
  const localStorageMock = (function () {
    let store = {}
    return {
      getItem(key) { return store[key] || null },
      setItem(key, value) { store[key] = value?.toString() },
      removeItem(key) { delete store[key] },
      clear() { store = {} }
    }
  })()
  Object.defineProperty(window, 'localStorage', { value: localStorageMock })
}

// Provide a global fetch fallback for tests that indirectly call it
global.fetch = global.fetch || jest.fn(() => Promise.resolve({ json: () => ({}) }))

// Mock next/router useRouter to avoid "NextRouter was not mounted" errors when
// rendering page components in tests that don't wrap with Next's Router.
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    prefetch: jest.fn().mockResolvedValue(undefined),
    pathname: '/',
    query: {},
    asPath: '/',
    replace: jest.fn(),
  }),
}))

// Silence console warnings for Next <Image> props leaking to DOM
const originalWarn = console.warn
console.warn = (...args) => {
  const msg = args[0] && args[0].toString()
  if (msg && (msg.includes('has legacy prop "layout"') || msg.includes('fetchPriority'))) {
    return
  }
  originalWarn.apply(console, args)
}
