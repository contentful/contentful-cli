import nixt from 'nixt'
import { join } from 'path'
import { readFile, writeFile, unlink } from 'mz/fs'
import { emptyContext } from '../../../../lib/context'

const bin = join(__dirname, './../../../../', 'bin')

const app = () => {
  return nixt({ newlines: true }).cwd(bin).base('./contentful.js ').clone()
}

let oldConfigContents = null
const testConfigPath = process.cwd() + '/.contentfulrc.json'
const testConfig = {
  cmaToken: 'blahblah12234553',
  activeSpaceId: '89898989'
}

async function before () {
  try {
    oldConfigContents = await readFile(testConfigPath)
  } catch (e) {
    // if file doesn't exist, we don't need to save old contents
  }
  return writeFile(testConfigPath, JSON.stringify(testConfig, null, 2))
}

async function after () {
  emptyContext()
  if (!oldConfigContents) {
    return unlink(testConfigPath)
  }
  return writeFile(testConfigPath, oldConfigContents)
}

test('Should list configs from first found config file', done => {
  app()
    .before(before)
    .run('config list')
    .code(0)
    .expect(result => {
      const resultText = result.stdout.trim()
      expect(
        resultText.includes(testConfig.cmaToken) && resultText.includes(testConfig.activeSpaceId)
      ).toBe(true)
    })
    .after(after)
    .end(done)
})
