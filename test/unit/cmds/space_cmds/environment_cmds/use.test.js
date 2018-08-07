import { stub } from 'sinon'
import { __RewireAPI__ as contextRewireAPI } from '../../../../../lib/context'

import {
  environmentUse,
  __RewireAPI__ as environmentUseRewireAPI
} from '../../../../../lib/cmds/space_cmds/environment_cmds/use'

const MOCKED_RC = '{\n  "cmaToken": "mocked",\n  "activeSpaceId": "mocked"\n}\n'

const readFileStub = stub().resolves(MOCKED_RC)
const writeFileStub = stub()
const getEnvironment = stub().resolves({
  sys: {
    id: 'test'
  },
  name: 'test'
})
const getSpace = stub().resolves({
  sys: {
    id: 'mocked'
  },
  name: 'mocked',
  getEnvironment
})
const createManagementClientMock = stub().returns({ getSpace })

beforeAll(() => {
  contextRewireAPI.__Rewire__('readFile', readFileStub)
  contextRewireAPI.__Rewire__('writeFile', writeFileStub)
  environmentUseRewireAPI.__Rewire__('createManagementClient', createManagementClientMock)
})

afterAll(() => {
  contextRewireAPI.__ResetDependency__('readFile')
  contextRewireAPI.__ResetDependency__('writeFile')
  environmentUseRewireAPI.__ResetDependency__('createManagementClient')
})

afterEach(() => {
  readFileStub.resetHistory()
  writeFileStub.resetHistory()
})

test('it writes the enviroment id to contentfulrc.json', async () => {
  const stubArgv = {
    environmentId: 'test',
    managementToken: 'managementToken',
    spaceId: 'spaceId'
  }
  await environmentUse(stubArgv)
  expect(JSON.parse(writeFileStub.args[0][1]).activeEnvironmentId).toBe('test')
})
