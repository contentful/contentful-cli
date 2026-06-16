const nixt = require('nixt')
const { join } = require('path')

const bin = join(__dirname, '../../../../', 'bin')

const app = () =>
  nixt({ newlines: true }).cwd(bin).base('./contentful.js ').clone()

test('asset --help shows subcommands', done => {
  app()
    .run('asset --help')
    .code(0)
    .stdout(/list/)
    .stdout(/get/)
    .stdout(/upload/)
    .stdout(/update/)
    .stdout(/publish/)
    .stdout(/unpublish/)
    .stdout(/delete/)
    .end(done)
})

test('asset -h shows subcommands', done => {
  app().run('asset -h').code(0).stdout(/list/).stdout(/get/).end(done)
})

test('asset --help shows List assets description', done => {
  app()
    .run('asset --help')
    .code(0)
    .stdout(/List assets/)
    .end(done)
})

test('asset --help shows Get a single asset description', done => {
  app()
    .run('asset --help')
    .code(0)
    .stdout(/Get a single asset/)
    .end(done)
})

test('asset --help shows Upload and create an asset description', done => {
  app()
    .run('asset --help')
    .code(0)
    .stdout(/Upload and create an asset/)
    .end(done)
})

test('asset --help shows Update an asset description', done => {
  app()
    .run('asset --help')
    .code(0)
    .stdout(/Update an asset/)
    .end(done)
})

test('asset --help shows Publish an asset description', done => {
  app()
    .run('asset --help')
    .code(0)
    .stdout(/Publish an asset/)
    .end(done)
})

test('asset --help shows Unpublish an asset description', done => {
  app()
    .run('asset --help')
    .code(0)
    .stdout(/Unpublish an asset/)
    .end(done)
})

test('asset --help shows Delete an asset description', done => {
  app()
    .run('asset --help')
    .code(0)
    .stdout(/Delete an asset/)
    .end(done)
})

test('asset list --help shows usage', done => {
  app()
    .run('asset list --help')
    .code(0)
    .expect(result => {
      expect(result.stdout).toMatch(/contentful asset list/)
    })
    .end(done)
})

test('asset get --help shows usage', done => {
  app()
    .run('asset get --help')
    .code(0)
    .expect(result => {
      expect(result.stdout).toMatch(/contentful asset get/)
    })
    .end(done)
})

test('asset upload --help shows usage and options', done => {
  app()
    .run('asset upload --help')
    .code(0)
    .expect(result => {
      expect(result.stdout).toMatch(/contentful asset upload/)
      expect(result.stdout).toMatch(/--file/)
      expect(result.stdout).toMatch(/--title/)
    })
    .end(done)
})

test('asset update --help shows usage and options', done => {
  app()
    .run('asset update --help')
    .code(0)
    .expect(result => {
      expect(result.stdout).toMatch(/contentful asset update/)
      expect(result.stdout).toMatch(/--fields/)
      expect(result.stdout).toMatch(/--version/)
    })
    .end(done)
})

test('asset publish --help shows usage', done => {
  app()
    .run('asset publish --help')
    .code(0)
    .expect(result => {
      expect(result.stdout).toMatch(/contentful asset publish/)
    })
    .end(done)
})

test('asset unpublish --help shows usage', done => {
  app()
    .run('asset unpublish --help')
    .code(0)
    .expect(result => {
      expect(result.stdout).toMatch(/contentful asset unpublish/)
    })
    .end(done)
})

test('asset delete --help shows usage', done => {
  app()
    .run('asset delete --help')
    .code(0)
    .expect(result => {
      expect(result.stdout).toMatch(/contentful asset delete/)
    })
    .end(done)
})
