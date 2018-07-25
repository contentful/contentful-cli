import test from 'ava'
import nixt from 'nixt'
import { join } from 'path'
import { readFile, writeFile, unlink } from 'mz/fs'

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

test.before('Setup config file', async () => {
  try {
    oldConfigContents = await readFile(testConfigPath)
  } catch (e) {
    // if file doesn't exist, we don't need to save old contents
  }
  await writeFile(testConfigPath, JSON.stringify(testConfig, null, 2))
})

test.after.always('Remove or reset test config file', async () => {
  if (!oldConfigContents) {
    return unlink(testConfigPath)
  }
  await writeFile(testConfigPath, oldConfigContents)
})

test.cb('Should list configs from first found config file', t => {
  app()
    .run('config list')
    .code(0)
    .expect(result => {
      const resultText = result.stdout.trim()
      t.true(resultText.includes(testConfig.cmaToken) && resultText.includes(testConfig.activeSpaceId), 'result should contain test values')
    })
    .end(t.end)
})
