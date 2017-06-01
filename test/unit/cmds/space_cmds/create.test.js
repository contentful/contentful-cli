import test from 'ava'
import { stub } from 'sinon'
import inquirer from 'inquirer'

import {
  spaceCreate,
  __RewireAPI__ as spaceCreateRewireAPI
} from '../../../../lib/cmds/space_cmds/create'
import {
  emptyContext,
  setContext
} from '../../../../lib/context'
import { PreconditionFailedError } from '../../../../lib/utils/error'

const getOrganizationsStub = stub()
const promptStub = stub(inquirer, 'prompt').returns({organizationId: 'mockedOrgTwo'})
const createSpaceStub = stub().returns({
  name: 'Mocked space name',
  sys: {
    id: 'MockedSpaceId'
  }
})

const fakeClient = {
  createSpace: createSpaceStub,
  getOrganizations: getOrganizationsStub
}
const createManagementClientStub = stub().returns(fakeClient)

test.before(() => {
  spaceCreateRewireAPI.__Rewire__('createManagementClient', createManagementClientStub)
  spaceCreateRewireAPI.__Rewire__('inquirer', inquirer)
})

test.after.always(() => {
  spaceCreateRewireAPI.__ResetDependency__('createManagementClient')
})

test.beforeEach((t) => {
  getOrganizationsStub.returns({
    items: [
      {
        name: 'Mocked Org #1',
        sys: {
          id: 'mockedOrgOne'
        }
      }
    ]
  })
})

test.afterEach.always((t) => {
  fakeClient.createSpace.resetHistory()
  createManagementClientStub.resetHistory()
  getOrganizationsStub.resetHistory()
  promptStub.resetHistory()
})

test.serial('create space with single org user', async (t) => {
  const spaceData = {
    name: 'space name'
  }
  emptyContext()
  setContext({
    cmaToken: 'mockedToken'
  })
  const result = await spaceCreate(spaceData)
  t.truthy(result, 'returned truthy value')
  t.true(createManagementClientStub.calledOnce, 'did create client')
  t.true(fakeClient.createSpace.calledOnce, 'created space')
  t.deepEqual(fakeClient.createSpace.args[0][0], spaceData, 'with correct payload')
  t.is(fakeClient.createSpace.args[0][1], undefined, 'without organization id')
  t.true(promptStub.notCalled, 'did not ask for user input')
})

test.serial('create space with multi org user', async (t) => {
  const spaceData = {
    name: 'space name'
  }
  getOrganizationsStub.returns({
    items: [
      {
        name: 'Mocked Org #1',
        sys: {
          id: 'mockedOrgOne'
        }
      },
      {
        name: 'Mocked Org #2',
        sys: {
          id: 'mockedOrgTwo'
        }
      }
    ]
  })
  emptyContext()
  setContext({
    cmaToken: 'mockedToken'
  })
  const result = await spaceCreate(spaceData)
  t.truthy(result, 'returned truthy value')
  t.true(createManagementClientStub.calledOnce, 'did create client')
  t.true(fakeClient.createSpace.calledOnce, 'created space')
  t.deepEqual(fakeClient.createSpace.args[0][0], spaceData, 'with correct payload')
  t.is(fakeClient.createSpace.args[0][1], 'mockedOrgTwo', 'with organization id')
  t.true(promptStub.called, 'did ask for user input')
})

test.serial('create space with passed organization id', async (t) => {
  const spaceData = {
    name: 'space name',
    organizationId: 'mockedOrganizationId'
  }
  emptyContext()
  setContext({
    cmaToken: 'mockedToken'
  })
  const result = await spaceCreate(spaceData)
  t.truthy(result, 'returned truthy value')
  t.true(createManagementClientStub.calledOnce, 'did create client')
  t.true(fakeClient.createSpace.calledOnce, 'created space')
  t.deepEqual(fakeClient.createSpace.args[0][0], {name: spaceData.name}, 'with correct payload')
  t.is(fakeClient.createSpace.args[0][1], 'mockedOrganizationId', 'with passed organization id')
  t.true(promptStub.notCalled, 'did not ask for user input')
})

test.serial('create space - fails when not logged in', async (t) => {
  emptyContext()
  setContext({
    cmaToken: null
  })
  const error = await t.throws(spaceCreate({}), PreconditionFailedError, 'throws precondition failed error')
  t.truthy(error.message.includes('You have to be logged in to do this'), 'throws not logged in error')
  t.true(createManagementClientStub.notCalled, 'did not create client')
  t.true(promptStub.notCalled, 'did not ask for user input')
})

test.serial('create space - throws error when sth goes wrong', async (t) => {
  const errorMessage = 'Unable to create space because of reasons'
  fakeClient.createSpace.reset()
  fakeClient.createSpace.throws(new Error(errorMessage))
  emptyContext()
  setContext({
    cmaToken: 'mockedToken'
  })
  await t.throws(spaceCreate({}), errorMessage, 'throws error')
  t.true(fakeClient.createSpace.calledOnce, 'tried to created space')
  t.true(promptStub.notCalled, 'did not ask for user input')
})
