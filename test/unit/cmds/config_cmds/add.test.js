const { addHandler } = require('../../../../lib/cmds/config_cmds/add.mjs')
const {
  setContext,
  storeRuntimeConfig
} = require('../../../../lib/context.mjs')
const { success } = require('../../../../lib/utils/log.mjs')
const { successEmoji } = require('../../../../lib/utils/emojis.mjs')

jest.mock('../../../../lib/context.mjs')
jest.mock('../../../../lib/utils/log.mjs')

storeRuntimeConfig.mockResolvedValue()

afterEach(() => {
  setContext.mockClear()
  storeRuntimeConfig.mockClear()
  success.mockClear()
})

test('config add command', async () => {
  await addHandler({ proxy: 'user:password@host:8080' })
  const expectedProxy = {
    host: 'host',
    port: 8080,
    isHttps: false,
    auth: {
      username: 'user',
      password: 'password'
    }
  }
  expect(setContext.mock.calls[0][0].proxy).toEqual(expectedProxy)
  expect(success).toHaveBeenCalledWith(
    `${successEmoji} config added successfully`
  )
})
