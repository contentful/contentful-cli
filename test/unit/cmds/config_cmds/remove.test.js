import { removeHandler } from '../../../../lib/cmds/config_cmds/remove'
import {
  setContext,
  getContext,
  storeRuntimeConfig
} from '../../../../lib/context'
import { success } from '../../../../lib/utils/log'

jest.mock('../../../../lib/context')
jest.mock('../../../../lib/utils/log')

getContext.mockResolvedValue({ cmaToken: 'cmaToken', proxy: {} })
storeRuntimeConfig.mockResolvedValue()

test('config remove command', async () => {
  await removeHandler({proxy: true})
  expect(setContext.mock.calls[0][0]).toEqual({cmaToken: 'cmaToken'})
  expect(success).toHaveBeenCalledWith('✨  config removed successfully')
})
