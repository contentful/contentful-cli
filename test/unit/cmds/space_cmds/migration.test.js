import { migration } from '../../../../lib/cmds/space_cmds/migration'

import { version } from '../../../../package.json'
import { getContext } from '../../../../lib/context'
import runMigration from 'contentful-migration/built/bin/cli'

jest.mock('../../../../lib/context')
jest.mock('contentful-migration/built/bin/cli')

getContext.mockResolvedValue({ managementToken: 'managementToken' })

test('it should pass all args to the migration', async () => {
  const stubArgv = {
    context: {
      managementToken: 'managementToken',
      activeEnvironmentId: 'master',
      activeSpaceId: 'spaceId'
    },
    managementApplication: `contentful.cli/${version}`,
    managementFeature: 'space-migration'
  }
  await migration(stubArgv)
  const result = {
    ...stubArgv,
    spaceId: 'spaceId',
    environmentId: 'master',
    accessToken: 'managementToken'
  }
  expect(runMigration.mock.calls[0][0]).toEqual(result)
  expect(runMigration).toHaveBeenCalledTimes(1)
})
