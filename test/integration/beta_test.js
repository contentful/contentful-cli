import test from 'ava'
import nixt from 'nixt'
import fs from 'fs-extra'
import Promise from 'bluebird'
import appRoot from 'app-root-path'
import { createClient } from 'contentful-management'
import { join } from 'path'

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
var activePatchFile = ''

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
  app()
    .run('login')
    .on(/A browser window will open where you will log in/).respond('Y\n')
    .on(/Paste your token here:/).respond(setup.cmaToken)
    .stdout(/Open a browser window now\? Yes/)
    .stdout(/Your CMA token is now stored on your system\./)
    .code(0)
    .end(t.end)
})

// Create a new space we’ll use as our development environment
// contentful space create --name <DEV-NAME> --org <ORG-ID>
test.cb('should create <DEV> space', t => {
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
test.cb('should create <STAGING> space', t => {
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
test.cb('should have <DEV> and <STAGING> as identical spaces', t => {
  app()
  .run(`space diff --space-id ${spaces.dev} --target-space ${spaces.stg}`)
  .stdout(/Your content types are identical/)
  .code(0)
  .end(t.end)
})

// Make a few changes to the DEV space’s content model:
// Now, try to diff the STAGING and DEV spaces:
test.cb('should add new CT to <DEV> space and has valid patch file', t => {
  var exportFile = `${appRoot}/test/integration/expected/export-new-ct.json`
  var expectedDir = `${appRoot}/test/integration/expected`
  app()
  .exec(`${bin}/contentful.js space import --space-id ${spaces.dev} --content-file ${exportFile}`)
  .run(`space diff --space-id ${spaces.dev} --target-space ${spaces.stg} \
        --generate-patch --patch-dir ${tmpFolder}/patches`)
  .expect((result) => {
    const resultText = result.stdout.trim()
    activePatchFile = extractPatchFile(resultText, 'NewCT')
    const expected = read(`${expectedDir}/patches/NewCT.json`)
    const actual = read(activePatchFile)
    t.is(actual, expected)
  })
  .end(t.end)
})

// Patch STAGING space with new content type
test.cb('should patch <STAGING> space and be identical with <DEV> after', t => {
  app()
  .run(`content-type patch --space-id ${spaces.stg} --patch-file ${activePatchFile} --yes`)
  .stdout(/Patches applied/)
  .stdout(/Patches published/)
  .code(0)
  .end(() => {
    app()
      .run(`space diff --space-id ${spaces.dev} --target-space ${spaces.stg}`)
      .stdout(/Your content types are identical/)
      .code(0)
      .end(t.end)
  })
})

test.cb('should generate a patch to add a new field', t => {
  t.plan(0)
  var fieldName = 'field_' + Date.now()
  var field = { id: fieldName, name: fieldName, type: 'Symbol' }
  addNewField(spaces.dev, 'blogPost', field).then(() => {
    app()
      .run(`space diff --space-id ${spaces.dev} --target-space ${spaces.stg}`)
      .stdout(new RegExp('"name": "' + field.name + '"'))
      .stdout(new RegExp('"type": "' + field.type + '"'))
      .code(0)
      .end(t.end)
  })
})

async function addNewField (spaceId, contentTypeId, field) {
  var space = await client.getSpace(spaceId)
  var contentType = await space.getContentType(contentTypeId)
  contentType.fields.push(field)
  contentType = await contentType.update()
  await contentType.publish()
}

function read (filepath) {
  return fs.readFileSync(filepath, 'utf-8').trim()
}

function extractId (text) {
  var regex = /successfully created space \w* \((.*)\)/i
  var found = text.match(regex)
  return found[1]
}

function extractPatchFile (text, contentType) {
  var regex = new RegExp(contentType + ' --> (.*) ')
  var found = text.match(regex)
  return found[1]
}
