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

beforeAll(() => {
  contextRewireAPI.__Rewire__('readFile', readFileStub)
  contextRewireAPI.__Rewire__('writeFile', writeFileStub)
  spaceUseRewireAPI.__Rewire__('createManagementClient', createManagementClientMock)
})

afterAll(() => {
  contextRewireAPI.__ResetDependency__('readFile')
  contextRewireAPI.__ResetDependency__('writeFile')
  spaceUseRewireAPI.__ResetDependency__('createManagementClient')
})

afterEach(() => {
  readFileStub.resetHistory()
  writeFileStub.resetHistory()
})

test('it writes the enviroment id to contentfulrc.json', async () => {
  const stubArgv = {
    spaceId: 'test',
    managementToken: 'managementToken'
  }
  await spaceUse(stubArgv)
  expect(JSON.parse(writeFileStub.args[0][1]).activeSpaceId).toBe('test')
  expect(JSON.parse(writeFileStub.args[0][1]).activeEnvironmentId).toBe('master')
})
