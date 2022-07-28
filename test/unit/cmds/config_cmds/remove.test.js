const { removeHandler } = require('../../../../lib/cmds/config_cmds/remove.js')
const { setContext, storeRuntimeConfig } = require('../../../../lib/context.js')
const { success } = require('../../../../lib/utils/log.js')
const { successEmoji } = require('../../../../lib/utils/emojis.js')

jest.mock('../../../../lib/context.js')
jest.mock('../../../../lib/utils/log.js')

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
