import test from 'ava'
import { stub } from 'sinon'
import { __RewireAPI__ as contextRewireAPI } from '../../../../lib/context'

import {
  spaceUse,
  __RewireAPI__ as spaceUseRewireAPI
} from '../../../../lib/cmds/space_cmds/use'

const MOCKED_RC = '{\n  "cmaToken": "mocked",\n  "activeSpaceId": "mocked"\n}\n'

const readFileStub = stub().resolves(MOCKED_RC)
const writeFileStub = stub()
const getSpace = stub().resolves({
  sys: {
    id: 'test'
  },
  name: 'mocked'
})
const createManagementClientMock = stub().returns({ getSpace })

test.before(() => {
  contextRewireAPI.__Rewire__('readFile', readFileStub)
  contextRewireAPI.__Rewire__('writeFile', writeFileStub)
  spaceUseRewireAPI.__Rewire__('createManagementClient', createManagementClientMock)
})

test.after.always(() => {
  contextRewireAPI.__ResetDependency__('readFile')
  contextRewireAPI.__ResetDependency__('writeFile')
  spaceUseRewireAPI.__ResetDependency__('createManagementClient')
})

test.afterEach((t) => {
  readFileStub.resetHistory()
  writeFileStub.resetHistory()
})

test('it writes the enviroment id to contentfulrc.json', async (t) => {
  const stubArgv = {
    spaceId: 'test',
    managementToken: 'managementToken'
  }
  await spaceUse(stubArgv)
  t.is(JSON.parse(writeFileStub.args[0][1]).activeSpaceId, 'test')
  t.is(JSON.parse(writeFileStub.args[0][1]).activeEnvironmentId, 'master')
})
