const api = require('../pages/api/fetch')

test('api/fetch exports functions', () => {
  expect(typeof api.getUpcoming).toBe('function')
  expect(typeof api.getDetails).toBe('function')
  expect(typeof api.getMangaDetails).toBe('function')
})

