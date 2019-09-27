const { removeHandler } = require('../../../../lib/cmds/config_cmds/remove')
const { setContext, storeRuntimeConfig } = require('../../../../lib/context')
const { success } = require('../../../../lib/utils/log')
const { successEmoji } = require('../../../../lib/utils/emojis')

jest.mock('../../../../lib/context')
jest.mock('../../../../lib/utils/log')

storeRuntimeConfig.mockResolvedValue()

test('config remove command', async () => {
  await removeHandler({
    context: { managementToken: 'managementToken' },
    proxy: true
  })
  expect(setContext.mock.calls[0][0]).toEqual({
    managementToken: 'managementToken'
  })
  expect(success).toHaveBeenCalledWith(
    `${successEmoji} config removed successfully`
  )
})
