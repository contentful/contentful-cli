const { readdirSync } = require('fs')
const { join } = require('path')

// yargs commandDir requires every command module on each run, so these
// must only be loaded inside handlers
jest.mock('inquirer', () => {
  throw new Error('inquirer loaded at startup')
})
jest.mock('inquirer-autocomplete-prompt', () => {
  throw new Error('inquirer-autocomplete-prompt loaded at startup')
})
jest.mock('contentful-import', () => {
  throw new Error('contentful-import loaded at startup')
})
jest.mock('contentful-export', () => {
  throw new Error('contentful-export loaded at startup')
})
jest.mock('contentful-migration/built/bin/cli', () => {
  throw new Error('contentful-migration loaded at startup')
})
jest.mock('contentful-management', () => {
  throw new Error('contentful-management loaded at startup')
})
jest.mock('https-proxy-agent', () => {
  throw new Error('https-proxy-agent loaded at startup')
})
jest.mock('boxen', () => {
  throw new Error('boxen loaded at startup')
})
jest.mock('open', () => {
  throw new Error('open loaded at startup')
})
jest.mock('cli-highlight', () => {
  throw new Error('cli-highlight loaded at startup')
})
jest.mock('../../../lib/core/events', () => {
  throw new Error('core/events loaded at startup')
})

const cmdsDir = join(__dirname, '../../../lib/cmds')

function commandModules(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) {
      return entry.name.endsWith('_cmds') ? commandModules(path) : []
    }
    return /\.[jt]s$/.test(entry.name) ? [path] : []
  })
}

test.each(
  commandModules(cmdsDir).map(path => [path.slice(cmdsDir.length + 1)])
)('%s loads without heavy dependencies', file => {
  expect(() => require(join(cmdsDir, file))).not.toThrow()
})
