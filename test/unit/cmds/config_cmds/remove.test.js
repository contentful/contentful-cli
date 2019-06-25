import { removeHandler } from '../../../../lib/cmds/config_cmds/remove'
import {
  setContext,
  storeRuntimeConfig
} from '../../../../lib/context'
import { success } from '../../../../lib/utils/log'
import { successEmoji } from '../../../../lib/utils/emojis'

jest.mock('../../../../lib/context')
jest.mock('../../../../lib/utils/log')

storeRuntimeConfig.mockResolvedValue()

test('config remove command', async () => {
  await removeHandler({context: {cmaToken: 'cmaToken'}, proxy: true})
  expect(setContext.mock.calls[0][0]).toEqual({cmaToken: 'cmaToken'})
  expect(success).toHaveBeenCalledWith(`${successEmoji} config removed successfully`)
})
