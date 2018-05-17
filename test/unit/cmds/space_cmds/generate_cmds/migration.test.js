import test from 'ava'
import recast from 'recast'
import _ from 'lodash'
import { stub } from 'sinon'
import { __RewireAPI__ as contextRewireAPI } from '../../../../../lib/context'

import {
  ctNameNeedsEscaping,
  ctVariableEscape,
  wrapMigrationWithBase,
  createContentType,
  createField,
  changeEditorInterface,
  getContentTypes,
  generateContentTypeMigration,
  generateMigrationScript,
  generateFileName,
  generateMigration,
  __RewireAPI__ as generateMigrationRewireAPI
} from '../../../../../lib/cmds/space_cmds/generate_cmds/migration'

const b = recast.types.builders

const simpleContentType = {
  sys: {
    id: 'foo'
  },
  name: 'Foo',
  description: 'some content type',
  displayField: 'name',
  fields: [
    {
      id: 'name',
      name: 'Name',
      type: 'Symbol'
    }
  ]
}

const editorInterface = {
  controls: [
    {
      fieldId: 'name',
      widgetId: 'singleLine',
      settings: {
        helpText: 'the name'
      }
    }
  ]
}

const environmentMock = {
  getContentTypes: function() {
    return {
      items: [simpleContentType]
    }
  },
  getContentType: function(ctId) {
    return simpleContentType
  },
  getEditorInterfaceForContentType: function (ctId) {
    if (ctId === 'foo') {
      return editorInterface
    } else {
      throw {
        name: 'NotFound'
      }
    }
  }
}

const MOCKED_RC = '{\n  "cmaToken": "mocked",\n  "activeSpaceId": "mocked"\n}\n'

const readFileStub = stub().resolves(MOCKED_RC)
const writeFileStub = stub()
const getEnvironmentStub = stub().resolves(environmentMock)

const fsWriteStub = {
  writeFileSync: stub()
}

test.beforeEach(() => {
  contextRewireAPI.__Rewire__('readFile', readFileStub)
  contextRewireAPI.__Rewire__('writeFile', writeFileStub)
  generateMigrationRewireAPI.__Rewire__('getEnvironment', getEnvironmentStub)
  generateMigrationRewireAPI.__Rewire__('fs', fsWriteStub)
})

test.after.always(() => {
  contextRewireAPI.__ResetDependency__('readFile')
  contextRewireAPI.__ResetDependency__('writeFile')
  generateMigrationRewireAPI.__ResetDependency__('getEnvironment')
  generateMigrationRewireAPI.__ResetDependency__('fs')
})

test.afterEach((t) => {
  readFileStub.resetHistory()
  writeFileStub.resetHistory()
})

test('it doesnt require escape name when neither starts with number or is reserved', async (t) => {
  t.is(ctNameNeedsEscaping('foo'), false)
})

test('it does require escape when name starts with number', async (t) => {
  t.is(ctNameNeedsEscaping('3asd'), true)
})

test('it does require escape when name is reserved word', async(t) => {
  t.is(ctNameNeedsEscaping('class'), true)
})

test('it doesnt escape name when neither starts with number or is reserved', async (t) => {
  t.is(ctVariableEscape('foo'), 'foo')
})

test('it does escape when name starts with number', async (t) => {
  t.is(ctVariableEscape('3asd'), '_3asd')
})

test('it does escape when name is reserved word', async(t) => {
  t.is(ctVariableEscape('class'), '_class')
})

test('it wraps the program', async(t) => {
  const program_stub = b.blockStatement([])

  const expected = "module.exports = function(migration) {};"

  t.is(recast.prettyPrint(wrapMigrationWithBase(program_stub)).code, expected)
})

test('it creates the content type', async(t) => {
  const program_stub = b.blockStatement([createContentType(simpleContentType)])

  const expected =
`module.exports = function(migration) {
    const foo = migration.createContentType("foo").name("Foo").description("some content type").displayField("name");
};`

  t.is(recast.prettyPrint(wrapMigrationWithBase(program_stub)).code, expected)
})

test('it creates the content type fields', async(t) => {
  const program_stub = b.blockStatement([
    b.expressionStatement(
      createField(simpleContentType.sys.id, simpleContentType.fields[0])
    )
  ])

  const expected =
`module.exports = function(migration) {
    foo.createField("name").name("Name").type("Symbol");
};`

  t.is(recast.prettyPrint(wrapMigrationWithBase(program_stub)).code, expected)
})

test('it creates the editor interface', async (t) => {
  const program_stub = b.blockStatement([
    b.expressionStatement(
      changeEditorInterface(
        simpleContentType.sys.id,
        editorInterface.controls[0].fieldId,
        editorInterface.controls[0].widgetId,
        editorInterface.controls[0].settings
      )
    )
  ])

  const expected =
`module.exports = function(migration) {
    foo.changeEditorInterface("name", "singleLine", {
        helpText: "the name"
    });
};`

  t.is(recast.prettyPrint(wrapMigrationWithBase(program_stub)).code, expected)
})

test('it creates the full migration script', async (t) => {
  const expected =
`module.exports = function(migration) {
  const foo = migration
    .createContentType("foo")
    .name("Foo")
    .description("some content type")
    .displayField("name");
  foo
    .createField("name")
    .name("Name")
    .type("Symbol");

  foo.changeEditorInterface("name", "singleLine", {
    helpText: "the name"
  });
};
`

  const result = await generateMigrationScript(environmentMock, [simpleContentType])

  t.is(result, expected)
})

test('it generates the filename when content type is present', async(t) => {
  const filenameRegex = /^(\w+)-(\w+)-(\w+)-\d+.js$/
  const filename = generateFileName('fooSpace', 'master', 'fooCT')

  const matches = filename.match(filenameRegex)

  t.is(matches[1], 'fooSpace')
  t.is(matches[2], 'master')
  t.is(matches[3], 'fooCT')
})

test('it generates the filename without content type', async(t) => {
  const filenameRegex = /^(\w+)-(\w+)-\d+.js$/
  const filename = generateFileName('fooSpace', 'master')

  const matches = filename.match(filenameRegex)

  t.is(matches[1], 'fooSpace')
  t.is(matches[2], 'master')
})

test('it generates the migration and writes to disk', async(t) => {
  await generateMigration({
    spaceId: 'fooSpace',
    environmentId: 'fooEnv'
  })

  const filenameRegex = /^(\w+)-(\w+)-\d+.js$/
  const matches = fsWriteStub.writeFileSync.args[0][0].match(filenameRegex)

  t.is(matches[1], 'fooSpace')
  t.is(matches[2], 'fooEnv')

  const expectedContent =
`module.exports = function(migration) {
  const foo = migration
    .createContentType("foo")
    .name("Foo")
    .description("some content type")
    .displayField("name");
  foo
    .createField("name")
    .name("Name")
    .type("Symbol");

  foo.changeEditorInterface("name", "singleLine", {
    helpText: "the name"
  });
};
`
  t.is(fsWriteStub.writeFileSync.args[0][1], expectedContent)
})
