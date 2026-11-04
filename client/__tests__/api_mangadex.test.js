const api = require('../lib/mangadex')

test('lib/mangadex exports functions', () => {
  expect(typeof api.getManga).toBe('function')
  expect(typeof api.getCover).toBe('function')
})
