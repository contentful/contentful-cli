const recast = require('recast')
const rimraf = require('rimraf')

const {
  ctNameNeedsEscaping,
  ctVariableEscape,
  wrapMigrationWithBase,
  createContentType,
  createField,
  changeFieldControl,
  generateMigrationScript,
  generateFileName,
  generateMigration
} = require('../../../../../lib/cmds/space_cmds/generate_cmds/migration')
const fs = require('fs')
const {
  createManagementClient
} = require('../../../../../lib/utils/contentful-clients')

jest.mock('../../../../../lib/utils/contentful-clients')
jest.mock('../../../../../lib/context')

const filePrefix = 'fooSpace'

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

const contentTypeWithUndefined = {
  sys: {
    id: 'bar'
  },
  name: 'Bar',
  description: undefined,
  displayField: undefined,
  fields: [
    {
      id: 'title',
      name: 'Title',
      type: 'Symbol',
      required: undefined,
      localized: undefined,
      disabled: false
    }
  ]
}

const editorInterface = {
  controls: [
    {
      fieldId: 'name',
      widgetId: 'singleLine',
      widgetNamespace: 'builtin',
      settings: {
        helpText: 'the name'
      }
    }
  ]
}

const editorInterfaceWithUndefined = {
  controls: [
    {
      fieldId: 'title',
      widgetId: 'singleLine',
      widgetNamespace: 'builtin',
      settings: {
        helpText: undefined,
        placeholder: 'Enter title',
        showLinkEntityAction: undefined
      }
    }
  ]
}

const editorInterfaceWithMissingProperties = {
  controls: [
    {
      fieldId: 'title',
      widgetId: 'singleLine',
      widgetNamespace: 'builtin',
      settings: {
        helpText: 'Valid title'
      }
    },
    {
      fieldId: 'description'
      // Missing widgetId and widgetNamespace
    }
  ]
}

const EditorInterfaceNotFoundErrorMock = function () {
  this.name = 'NotFound'
}

const environmentMock = {
  getContentTypes: function () {
    return {
      items: [simpleContentType]
    }
  },
  getContentType: function () {
    return simpleContentType
  },
  getEditorInterfaceForContentType: function (ctId) {
    if (ctId === 'foo') {
      return editorInterface
    } else {
      throw new EditorInterfaceNotFoundErrorMock()
    }
  }
}

const getEnvironmentStub = jest.fn().mockResolvedValue(environmentMock)

createManagementClient.mockReturnValue({
  getSpace: async () => ({
    getEnvironment: getEnvironmentStub
  })
})

afterEach(() => {
  getEnvironmentStub.mockClear()
})

test('it doesnt require escape name when neither starts with number or is reserved', async () => {
  expect(ctNameNeedsEscaping('foo')).toBe(false)
})

test('it does require escape when name starts with number', async () => {
  expect(ctNameNeedsEscaping('3asd')).toBe(true)
})

test('it does require escape when name is reserved word', async () => {
  expect(ctNameNeedsEscaping('class')).toBe(true)
})

test('it doesnt escape name when neither starts with number or is reserved', async () => {
  expect(ctVariableEscape('foo')).toBe('foo')
})

test('it does escape when name starts with number', async () => {
  expect(ctVariableEscape('3asd')).toBe('_3Asd')
})

test('it does escape when name is reserved word', async () => {
  expect(ctVariableEscape('class')).toBe('_class')
})

test('it wraps the program', async () => {
  const programStub = b.blockStatement([])

  const expected = 'module.exports = function(migration) {};'

  expect(recast.prettyPrint(wrapMigrationWithBase(programStub)).code).toBe(
    expected
  )
})

test('it creates the content type', async () => {
  const programStub = b.blockStatement([createContentType(simpleContentType)])

  const expected = `module.exports = function(migration) {
    const foo = migration.createContentType("foo").name("Foo").description("some content type").displayField("name");
};`

  expect(recast.prettyPrint(wrapMigrationWithBase(programStub)).code).toBe(
    expected
  )
})

test('it creates the content type fields', async () => {
  const programStub = b.blockStatement([
    b.expressionStatement(
      createField(simpleContentType.sys.id, simpleContentType.fields[0])
    )
  ])

  const expected = `module.exports = function(migration) {
    foo.createField("name").name("Name").type("Symbol");
};`

  expect(recast.prettyPrint(wrapMigrationWithBase(programStub)).code).toBe(
    expected
  )
})

test('it creates the editor interface', async () => {
  const programStub = b.blockStatement([
    b.expressionStatement(
      changeFieldControl(
        simpleContentType.sys.id,
        editorInterface.controls[0].fieldId,
        editorInterface.controls[0].widgetNamespace,
        editorInterface.controls[0].widgetId,
        editorInterface.controls[0].settings
      )
    )
  ])

  const expected = `module.exports = function(migration) {
    foo.changeFieldControl("name", "builtin", "singleLine", {
        helpText: "the name"
    });
};`

  expect(recast.prettyPrint(wrapMigrationWithBase(programStub)).code).toBe(
    expected
  )
})

test('it handles undefined values in content type', async () => {
  const programStub = b.blockStatement([createContentType(contentTypeWithUndefined)])

  const expected = `module.exports = function(migration) {
    const bar = migration.createContentType("bar").name("Bar");
};`

  expect(recast.prettyPrint(wrapMigrationWithBase(programStub)).code).toBe(
    expected
  )
})

test('it handles undefined values in field properties', async () => {
  const programStub = b.blockStatement([
    b.expressionStatement(
      createField(contentTypeWithUndefined.sys.id, contentTypeWithUndefined.fields[0])
    )
  ])

  const expected = `module.exports = function(migration) {
    bar.createField("title").name("Title").type("Symbol").disabled(false);
};`

  expect(recast.prettyPrint(wrapMigrationWithBase(programStub)).code).toBe(
    expected
  )
})

test('it handles undefined values in editor interface settings', async () => {
  const programStub = b.blockStatement([
    b.expressionStatement(
      changeFieldControl(
        'bar',
        editorInterfaceWithUndefined.controls[0].fieldId,
        editorInterfaceWithUndefined.controls[0].widgetNamespace,
        editorInterfaceWithUndefined.controls[0].widgetId,
        editorInterfaceWithUndefined.controls[0].settings
      )
    )
  ])

  const expected = `module.exports = function(migration) {
    bar.changeFieldControl("title", "builtin", "singleLine", {
        placeholder: "Enter title"
    });
};`

  expect(recast.prettyPrint(wrapMigrationWithBase(programStub)).code).toBe(
    expected
  )
})

test('it skips changeFieldControl when required parameters are undefined', async () => {
  const validControl = changeFieldControl(
    'bar',
    editorInterfaceWithMissingProperties.controls[0].fieldId,
    editorInterfaceWithMissingProperties.controls[0].widgetNamespace,
    editorInterfaceWithMissingProperties.controls[0].widgetId,
    editorInterfaceWithMissingProperties.controls[0].settings
  )

  const invalidControl = changeFieldControl(
    'bar',
    editorInterfaceWithMissingProperties.controls[1].fieldId,
    editorInterfaceWithMissingProperties.controls[1].widgetNamespace,
    editorInterfaceWithMissingProperties.controls[1].widgetId,
    editorInterfaceWithMissingProperties.controls[1].settings
  )

  expect(validControl).not.toBeNull()
  expect(invalidControl).toBeNull()
})

test('it creates the full migration script', async () => {
  const expected = `module.exports = function (migration) {
  const foo = migration
    .createContentType("foo")
    .name("Foo")
    .description("some content type")
    .displayField("name");
  foo.createField("name").name("Name").type("Symbol");

  foo.changeFieldControl("name", "builtin", "singleLine", {
    helpText: "the name",
  });
};
`

  const result = await generateMigrationScript(environmentMock, [
    simpleContentType
  ])

  expect(result).toBe(expected)
})

test('it generates the filename when content type is present', async () => {
  const filenameRegex = /^(\w+)-(\w+)-(\w+)-\d+.js$/
  const filename = generateFileName(filePrefix, 'master', 'fooCT')

  const matches = filename.match(filenameRegex)

  expect(matches[1]).toBe(filePrefix)
  expect(matches[2]).toBe('master')
  expect(matches[3]).toBe('fooCT')
})

test('it generates the filename without content type', async () => {
  const filenameRegex = /^(\w+)-(\w+)-\d+.js$/
  const filename = generateFileName(filePrefix, 'master')

  const matches = filename.match(filenameRegex)

  expect(matches[1]).toBe(filePrefix)
  expect(matches[2]).toBe('master')
})

test('it generates the migration and writes to disk', async () => {
  const writeFileSyncMock = jest.spyOn(fs, 'writeFileSync')

  await generateMigration({
    context: {
      managementToken: 'managementToken',
      activeSpaceId: filePrefix,
      activeEnvironmentId: 'fooEnv'
    }
  })

  const filenameRegex = /^(\w+)-(\w+)-\d+.js$/
  const matches = writeFileSyncMock.mock.calls[0][0].match(filenameRegex)

  expect(matches[1]).toBe(filePrefix)
  expect(matches[2]).toBe('fooEnv')

  const expectedContent = `module.exports = function (migration) {
  const foo = migration
    .createContentType("foo")
    .name("Foo")
    .description("some content type")
    .displayField("name");
  foo.createField("name").name("Name").type("Symbol");

  foo.changeFieldControl("name", "builtin", "singleLine", {
    helpText: "the name",
  });
};
`
  expect(writeFileSyncMock.mock.calls[0][1]).toBe(expectedContent)
})

afterAll(() => rimraf(`./${filePrefix}*.js`, err => err && console.error(err)))
