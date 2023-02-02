import { Environment, SpaceProps } from 'contentful-management'
import nixt from 'nixt'
import { join } from 'path'
import {
  createSimpleEnvironment,
  createSimpleSpace,
  deleteSpace,
  client
} from '../../util'
import { installApp } from '../../../../lib/utils/app-installation'

const MERGE_APP_ID = 'cQeaauOu1yUCYVhQ00atE'

const bin = join(__dirname, './../../../../', 'bin')

const app = () => {
  return nixt({ newlines: true }).cwd(bin).base('./contentful.js ').clone()
}

type Result = {
  stderr: string
  stdout: string
}

describe('merge export snapshots', () => {
  it('show the help properly', done => {
    app()
      .run('merge export --help')
      .code(0)
      .expect(({ stdout }: Result) => {
        const resultText = stdout.trim()
        expect(resultText).toMatchSnapshot('help data is incorrect')
      })
      .end(done)
  })
})

describe('merge export command args validation', () => {
  it('should exit 1 when no args', done => {
    app()
      .run('merge export')
      .code(1)
      .expect(({ stderr }: Result) => {
        const resultText = stderr.trim()
        expect(resultText).toContain('Usage: contentful merge export')
      })
      .end(done)
  })

  it('should exit 1 when no source environment', done => {
    app()
      .run('merge export --t target')
      .code(1)
      .expect(({ stderr }: Result) => {
        const resultText = stderr.trim()
        expect(resultText).toContain('Usage: contentful merge export')
      })
      .end(done)
  })

  it('should exit 1 when no target environment', done => {
    app()
      .run('merge export --s source')
      .code(1)
      .expect(({ stderr }: Result) => {
        const resultText = stderr.trim()
        expect(resultText).toContain('Usage: contentful merge export')
      })
      .end(done)
  })

  it('should exit 1 when no space id passed or in context', done => {
    app()
      .run('merge export --s source --t source')
      .code(1)
      .expect(({ stderr }: Result) => {
        const resultText = stderr.trim()
        expect(resultText).toContain('Error: You need to provide a space id')
      })
      .end(done)
  })

  it('should exit 1 when source and target are the same', done => {
    app()
      .run('merge export --s source --t source --space-id space')
      .code(1)
      .expect(({ stderr }: Result) => {
        const resultText = stderr.trim()
        expect(resultText).toContain(
          'Source and target environments cannot be the same.'
        )
      })
      .end(done)
  })
})

describe("merge export command's behavior", () => {
  let space: SpaceProps
  let environments: {
    source: Environment
    target: Environment
  }

  beforeAll(async () => {
    space = await createSimpleSpace('Space Delete')

    environments = {
      source: await createSimpleEnvironment(space.sys.id, 'source'),
      target: await createSimpleEnvironment(space.sys.id, 'target')
    }
  }, 15000)

  afterAll(async () => {
    await deleteSpace(space.sys.id)
  })

  it('does not install the app and exits if the user does not approve', done => {
    app()
      .run(
        `merge export -s ${environments.source.sys.id} -t ${environments.target.sys.id} --space-id ${space.sys.id}`
      )
      .on(/Do you want to install the merge app in both environments?/)
      .respond('n\n')
      .code(1)
      .expect(({ stderr }: Result) => {
        const resultText = stderr.trim()
        expect(resultText).toContain(
          'Merge app could not be installed in the environments.'
        )
      })
      .end(done)
  })

  it('does install the app if the user approves', done => {
    app()
      .run(
        `merge export -s ${environments.source.sys.id} -t ${environments.target.sys.id} --space-id ${space.sys.id}`
      )
      .on(/Do you want to install the merge app in both environments?/)
      .respond('y\n')
      .code(0)
      .expect(({ stdout }: Result) => {
        const resultText = stdout.trim()
        expect(resultText).toContain('Exporting environment migration.')
      })
      .end(done)
  })

  it('install the app in one envs and continues with exporting', done => {
    const resetEnvironments = async () => {
      environments = {
        source: await createSimpleEnvironment(space.sys.id, 'source'),
        target: await createSimpleEnvironment(space.sys.id, 'target')
      }
    }
    resetEnvironments()
      .then(() =>
        installApp(client, {
          spaceId: space.sys.id,
          environmentId: environments.source.sys.id,
          appId: MERGE_APP_ID
        })
      )
      .then(() =>
        app()
          .run(
            `merge export -s ${environments.source.sys.id} -t ${environments.target.sys.id} --space-id ${space.sys.id} --yes`
          )
          .expect(({ stdout }: Result) => {
            const resultText = stdout.trim()
            expect(resultText).toContain('Exporting environment migration.')
          })
          .end(done)
      )
  }, 10000)

  it('install the app in both envs and continues with exporting', done => {
    const resetEnvironments = async () => {
      environments = {
        source: await createSimpleEnvironment(space.sys.id, 'source'),
        target: await createSimpleEnvironment(space.sys.id, 'target')
      }
    }
    resetEnvironments().then(() =>
      app()
        .run(
          `merge export -s ${environments.source.sys.id} -t ${environments.target.sys.id} --space-id ${space.sys.id} --yes`
        )
        .expect(({ stdout }: Result) => {
          const resultText = stdout.trim()
          expect(resultText).toContain('Exporting environment migration.')
        })
        .end(done)
    )
  })
})
