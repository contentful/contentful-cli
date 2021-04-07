const { getHeadersFromOption } = require('../../../lib/utils/headers')

test('getHeadersFromOption returns empty object when value is undefined', () => {
  expect(getHeadersFromOption(undefined)).toEqual({})
})

test('getHeadersFromOption accepts single or multiple values', () => {
  expect(getHeadersFromOption('Accept: Any')).toEqual({ Accept: 'Any' })
  expect(getHeadersFromOption(['Accept: Any', 'X-Version: 1'])).toEqual({
    Accept: 'Any',
    'X-Version': '1'
  })
})

test('getHeadersFromOption ignores invalid headers', () => {
  expect(
    getHeadersFromOption(['Accept: Any', 'X-Version: 1', 'invalid'])
  ).toEqual({
    Accept: 'Any',
    'X-Version': '1'
  })
})

test('getHeadersFromOption trims spacing around keys & values', () => {
  expect(
    getHeadersFromOption([
      '  Accept:   Any   ',
      '   X-Version   :1 ',
      'invalid'
    ])
  ).toEqual({
    Accept: 'Any',
    'X-Version': '1'
  })
})
