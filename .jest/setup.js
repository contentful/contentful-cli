import { cleanUpTestSpaces } from '@contentful/integration-test-utils'
import { initConfig } from '../test/contentful-config'

// Unit tests don't need a live space, so skip cleanup without credentials
const hasCredentials = !!process.env.CONTENTFUL_INTEGRATION_TEST_CMA_TOKEN

beforeAll(async () => {
  if (!hasCredentials) return
  await cleanUpTestSpaces({ threshold: 60 * 1000 })
  return initConfig()
})

afterAll(async () => {
  if (!hasCredentials) return
  return await cleanUpTestSpaces({ threshold: 60 * 1000 })
})
