const { removeHandler } = require('../../../../lib/cmds/config_cmds/remove.mjs')
const {
  setContext,
  storeRuntimeConfig
} = require('../../../../lib/context.mjs')
const { success } = require('../../../../lib/utils/log.mjs')
const { successEmoji } = require('../../../../lib/utils/emojis.mjs')

jest.mock('../../../../lib/context.mjs')
jest.mock('../../../../lib/utils/log.mjs')

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
