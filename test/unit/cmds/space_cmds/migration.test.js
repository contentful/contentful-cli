import { version } from '../../../../package.json'
import { stub } from 'sinon'
import {
  migration,
  __RewireAPI__ as migrationRewireAPI
} from '../../../../lib/cmds/space_cmds/migration'

import {
  emptyContext,
  setContext
} from '../../../../lib/context'

const migrationStub = stub().returns(Promise.resolve())

beforeAll(() => {
  setContext({cmaToken: 'managementToken'})
  migrationRewireAPI.__Rewire__('runMigration', migrationStub)
})

afterAll(() => {
  emptyContext()
  migrationRewireAPI.__ResetDependency__('runMigration')
})
test('it should pass all args to the migration', async () => {
  const stubArgv = {
    accessToken: 'managementToken',
    managementApplication: `contentful.cli/${version}`,
    spaceId: 'spaceId',
    managementFeature: 'space-migration'
  }
  await migration(stubArgv)
  expect(migrationStub.args[0][0]).toEqual(stubArgv)
  expect(migrationStub.callCount).toBe(1)
})
