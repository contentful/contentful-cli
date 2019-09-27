const {
  proxyStringToObject,
  proxyObjectToString
} = require('../../../lib/utils/proxy')

test('proxyString with basic auth, with protocol', () => {
  const proxyString = 'http://foo:bar@127.0.0.1:8213'
  const parsed = proxyStringToObject(proxyString)
  const stringified = proxyObjectToString(parsed)

  const expectedStringified = 'http://foo:bar@127.0.0.1:8213'
  const expectedParsed = {
    host: '127.0.0.1',
    port: 8213,
    isHttps: false,
    auth: {
      username: 'foo',
      password: 'bar'
    }
  }

  expect(parsed).toEqual(expectedParsed)
  expect(stringified).toEqual(expectedStringified)
})

test('proxyString without auth, with protocol', () => {
  const proxyString = 'http://127.0.0.1:8213'
  const parsed = proxyStringToObject(proxyString)
  const stringified = proxyObjectToString(parsed)

  const expectedStringified = 'http://127.0.0.1:8213'
  const expected = {
    host: '127.0.0.1',
    port: 8213,
    isHttps: false
  }

  expect(parsed).toEqual(expected)
  expect(stringified).toEqual(expectedStringified)
})

test('proxyString with basic auth, without protocol', () => {
  const proxyString = 'foo:bar@127.0.0.1:8213'
  const parsed = proxyStringToObject(proxyString)
  const stringified = proxyObjectToString(parsed)

  const expectedStringified = 'http://foo:bar@127.0.0.1:8213'
  const expectedParsed = {
    host: '127.0.0.1',
    port: 8213,
    isHttps: false,
    auth: {
      username: 'foo',
      password: 'bar'
    }
  }

  expect(parsed).toEqual(expectedParsed)
  expect(stringified).toEqual(expectedStringified)
})

test('proxyString without auth, without protocol', () => {
  const proxyString = '127.0.0.1:8213'
  const parsed = proxyStringToObject(proxyString)
  const stringified = proxyObjectToString(parsed)

  const expectedStringified = 'http://127.0.0.1:8213'
  const expected = {
    host: '127.0.0.1',
    port: 8213,
    isHttps: false
  }

  expect(parsed).toEqual(expected)
  expect(stringified).toEqual(expectedStringified)
})

test('parseAuth with null (empty auth in url.parse)', () => {
  const proxyString = '127.0.0.1:8213'
  const parsed = proxyStringToObject(proxyString)

  expect(parsed).not.toHaveProperty('auth')
})

test('parseAuth with username', () => {
  const proxyString = 'user@127.0.0.1:8213'
  const parsed = proxyStringToObject(proxyString)

  expect(parsed).toHaveProperty('auth')
  expect(parsed.auth.username).toBe('user')
  expect(parsed.auth.password).toBe(undefined)
})

test('parseAuth with username & password', () => {
  const proxyString = 'user:53cr37@127.0.0.1:8213'
  const parsed = proxyStringToObject(proxyString)

  expect(parsed).toHaveProperty('auth')
  expect(parsed.auth.username).toBe('user')
  expect(parsed.auth.password).toBe('53cr37')
})
