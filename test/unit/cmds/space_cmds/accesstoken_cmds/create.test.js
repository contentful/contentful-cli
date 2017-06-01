import test from 'ava'
import { stub } from 'sinon'

import {
  accessTokenCreate,
  __RewireAPI__ as accessTokenCreateRewireAPI
} from '../../../../../lib/cmds/space_cmds/accesstoken_cmds/create'
import {
  emptyContext,
  setContext
} from '../../../../../lib/context'
import { PreconditionFailedError } from '../../../../../lib/utils/error'

const mockedAccessTokenData = {
  name: 'access token name',
  description: 'some example description'
}

const createApiKeyStub = stub().returns(mockedAccessTokenData)
const getApiKeysStub = stub()
const fakeClient = {
  getSpace: stub().returns({
    createApiKey: createApiKeyStub,
    getApiKeys: getApiKeysStub
  })
}
const createManagementClientStub = stub().returns(fakeClient)

test.before(() => {
  accessTokenCreateRewireAPI.__Rewire__('createManagementClient', createManagementClientStub)
})

test.after.always(() => {
  accessTokenCreateRewireAPI.__ResetDependency__('createManagementClient')
})

test.afterEach.always((t) => {
  fakeClient.getSpace.resetHistory()
  createManagementClientStub.resetHistory()
  createApiKeyStub.resetHistory()
  getApiKeysStub.reset()
})

test.serial('create new access token', async (t) => {
  getApiKeysStub.returns({
    items: []
  })
  emptyContext()
  setContext({
    cmaToken: 'mockedToken'
  })
  const result = await accessTokenCreate({
    ...mockedAccessTokenData,
    spaceId: 'some-space-id'
  })
  t.truthy(result, 'returned truthy value')
  t.true(createManagementClientStub.calledOnce, 'did create client')
  t.true(fakeClient.getSpace.calledOnce, 'loaded space')
  t.true(createApiKeyStub.calledOnce, 'created token')
  t.deepEqual(createApiKeyStub.args[0][0], mockedAccessTokenData, 'with correct payload')
})

test.serial('return existing access token', async (t) => {
  getApiKeysStub.returns({
    items: [mockedAccessTokenData]
  })
  emptyContext()
  setContext({
    cmaToken: 'mockedToken'
  })
  const result = await accessTokenCreate({
    ...mockedAccessTokenData,
    spaceId: 'some-space-id'
  })
  t.truthy(result, 'returned truthy value')
  t.true(createManagementClientStub.calledOnce, 'did create client')
  t.true(fakeClient.getSpace.calledOnce, 'loaded space')
  t.false(createApiKeyStub.called, 'did not create new token')
})

test.serial('create access token - fails when not logged in', async (t) => {
  getApiKeysStub.returns({
    items: [mockedAccessTokenData]
  })
  emptyContext()
  setContext({
    cmaToken: null
  })
  const error = await t.throws(accessTokenCreate({
    spaceId: 'some-space-id'
  }), PreconditionFailedError, 'throws precondition failed error')
  t.truthy(error.message.includes('You have to be logged in to do this'), 'throws not logged in error')
  t.true(createManagementClientStub.notCalled, 'did not create client')
  t.true(createApiKeyStub.notCalled, 'did try to create access token')
})

test.serial('create access token - requires space id', async (t) => {
  getApiKeysStub.returns({
    items: [mockedAccessTokenData]
  })
  emptyContext()
  setContext({
    cmaToken: 'mockedToken'
  })
  const error = await t.throws(accessTokenCreate({}), PreconditionFailedError, 'throws error')
  t.truthy(error.message.includes('You need to provide a space id'), 'throws space id required in error')
  t.true(createManagementClientStub.notCalled, 'did not create client')
  t.true(createApiKeyStub.notCalled, 'did try to create access token')
})

test.serial('create access token - throws error when sth goes wrong', async (t) => {
  const errorMessage = 'Unable to create access token because of reasons'
  getApiKeysStub.reset()
  getApiKeysStub.throws(new Error(errorMessage))
  emptyContext()
  setContext({
    cmaToken: 'mockedToken'
  })
  await t.throws(accessTokenCreate({
    spaceId: 'some-space-id'
  }), errorMessage, 'throws error')
  t.true(createManagementClientStub.calledOnce, 'created client')
  t.true(fakeClient.getSpace.calledOnce, 'tried to created space')
  t.false(createApiKeyStub.called, 'did not try to create access token since getApiKeys already failed')
})
