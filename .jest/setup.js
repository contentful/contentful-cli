import { cleanUpTestSpaces } from '@contentful/integration-test-utils'
import { initConfig } from '../test/contentful-config'

beforeAll(() => {
  jest.useFakeTimers('modern')
  jest.setSystemTime(new Date(2013, 1, 1))

  return initConfig()
})

afterAll(async () => {
  return await cleanUpTestSpaces({ threshold: 60 * 1000 })
})
