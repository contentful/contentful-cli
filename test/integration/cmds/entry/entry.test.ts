const nixt = require('nixt')
const {join} = require('path')

const bin = join(__dirname, '../../../../', 'bin')

const app = () => nixt({newlines: true}).cwd(bin).base('./contentful.js ').clone()

const expectMatch = (pattern: RegExp) => (result: {stdout: string}) => {
  if (!pattern.test(result.stdout)) {
    return new Error(`Expected stdout to match ${pattern}. Got:\n${result.stdout}`)
  }
}

test('should show entry subcommands in help', done => {
  app()
    .run('entry --help')
    .code(0)
    .expect(expectMatch(/Manage entries/))
    .expect(expectMatch(/list/))
    .expect(expectMatch(/get/))
    .expect(expectMatch(/create/))
    .expect(expectMatch(/publish/))
    .expect(expectMatch(/unpublish/))
    .expect(expectMatch(/delete/))
    .expect(expectMatch(/update/))
    .expect(expectMatch(/archive/))
    .expect(expectMatch(/unarchive/))
    .end(done)
})

test('should print help for entry list', done => {
  app()
    .run('entry list --help')
    .code(0)
    .expect(expectMatch(/Usage: contentful entry list/))
    .expect(expectMatch(/--space-id/))
    .expect(expectMatch(/--management-token/))
    .expect(expectMatch(/--content-type/))
    .end(done)
})

test('should print help for entry get', done => {
  app()
    .run('entry get --help')
    .code(0)
    .expect(expectMatch(/Usage: contentful entry get/))
    .expect(expectMatch(/--space-id/))
    .expect(expectMatch(/--management-token/))
    .end(done)
})

test('should print help for entry create', done => {
  app()
    .run('entry create --help')
    .code(0)
    .expect(expectMatch(/Usage: contentful entry create/))
    .expect(expectMatch(/--content-type/))
    .expect(expectMatch(/--fields/))
    .expect(expectMatch(/--dry-run/))
    .end(done)
})

test('should print help for entry publish', done => {
  app()
    .run('entry publish --help')
    .code(0)
    .expect(expectMatch(/Usage: contentful entry publish/))
    .expect(expectMatch(/--dry-run/))
    .end(done)
})

test('should print help for entry unpublish', done => {
  app()
    .run('entry unpublish --help')
    .code(0)
    .expect(expectMatch(/Usage: contentful entry unpublish/))
    .expect(expectMatch(/--dry-run/))
    .end(done)
})

test('should print help for entry delete', done => {
  app()
    .run('entry delete --help')
    .code(0)
    .expect(expectMatch(/Usage: contentful entry delete/))
    .expect(expectMatch(/--yes/))
    .expect(expectMatch(/--dry-run/))
    .end(done)
})

test('should print help for entry update', done => {
  app()
    .run('entry update --help')
    .code(0)
    .expect(expectMatch(/Usage: contentful entry update/))
    .expect(expectMatch(/--fields/))
    .expect(expectMatch(/--version/))
    .expect(expectMatch(/--dry-run/))
    .end(done)
})

test('should print help for entry archive', done => {
  app()
    .run('entry archive --help')
    .code(0)
    .expect(expectMatch(/Usage: contentful entry archive/))
    .expect(expectMatch(/--dry-run/))
    .end(done)
})

test('should print help for entry unarchive', done => {
  app()
    .run('entry unarchive --help')
    .code(0)
    .expect(expectMatch(/Usage: contentful entry unarchive/))
    .expect(expectMatch(/--dry-run/))
    .end(done)
})
