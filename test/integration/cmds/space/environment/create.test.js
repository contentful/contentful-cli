import test from 'ava'
import nixt from 'nixt'
import { join } from 'path'
import {
  initConfig,
  deleteSpaces,
  extractSpaceId
} from '../../../util'

const bin = join(__dirname, './../../../../../', 'bin')

const app = () => {
  return nixt({ newlines: true }).cwd(bin).base('./contentful.js ').clone()
}

let spaceId = null

test.before('ensure config file exist and create space', async () => {
  await initConfig()

  const createSpace = new Promise((resolve, reject) => {
    try {
      app()
        .run('space create')
        .code(0)
        .expect(result => {
          const resultText = result.stderr.trim()
          spaceId = extractSpaceId(resultText)
          console.log({result, spaceId})
        })
        .end(resolve)
    } catch (err) {
      reject(err)
    }
  })
  await createSpace
})

test.after.always('remove created spaces', t => {
  return deleteSpaces([spaceId])
})

test.cb('should exit 1 when no args', t => {
  app()
    .run('space environment create')
    .code(1)
    .expect(result => {
      const resultText = result.stderr.trim()
      t.snapshot(resultText, 'help data is incorrect')
    })
    .end(t.end)
})

test.cb('should print help message', t => {
  app()
    .run('space environment create --help')
    .code(0)
    .expect(result => {
      const resultText = result.stdout.trim()
      t.snapshot(resultText, 'help data is incorrect')
    })
    .end(t.end)
})

test.cb('should create environment with id and name provided', t => {
  app()
    .run(`space environment create --space-id ${spaceId} --environment-id staging --name Staging`)
    .expect((result) => {
      const resultText = result.stdout.trim()
      t.snapshot(resultText)
    })
    .code(0)
    .end(t.end)
})

test.cb('should create space using shortcuts args', t => {
  app()
    .run(`space environment create -s ${spaceId} -e test -n test`)
    .expect((result) => {
      const resultText = result.stdout.trim()
      t.snapshot(resultText)
    })
    .code(0)
    .end(t.end)
})
