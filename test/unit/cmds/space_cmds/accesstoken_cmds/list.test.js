const {
  accessTokenList
} = require('../../../../../lib/cmds/space_cmds/accesstoken_cmds/list.js')
const { getContext } = require('../../../../../lib/context.js')
const {
  createManagementClient
} = require('../../../../../lib/utils/contentful-clients.js')
const { log } = require('../../../../../lib/utils/log.js')

jest.mock('../../../../../lib/context.js')
jest.mock('../../../../../lib/utils/contentful-clients.js')
jest.mock('../../../../../lib/utils/log.js')

const accessTokenData = {
  items: [
    {
      name: 'DemoSpace',
      description: 'API key',
      accessToken: 'DemoAccessToken123456789'
    }
  ]
}

let getAcccessTokensStub

const fakeClient = {
  getSpace: async () => ({
    getApiKeys: getAcccessTokensStub
  })
}

describe('space accesstoken list', () => {
  afterEach(() => {
    jest.resetAllMocks()
  })

  beforeEach(() => {
    getAcccessTokensStub = jest.fn().mockResolvedValue(accessTokenData)

    createManagementClient.mockResolvedValue(fakeClient)

    getContext.mockResolvedValue({
      managementToken: 'mockedToken'
    })
  })

  it('can pretty print console output', async () => {
    await accessTokenList({
      context: {
        activeSpaceId: 'someSpaceID'
      }
    })
    expect(createManagementClient).toHaveBeenCalledTimes(1)
    expect(getAcccessTokensStub).toHaveBeenCalledTimes(1)
    expect(log.mock.calls[0][0]).toContain(accessTokenData.items[0].name)
  })

  it('can silently output to sdtout', async () => {
    await accessTokenList({
      context: {
        activeSpaceId: 'someSpaceID'
      },
      silent: true
    })
    expect(createManagementClient).toHaveBeenCalledTimes(1)
    expect(getAcccessTokensStub).toHaveBeenCalledTimes(1)
    expect(log.mock.calls[0][0]).toContain(
      JSON.stringify(accessTokenData, null, 2)
    )
  })
})
