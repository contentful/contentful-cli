import { buildContext } from '../../../lib/utils/middlewares'

import { getContext } from '../../../lib/context'
import { highlightStyle } from '../../../lib/utils/styles'

jest.mock('../../../lib/context')
jest.mock('../../../lib/utils/styles')

getContext.mockResolvedValue({})

afterEach(() => {
  highlightStyle.mockClear()
  getContext.mockClear()
})

const defaults = {
  context: {
    activeEnvironmentId: 'master',
    host: 'api.contentful.com'
  }
}

test('useFlagsIfAvailable set defaults', async () => {
  const result = await buildContext({})
  expect(result).toEqual(defaults)
})

test('useFlagsIfAvailable set activeSpaceId (overwrite context)', async () => {
  getContext.mockResolvedValueOnce({
    activeSpaceId: 'spaceId'
  })
  const result = await buildContext({spaceId: 'activeSpaceId'})
  expect(result).toEqual({context: {...defaults.context, activeSpaceId: 'activeSpaceId'}})
})

test('useFlagsIfAvailable set activeSpaceId (from context)', async () => {
  getContext.mockResolvedValueOnce({
    activeSpaceId: 'spaceId'
  })
  const result = await buildContext({})
  expect(result).toEqual({context: {...defaults.context, activeSpaceId: 'spaceId'}})
})

test('useFlagsIfAvailable set managementToken (overwrite context)', async () => {
  getContext.mockResolvedValueOnce({
    cmaToken: 'cmaToken'
  })
  const result = await buildContext({managementToken: 'managementToken'})
  expect(result).toEqual({context: {...defaults.context, cmaToken: 'managementToken'}})
})

test('useFlagsIfAvailable set managementToken (from context)', async () => {
  getContext.mockResolvedValueOnce({
    cmaToken: 'cmaToken'
  })
  const result = await buildContext({})
  expect(result).toEqual({context: {...defaults.context, cmaToken: 'cmaToken'}})
})

test('useFlagsIfAvailable set activeEnvironmentId (overwrite context)', async () => {
  getContext.mockResolvedValueOnce({
    activeEnvironmentId: 'activeEnvironmentId'
  })
  const result = await buildContext({environmentId: 'environmentId'})
  expect(result).toEqual({context: {...defaults.context, activeEnvironmentId: 'environmentId'}})
})

test('useFlagsIfAvailable set activeEnvironmentId (from context)', async () => {
  getContext.mockResolvedValueOnce({
    activeEnvironmentId: 'activeEnvironmentId'
  })
  const result = await buildContext({})
  expect(result).toEqual({context: {...defaults.context, activeEnvironmentId: 'activeEnvironmentId'}})
})

test('useFlagsIfAvailable set host', async () => {
  const result = await buildContext({host: 'host'})
  expect(result).toEqual({context: {...defaults.context, host: 'host'}})
})
