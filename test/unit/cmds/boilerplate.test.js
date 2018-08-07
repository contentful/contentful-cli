import { stub } from 'sinon'
import inquirer from 'inquirer'
import streamBuffers from 'stream-buffers'

import {
  downloadBoilerplate,
  __RewireAPI__ as boilerplateRewireAPI
} from '../../../lib/cmds/boilerplate'
import {
  __RewireAPI__ as accessTokenCreateRewireAPI
} from '../../../lib/cmds/space_cmds/accesstoken_cmds/create'
import {
  emptyContext,
  setContext,
  __RewireAPI__ as contextRewireAPI
} from '../../../lib/context'
import { PreconditionFailedError } from '../../../lib/utils/error'

const mockedBoilerplate = {
  sys: {
    id: 'mockedBoilerplateId'
  },
  name: 'Mocked Boilerplate Name',
  description: 'Boilerplate description',
  instructions: 'Boilerplate installation instructions'
}
const mockedApiKey = {
  name: 'Boilerplate CDA key',
  accessToken: 'mockedAccessToken'
}
const mockedSpace = {
  name: 'Mocked space name',
  sys: {
    id: 'mockedSpaceId'
  },
  getApiKeys: stub().returns({
    items: [
      mockedApiKey
    ]
  }),
  createApiKey: stub().returns(mockedApiKey)
}
const fakeClient = {
  getSpace: stub().returns(mockedSpace),
  getApiKeys: stub().returns([{
    name: 'Mocked access token',
    description: 'Mocked access token',
    accessToken: 'mockedaccesstoken'
  }])
}
const createManagementClientStub = stub().returns(fakeClient)
const promptStub = stub(inquirer, 'prompt').returns({boilerplate: mockedBoilerplate.sys.id})
const writeFileStub = stub()
const statStub = stub().rejects()
const axiosStub = stub()
const createWriteStreamStub = stub().callsFake(() => new streamBuffers.WritableStreamBuffer())

beforeAll(() => {
  accessTokenCreateRewireAPI.__Rewire__('createManagementClient', createManagementClientStub)
  boilerplateRewireAPI.__Rewire__('inquirer', inquirer)
  boilerplateRewireAPI.__Rewire__('axios', axiosStub)
  boilerplateRewireAPI.__Rewire__('createWriteStream', createWriteStreamStub)
  contextRewireAPI.__Rewire__('stat', statStub)
  contextRewireAPI.__Rewire__('writeFile', writeFileStub)
})

beforeEach(() => {
  emptyContext()
  axiosStub.reset()
  axiosStub.onCall(0).resolves({
    data: {
      items: [mockedBoilerplate]
    }
  })
  const mockedBoilerplateStream = new streamBuffers.ReadableStreamBuffer()
  mockedBoilerplateStream.stop()
  axiosStub.onCall(1).resolves({
    data: mockedBoilerplateStream
  })
})

afterAll(() => {
  accessTokenCreateRewireAPI.__ResetDependency__('createClient')
  boilerplateRewireAPI.__ResetDependency__('inquirer')
  boilerplateRewireAPI.__ResetDependency__('createManagementClient')
  boilerplateRewireAPI.__ResetDependency__('axios')
  boilerplateRewireAPI.__ResetDependency__('createWriteStream')
  contextRewireAPI.__ResetDependency__('stat')
  contextRewireAPI.__ResetDependency__('writeFile')
})

afterEach(() => {
  fakeClient.getSpace.resetHistory()
  mockedSpace.getApiKeys.resetHistory()
  mockedSpace.createApiKey.resetHistory()
  axiosStub.resetHistory()
  promptStub.resetHistory()
  statStub.resetHistory()
  writeFileStub.resetHistory()
})

test(
  'successfully downloads boilerplate and generates access token',
  async () => {
    setContext({
      cmaToken: 'mocked'
    })
    await downloadBoilerplate({
      spaceId: mockedSpace.sys.id
    })
    expect(axiosStub.callCount).toBe(2)
    expect(createWriteStreamStub.callCount).toBe(1)
    expect(mockedSpace.createApiKey.called).toBe(true)
  }
)

test('requires login', async () => {
  setContext({
    cmaToken: null
  })
  try {
    await expect(downloadBoilerplate({})).rejects.toThrowError(PreconditionFailedError)
  } catch (error) {
    expect(error.message.includes('You have to be logged in to do this')).toBeTruthy()
  }
})

test('requires spaceId and fails without', async () => {
  setContext({
    cmaToken: 'mocked'
  })
  try {
    await expect(downloadBoilerplate({})).rejects.toThrowError(PreconditionFailedError)
  } catch (error) {
    expect(error.message.includes('You need to provide a space id')).toBeTruthy()
  }
})

test('requires spaceId and accepts it from context', async () => {
  setContext({
    cmaToken: 'mocked',
    activeSpaceId: 'mocked'
  })
  await expect(downloadBoilerplate).not.toThrowError('works with space id provided via context')
})

test('requires spaceId and accepts it from argv arguments', async () => {
  setContext({
    cmaToken: 'mocked'
  })
  await expect(() => downloadBoilerplate({
    spaceId: 'mocked'
  })).not.toThrowError('works with space id provided via arguments')
})
