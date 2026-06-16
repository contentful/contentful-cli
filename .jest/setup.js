import { cleanUpTestSpaces } from '@contentful/integration-test-utils'
import { initConfig } from '../test/contentful-config'

// Only run integration-test cleanup when credentials are available.
// Unit tests do not need this and should not fail because of missing tokens.
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
