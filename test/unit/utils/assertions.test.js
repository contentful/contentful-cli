import { assertLoggedIn, assertSpaceIdProvided } from '../../../lib/utils/assertions'

import { getContext } from '../../../lib/context'
import { highlightStyle } from '../../../lib/utils/styles'

jest.mock('../../../lib/context')
jest.mock('../../../lib/utils/styles')

getContext.mockResolvedValue({
  cmaToken: 'mockedToken'
})

afterEach(() => {
  highlightStyle.mockClear()
  getContext.mockClear()
})

test('assertLoggedIn when not logged in', async () => {
  getContext.mockResolvedValueOnce({})
  await expect(assertLoggedIn()).rejects.toThrowErrorMatchingSnapshot()
})

test('assertLoggedIn when logged in', async () => {
  await expect(assertLoggedIn)
})

test('assertSpaceIdProvided when provided via args', async () => {
  await assertSpaceIdProvided({
    spaceId: 'mocked spaceId'
  })
})

test('assertSpaceIdProvided when provided via context', async () => {
  getContext.mockResolvedValueOnce({
    activeSpaceId: 'space id',
    cmaToken: 'mockedToken'
  })
  await assertSpaceIdProvided()
})

test('assertSpaceIdProvided when not provided at all', async () => {
  await expect(assertSpaceIdProvided({})).rejects.toThrowErrorMatchingSnapshot()
})
