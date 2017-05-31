import test from 'ava'
import Promise from 'bluebird'
import appRoot from 'app-root-path'
import {createClient} from 'contentful-management'

var fs = require('fs-extra')
var join = require('path').join
var nixt = require('nixt')
var bin = join(__dirname, '../..', 'bin')

var app = function () {
  return nixt({ newlines: true }).cwd(bin).base('./contentful.js ').clone()
}

var setup = {
  cmaToken: process.env.CMA_TOKEN,
  activeSpaceId: process.env.ACTIVE_SPACE,
  orgId: process.env.ORG_ID
}
const tmpFolder = `${appRoot}/test/integration/expected/tmp`

const client = createClient({
  accessToken: setup.cmaToken
})

var spaces = {}
var spacesToDelete = []

test.before('add tmp folder', () => {
  fs.mkdirSync(tmpFolder)
})

test.after.always('remove tmp folder', t => {
  fs.removeSync(tmpFolder)
})

test.after.always('remove created spaces', async t => {
  await Promise.map(spacesToDelete, (spaceId) => {
    return client.getSpace(spaceId).then((space) => {
      return space.delete()
    }, (error) => {
      console.log('Can not find space to delete with id: ', spaceId, error)
    })
  })
})

// Login to the CLI
// `contentful login`
test.cb('should login', t => {
  console.log('cma token: ', setup.cmaToken)
  app()
    .run('login')
    .on(/A browser window will open where you will log in/).respond('Y\n')
    .on(/Paste your token here:/).respond(setup.cmaToken)
    .stdout(/Open a browser window now\? Yes/)
    .stdout(/Your CMA token is now stored on your system\./)
    .code(0)
    .end(t.end)
})

// Export the <PROD> space
// contentful space export --space-id <PROD>
// test.cb('should successfully export space', t => {
//   const output = `${appRoot.path}/test/integration/expected/tmp`;
//   app()
//   .run(`space export --export-dir ${output}`)
//   .stdout(/✨ Done/)
//   // .stdout(/Exported entities/)
//   // .stdout(/The export took a few seconds/)
//   // .exist(output + 'contentful-export-' + ex_space + '-' + date + '.json')
//   .end(t.end)
// });

// Create a new space we’ll use as our development environment
// contentful space create --name <DEV-NAME> --org <ORG-ID>
test.cb('should create dev space', t => {
  app()
  .run(`space create --name cli_test_dev_space --org ${setup.orgId}`)
  .expect((result) => {
    const resultText = result.stdout.trim()
    spaces.dev = extractId(resultText)
    console.log('created space id: ', spaces.dev)
    const regex = /Successfully created space cli_test_dev_space/
    t.regex(result.stdout.trim(), regex)
    spacesToDelete.push(spaces.dev)
  })
  .end(t.end)
})

// contentful space create --name <STAGING-NAME> --org <ORG-ID>
test.cb('should create staging space', t => {
  app()
  .run(`space create --name cli_test_stg_space --org ${setup.orgId}`)
  .expect((result) => {
    const resultText = result.stdout.trim()
    spaces.stg = extractId(resultText)
    console.log('created space id: ', spaces.stg)
    const regex = /Successfully created space cli_test_stg_space/
    t.regex(result.stdout.trim(), regex)
    spacesToDelete.push(spaces.stg)
  })
  .end(t.end)
})

// Import the previously exported structure to both DEV and STAGING spaces
// contentful space import --space-id <DEV>
test.cb('should import exported space <DEV>', t => {
  app()
  .run(`space import --space-id ${spaces.dev} --content-file ${appRoot}/test/integration/expected/export-init-space.json`)
  .stdout(/The following entities were imported/)
  .stdout(/Content Types {13}│ 2/)
  .stdout(/Editor Interfaces {9}│ 2/)
  .stdout(/Entries {19}│ 0/)
  .stdout(/Assets {20}│ 0/)
  .stdout(/Locales {19}│ 0/)
  .stdout(/Webhooks {18}│ 0/)
  .stdout(/Roles {21}│ 0/)
  .end(t.end)
})

// contentful space import --space-id <STAGING>
test.cb('should import exported space <STAGING>', t => {
  app()
  .run(`space import --space-id ${spaces.stg} --content-file ${appRoot}/test/integration/expected/export-init-space.json`)
  .stdout(/The following entities were imported/)
  .stdout(/Content Types {13}│ 2/)
  .stdout(/Editor Interfaces {9}│ 2/)
  .stdout(/Entries {19}│ 0/)
  .stdout(/Assets {20}│ 0/)
  .stdout(/Locales {19}│ 0/)
  .stdout(/Webhooks {18}│ 0/)
  .stdout(/Roles {21}│ 0/)
  .end(t.end)
})

// Compare imported spaces
test.cb('should be identical spaces', t => {
  app()
  .run(`space diff --space-id ${spaces.dev} --target-space ${spaces.stg}`)
  .stdout(/Your content types are identical/)
  .end(t.end)
})

// Make a few changes to the DEV space’s content model:
// Now, try to diff the STAGING and DEV spaces:
test.cb('should be diff with new ct', t => {
  var exportFile = `${appRoot}/test/integration/expected/export-new-ct.json`
  var expectedDir = `${appRoot}/test/integration/expected`
  app()
  .exec(`${bin}/contentful.js space import --space-id ${spaces.dev} --content-file ${exportFile}`)
  .run(`space diff --space-id ${spaces.dev} --target-space ${spaces.stg} \
        --generate-patch --patch-dir ${tmpFolder}/patches`)
  .expect((result) => {
    const expected = read(`${expectedDir}/patches/NewCT.json`)
    const actual = read(`${tmpFolder}/patches/NewCT.json`)
    t.is(actual, expected)
  })
  .end(t.end)
})

function read (filepath) {
  return fs.readFileSync(filepath, 'utf-8').trim()
}

function extractId (text) {
  var regex = /successfully created space \w* \((.*)\)/i
  var found = text.match(regex)
  return found[1]
}
