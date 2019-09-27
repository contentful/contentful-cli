const { homedir } = require('os')
const { join, resolve } = require('path')

const nixt = require('nixt')
const rimraf = require('rimraf')

const { initConfig, deleteSpaces } = require('../util')

const bin = join(__dirname, './../../../', 'bin')
const projectDirectoryName = 'contentful-integration-starter-DELETE-ME'

const app = () => {
  return nixt({ newlines: true })
    .cwd(bin)
    .base('./contentful.js ')
    .clone()
}

const spacesToDelete = []
beforeAll(() => {
  return initConfig()
})

afterAll(() => {
  return deleteSpaces(spacesToDelete)
})

test('should be already logged in and run all steps', done => {
  app()
    .run('guide')
    // step 2 createSpace
    .on(/Create your new Space now?/)
    .respond('\n')
    .on(/Do you want to confirm the space creation?/)
    .respond('\n')
    .expect(({ stdout }) => {
      const matches = /Successfully created space .+ \((.+)\)/.exec(stdout)
      if (!matches) {
        return new Error("Can't extract space id")
      }
      spacesToDelete.push(matches[1])
    })
    // step 3 seedContent
    .on(/Populate the Content model to your Space now?/)
    .respond('\n')
    .stdout(/(The Content model was applied to your .* Space\.)/)
    // step 4 setup
    .on(/The directory should be called:/)
    .respond(`${projectDirectoryName}\n`)
    .on(/Where should the '.*' directory be located?/)
    .respond('\n')
    .stdout(
      /Setting up project configuration file which includes your Contentful Delivery API token/
    )
    // step 5 run dev server
    .on(/Run Gatsby Starter Blog locally in development mode now?/)
    .respond('\n')
    .on(/You can now view .* in the browser./)
    .respond('Q')
    .stdout(/The guide is now completed/)
    .code(0)
    .end(() => {
      rimraf(resolve(homedir(), projectDirectoryName), done)
    })
}, 600000)
