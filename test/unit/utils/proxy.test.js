import test from 'ava'
import {
  proxyStringToObject,
  proxyObjectToString,
  __get__ as getUnexported
} from '../../../lib/utils/proxy'

const parseAuth = getUnexported('parseAuth')

test('proxyString with basic auth, with protocol', (t) => {
  const proxyString = 'http://foo:bar@127.0.0.1:8213'
  const parsed = proxyStringToObject(proxyString)
  const stringified = proxyObjectToString(parsed)

  const expectedStringified = 'foo:bar@127.0.0.1:8213'
  const expectedParsed = {
    host: '127.0.0.1',
    port: 8213,
    auth: {
      username: 'foo',
      password: 'bar'
    }
  }

  t.deepEqual(parsed, expectedParsed, 'proxy url gets parsed')
  t.deepEqual(stringified, expectedStringified, 'serializes back to input')
})

test('proxyString without auth, with protocol', (t) => {
  const proxyString = 'http://127.0.0.1:8213'
  const parsed = proxyStringToObject(proxyString)
  const stringified = proxyObjectToString(parsed)

  const expectedStringified = '127.0.0.1:8213'
  const expected = {
    host: '127.0.0.1',
    port: 8213
  }

  t.deepEqual(parsed, expected, 'proxy url gets parsed')
  t.deepEqual(stringified, expectedStringified, 'serializes back to input')
})

test('proxyString with basic auth, without protocol', (t) => {
  const proxyString = 'foo:bar@127.0.0.1:8213'
  const parsed = proxyStringToObject(proxyString)
  const stringified = proxyObjectToString(parsed)

  const expectedStringified = 'foo:bar@127.0.0.1:8213'
  const expectedParsed = {
    host: '127.0.0.1',
    port: 8213,
    auth: {
      username: 'foo',
      password: 'bar'
    }
  }

  t.deepEqual(parsed, expectedParsed, 'proxy url gets parsed')
  t.deepEqual(stringified, expectedStringified, 'serializes back to input')
})

test('proxyString without auth, without protocol', (t) => {
  const proxyString = '127.0.0.1:8213'
  const parsed = proxyStringToObject(proxyString)
  const stringified = proxyObjectToString(parsed)

  const expectedStringified = '127.0.0.1:8213'
  const expected = {
    host: '127.0.0.1',
    port: 8213
  }

  t.deepEqual(parsed, expected, 'proxy url gets parsed')
  t.deepEqual(stringified, expectedStringified, 'serializes back to input')
})

test('parseAuth with null (empty auth in url.parse)', (t) => {
  const { username, password } = parseAuth(null)
  t.falsy(username)
  t.falsy(password)
})

test('parseAuth with username', (t) => {
  const { username, password } = parseAuth('user')
  t.is(username, 'user')
  t.falsy(password)
})

test('parseAuth with username & password', (t) => {
  const { username, password } = parseAuth('user:53cr37')
  t.is(username, 'user')
  t.is(password, '53cr37')
})
