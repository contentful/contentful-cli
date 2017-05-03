import test from 'ava'
import { stub } from 'sinon'
import inquirer from 'inquirer'
import streamBuffers from 'stream-buffers'

import {
  downloadBoilerplate,
  __RewireAPI__ as boilerplateRewireAPI
} from '../../lib/cmds/boilerplate'
import {
  emptyContext,
  setContext,
  __RewireAPI__ as contextRewireAPI
} from '../../lib/context'
import { PreconditionFailedError } from '../../lib/utils/error'

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
  getSpace: stub().returns(mockedSpace)
}
const createClientStub = stub().returns(fakeClient)
const promptStub = stub(inquirer, 'prompt').returns({boilerplate: mockedBoilerplate.sys.id})
const writeFileStub = stub()
const statStub = stub().rejects()
const axiosStub = stub()
const createWriteStreamStub = stub().callsFake(() => new streamBuffers.WritableStreamBuffer())

test.before(() => {
  boilerplateRewireAPI.__Rewire__('inquirer', inquirer)
  boilerplateRewireAPI.__Rewire__('createClient', createClientStub)
  boilerplateRewireAPI.__Rewire__('axios', axiosStub)
  boilerplateRewireAPI.__Rewire__('createWriteStream', createWriteStreamStub)
  contextRewireAPI.__Rewire__('stat', statStub)
  contextRewireAPI.__Rewire__('writeFile', writeFileStub)
})

test.beforeEach(() => {
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

test.after.always(() => {
  boilerplateRewireAPI.__ResetDependency__('inquirer')
  boilerplateRewireAPI.__ResetDependency__('createClient')
  boilerplateRewireAPI.__ResetDependency__('axios')
  boilerplateRewireAPI.__ResetDependency__('createWriteStream')
  contextRewireAPI.__ResetDependency__('stat')
  contextRewireAPI.__ResetDependency__('writeFile')
})

test.afterEach((t) => {
  fakeClient.getSpace.resetHistory()
  mockedSpace.getApiKeys.resetHistory()
  mockedSpace.createApiKey.resetHistory()
  axiosStub.resetHistory()
  promptStub.resetHistory()
  statStub.resetHistory()
  writeFileStub.resetHistory()
})

test.serial('successfully downloads boilerplate with existing api key', async (t) => {
  setContext({
    cmaToken: 'mocked'
  })
  await downloadBoilerplate({
    spaceId: mockedSpace.sys.id
  })
  t.is(axiosStub.callCount, 2, 'axios called twice')
  t.is(createWriteStreamStub.callCount, 1, 'boilerplate is written to disk')
  t.false(mockedSpace.createApiKey.called, 'did not create a new api key')
})

test.serial('requires login', async (t) => {
  setContext({
    cmaToken: null
  })
  const error = await t.throws(downloadBoilerplate({}), PreconditionFailedError, 'throws precondition failed error')
  t.truthy(error.message.includes('You have to be logged in to do this'), 'throws not logged in error')
})

test.serial('requires spaceId and fails without', async (t) => {
  setContext({
    cmaToken: 'mocked'
  })
  const error = await t.throws(downloadBoilerplate({}), PreconditionFailedError, 'throws precondition failed error')
  t.truthy(error.message.includes('You need to provide a space id'), 'throws not logged in error')
})

test.serial('requires spaceId and accepts it from context', async (t) => {
  setContext({
    cmaToken: 'mocked',
    activeSpaceId: 'mocked'
  })
  await t.notThrows(downloadBoilerplate({}), 'works with space id provided via context')
})

test.serial('requires spaceId and accepts it from argv arguments', async (t) => {
  setContext({
    cmaToken: 'mocked'
  })
  await t.notThrows(downloadBoilerplate({
    spaceId: 'mocked'
  }), 'works with space id provided via arguments')
})
