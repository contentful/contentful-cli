import { addHandler } from '../../../../lib/cmds/config_cmds/add'
import {
  setContext,
  getContext,
  storeRuntimeConfig
} from '../../../../lib/context'
import { success } from '../../../../lib/utils/log'
import { successEmoji } from '../../../../lib/utils/emojis'

jest.mock('../../../../lib/context')
jest.mock('../../../../lib/utils/log')

getContext.mockResolvedValue({})
storeRuntimeConfig.mockResolvedValue()

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
  expect(success).toHaveBeenCalledWith(`${successEmoji} config removed successfully`)
})
