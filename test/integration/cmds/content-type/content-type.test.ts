const nixt = require('nixt')
const {join} = require('path')

const bin = join(__dirname, '../../../../', 'bin')

const app = () =>
  nixt({newlines: true}).cwd(bin).base('./contentful.js ').clone()

test('content-type --help shows subcommands', done => {
  app()
    .run('content-type --help')
    .code(0)
    .stdout(/list/)
    .stdout(/get/)
    .stdout(/create/)
    .stdout(/update/)
    .stdout(/publish/)
    .stdout(/delete/)
    .end(done)
})

test('content-type -h shows subcommands', done => {
  app()
    .run('content-type -h')
    .code(0)
    .stdout(/list/)
    .stdout(/get/)
    .end(done)
})

test('content-type --help shows Show a content type description', done => {
  app()
    .run('content-type --help')
    .code(0)
    .stdout(/Show a content type/)
    .end(done)
})

test('content-type --help shows Create a content type description', done => {
  app()
    .run('content-type --help')
    .code(0)
    .stdout(/Create a content type/)
    .end(done)
})

test('content-type --help shows Update a content type description', done => {
  app()
    .run('content-type --help')
    .code(0)
    .stdout(/Update a content type/)
    .end(done)
})

test('content-type --help shows Publish a content type description', done => {
  app()
    .run('content-type --help')
    .code(0)
    .stdout(/Publish a content type/)
    .end(done)
})

test('content-type --help shows Delete a content type description', done => {
  app()
    .run('content-type --help')
    .code(0)
    .stdout(/Delete a content type/)
    .end(done)
})

test('content-type get --help shows usage', done => {
  app()
    .run('content-type get --help')
    .code(0)
    .expect(result => {
      expect(result.stdout).toMatch(/contentful content-type get/)
      expect(result.stdout).toMatch(/--id/)
    })
    .end(done)
})

test('content-type create --help shows usage and options', done => {
  app()
    .run('content-type create --help')
    .code(0)
    .expect(result => {
      expect(result.stdout).toMatch(/contentful content-type create/)
      expect(result.stdout).toMatch(/--name/)
      expect(result.stdout).toMatch(/--fields/)
    })
    .end(done)
})

test('content-type update --help shows usage and options', done => {
  app()
    .run('content-type update --help')
    .code(0)
    .expect(result => {
      expect(result.stdout).toMatch(/contentful content-type update/)
      expect(result.stdout).toMatch(/--id/)
      expect(result.stdout).toMatch(/--version/)
    })
    .end(done)
})

test('content-type publish --help shows usage', done => {
  app()
    .run('content-type publish --help')
    .code(0)
    .expect(result => {
      expect(result.stdout).toMatch(/contentful content-type publish/)
      expect(result.stdout).toMatch(/--id/)
    })
    .end(done)
})

test('content-type delete --help shows usage', done => {
  app()
    .run('content-type delete --help')
    .code(0)
    .expect(result => {
      expect(result.stdout).toMatch(/contentful content-type delete/)
      expect(result.stdout).toMatch(/--id/)
    })
    .end(done)
})
