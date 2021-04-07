const { handleAsyncError: handle } = require('../../../utils/async')
const { log, success, warning } = require('../../../utils/log')
const recast = require('recast')
const camelCase = require('camelcase')
const _ = require('lodash')
const toAst = require('to-ast')
const prettier = require('prettier')
const {
  createManagementClient: createClient
} = require('../../../utils/contentful-clients')
const fs = require('fs')
const { getHeadersFromOption } = require('../../../utils/headers')

const b = recast.types.builders

module.exports.command = 'migration'

module.exports.desc =
  'Generate a migration file for your content model or a specific content type'

module.exports.builder = yargs => {
  return yargs
    .usage('Usage: contentful space generate migration')
    .option('management-token', {
      describe: 'Content management API token',
      alias: 'mt',
      type: 'string'
    })
    .option('space-id', {
      describe: 'ID of the space the content model will belong to',
      alias: 's',
      type: 'string'
    })
    .option('environment-id', {
      describe: 'ID of the environment the content model will belong to',
      alias: 'e',
      type: 'string'
    })
    .option('content-type-id', {
      describe:
        'ID of the content type to generate. If not provided, will generate the migration for the whole content model in the space',
      alias: 'c',
      type: 'string'
    })
    .option('filename', {
      describe:
        'Output filename. If not provided will generate one with the format SPACE_ID-ENV_ID[-CT_ID]-TIMESTAMP',
      alias: 'f',
      type: 'string'
    })
    .option('header', {
      alias: 'H',
      type: 'string',
      describe: 'Pass an additional HTTP Header'
    })
    .epilog(
      [
        'See more at:',
        'https://github.com/contentful/contentful-cli/tree/master/docs/space/generate/migration',
        'Copyright 2019 Contentful'
      ].join('\n')
    )
}

module.exports.aliases = ['m']

const ctNameNeedsEscaping = function (ctId) {
  const reservedWords = [
    'break',
    'case',
    'catch',
    'class',
    'const',
    'continue',
    'debugger',
    'default',
    'delete',
    'do',
    'else',
    'export',
    'extends',
    'finally',
    'for',
    'function',
    'if',
    'import',
    'in',
    'instanceof',
    'new',
    'return',
    'super',
    'switch',
    'this',
    'throw',
    'try',
    'typeof',
    'var',
    'void',
    'while',
    'with',
    'yield',
    'enum',
    'implements',
    'interface',
    'let',
    'package',
    'private',
    'protected',
    'public',
    'static',
    'await',
    'abstract',
    'boolean',
    'byte',
    'char',
    'double',
    'final',
    'float',
    'goto',
    'int',
    'long',
    'native',
    'short',
    'synchronized',
    'throws',
    'transient',
    'volatile'
  ]

  if (reservedWords.indexOf(ctId) !== -1) {
    return true
  }
  if (!isNaN(ctId.charAt(0))) {
    return true
  }

  return false
}

module.exports.ctNameNeedsEscaping = ctNameNeedsEscaping

const ctVariableEscape = function (ctId) {
  const camelCased = camelCase(ctId)
  return ctNameNeedsEscaping(camelCased) ? `_${camelCased}` : camelCased
}

module.exports.ctVariableEscape = ctVariableEscape

const wrapMigrationWithBase = function (blockStatement) {
  const migration = b.program([
    b.expressionStatement(
      b.assignmentExpression(
        '=',
        b.memberExpression(b.identifier('module'), b.identifier('exports')),
        b.functionExpression(null, [b.identifier('migration')], blockStatement)
      )
    )
  ])

  return migration
}
module.exports.wrapMigrationWithBase = wrapMigrationWithBase

const createCallChain = function (base, chain) {
  if (chain.length === 0) {
    return base
  }

  const [identifier, value] = chain[0]
  const rest = chain.slice(1)

  return createCallChain(
    b.callExpression(b.memberExpression(base, b.identifier(identifier)), [
      toAst(value)
    ]),
    rest
  )
}

const createContentType = function (ct) {
  const id = ct.sys.id
  const { name, description, displayField } = ct
  const chain = [
    ['name', name],
    ['description', description],
    ['displayField', displayField]
  ].filter(([, value]) => value !== null)

  const variableName = ctVariableEscape(id)

  const createCallExpression = b.callExpression(
    b.memberExpression(
      b.identifier('migration'),
      b.identifier('createContentType')
    ),
    [b.literal(id)]
  )

  const callChain = createCallChain(createCallExpression, chain)

  const withDeclaration = b.variableDeclaration('const', [
    b.variableDeclarator(b.identifier(variableName), callChain)
  ])

  return withDeclaration
}

module.exports.createContentType = createContentType

const createField = function (ctId, field) {
  const fieldId = field.id
  const ctVariable = ctVariableEscape(ctId)

  const chain = Object.keys(_.omit(field, 'id')).map(key => {
    return [key, field[key]]
  })

  return createCallChain(
    b.callExpression(
      b.memberExpression(b.identifier(ctVariable), b.identifier('createField')),
      [b.literal(fieldId)]
    ),
    chain
  )
}

module.exports.createField = createField

const changeFieldControl = function (
  ctId,
  fieldId,
  widgetNamespace,
  widgetId,
  settings
) {
  const ctVariable = ctVariableEscape(ctId)
  settings = settings || {}

  const settingsExpression = b.objectExpression(
    _.map(settings, (v, k) => {
      return b.property('init', b.identifier(k), b.literal(v))
    })
  )

  return b.callExpression(
    b.memberExpression(
      b.identifier(ctVariable),
      b.identifier('changeFieldControl')
    ),
    [
      b.literal(fieldId),
      b.literal(widgetNamespace),
      b.literal(widgetId),
      settingsExpression
    ]
  )
}

const getContentTypes = async function (environment, contentTypeId) {
  return contentTypeId
    ? [await environment.getContentType(contentTypeId)]
    : (await environment.getContentTypes()).items
}

module.exports.changeFieldControl = changeFieldControl

module.exports.getContentTypes = getContentTypes

const generateContentTypeMigration = async function (environment, contentType) {
  log(`Creating migration for content type: '${contentType.sys.id}'`)

  const fieldCreators = contentType.fields.map(field => {
    return b.expressionStatement(createField(contentType.sys.id, field))
  })

  let editorInterfacesCreators = []
  try {
    log('Fetching editor interface')

    const editorInterface = await environment.getEditorInterfaceForContentType(
      contentType.sys.id
    )
    editorInterfacesCreators = contentType.fields.map(field => {
      const control = _.find(editorInterface.controls, control => {
        return control.fieldId === field.id
      })

      const { widgetId, settings, widgetNamespace = 'builtin' } = control

      return b.expressionStatement(
        changeFieldControl(
          contentType.sys.id,
          field.id,
          widgetNamespace,
          widgetId,
          settings
        )
      )
    })
  } catch (err) {
    if (err.name === 'NotFound') {
      log('Skipping editor interfaces. Content type has no fields.')
    } else {
      warning(err)
    }
  }

  return [createContentType(contentType)]
    .concat(fieldCreators)
    .concat(editorInterfacesCreators)
}

module.exports.generateContentTypeMigration = generateContentTypeMigration

const generateMigrationScript = async function (environment, contentTypes) {
  const migrationContents = await Promise.all(
    _.map(contentTypes, async contentType => {
      return generateContentTypeMigration(environment, contentType)
    })
  )
  const migration = wrapMigrationWithBase(
    b.blockStatement(_.flatten(migrationContents))
  )

  const output = recast.prettyPrint(migration, { tabWidth: 2 }).code

  return prettier.format(output, { parser: 'babel' })
}

module.exports.generateMigrationScript = generateMigrationScript

const generateFileName = function (spaceId, environmentId, contentTypeId) {
  const contentTypePart = contentTypeId ? `-${contentTypeId}` : ''

  return `${spaceId}-${environmentId}${contentTypePart}-${Date.now()}.js`
}

const createManagementClient = function (managementToken, headers) {
  return createClient({
    accessToken: managementToken,
    feature: 'migration-generate',
    headers
  })
}

const getEnvironment = async function (
  managementToken,
  spaceId,
  environmentId,
  headers
) {
  const client = await createManagementClient(managementToken, headers)
  const space = await client.getSpace(spaceId)
  return space.getEnvironment(environmentId)
}

module.exports.generateFileName = generateFileName

async function generateMigration({
  context,
  filename: filenameFlag,
  contentTypeId,
  header
}) {
  const { managementToken, activeSpaceId, activeEnvironmentId } = context

  const filename =
    filenameFlag ||
    generateFileName(activeSpaceId, activeEnvironmentId, contentTypeId)

  const environment = await getEnvironment(
    managementToken,
    activeSpaceId,
    activeEnvironmentId,
    getHeadersFromOption(header)
  )

  log('Fetching content model')
  const contentTypes = await getContentTypes(environment, contentTypeId)

  fs.writeFileSync(
    filename,
    await generateMigrationScript(environment, contentTypes)
  )
  success(`Migration file created at ${filename}`)
}

module.exports.generateMigration = generateMigration

module.exports.handler = handle(generateMigration)
