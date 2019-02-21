import { migration } from '../../../../lib/cmds/space_cmds/migration'

import { version } from '../../../../package.json'
import { getContext } from '../../../../lib/context'
import runMigration from 'contentful-migration/built/bin/cli'

jest.mock('../../../../lib/context')
jest.mock('contentful-migration/built/bin/cli')

getContext.mockResolvedValue({ cmaToken: 'managementToken' })

test('it should pass all args to the migration', async () => {
  const stubArgv = {
    managementToken: 'managementToken',
    managementApplication: `contentful.cli/${version}`,
    spaceId: 'spaceId',
    managementFeature: 'space-migration'
  }
  await migration(stubArgv)
  expect(runMigration.mock.calls[0][0]).toEqual(stubArgv)
  expect(runMigration).toHaveBeenCalledTimes(1)
})
