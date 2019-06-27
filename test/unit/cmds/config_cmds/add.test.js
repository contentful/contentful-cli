import { addHandler } from '../../../../lib/cmds/config_cmds/add'
import {
  setContext,
  storeRuntimeConfig
} from '../../../../lib/context'
import { success } from '../../../../lib/utils/log'
import { successEmoji } from '../../../../lib/utils/emojis'

jest.mock('../../../../lib/context')
jest.mock('../../../../lib/utils/log')

storeRuntimeConfig.mockResolvedValue()

afterEach(() => {
  setContext.mockClear()
  storeRuntimeConfig.mockClear()
  success.mockClear()
})

test('config add command', async () => {
  await addHandler({proxy: 'user:password@host:8080'})
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
  expect(success).toHaveBeenCalledWith(`${successEmoji} config added successfully`)
})
