import test from 'ava'
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

test.before(() => {
  setContext({cmaToken: 'managementToken'})
  migrationRewireAPI.__Rewire__('runMigration', migrationStub)
})

test.after(() => {
  emptyContext()
  migrationRewireAPI.__ResetDependency__('runMigration')
})
test('it should pass all args to the migration', async (t) => {
  const stubArgv = {
    accessToken: 'managementToken',
    managementApplication: `contentful.cli/${version}`,
    spaceId: 'spaceId'
  }
  await migration(stubArgv)
  t.deepEqual(migrationStub.args[0][0], stubArgv)
  t.is(migrationStub.callCount, 1)
})
