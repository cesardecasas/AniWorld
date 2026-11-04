const jikan = require('../lib/jikan')
const anilist = require('../lib/anime/anilist')

test('lib/jikan exports functions', () => {
  expect(typeof jikan.jikanGet).toBe('function')
  expect(typeof jikan.getJikanExtras).toBe('function')
})

test('parseAnimeId accepts MAL ids and al- prefixed AniList ids', () => {
  expect(anilist.parseAnimeId('52991')).toEqual({ idMal: 52991 })
  expect(anilist.parseAnimeId('al-154587')).toEqual({ id: 154587 })
  expect(anilist.parseAnimeId('../etc')).toBeNull()
  expect(anilist.parseAnimeId('12abc')).toBeNull()
})
