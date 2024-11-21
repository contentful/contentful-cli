import Listr from 'listr'
import { OrgImportContext, OrgImportParams } from '../import'
import { omit } from 'lodash'
import { ConceptProps, ConceptSchemeProps } from 'contentful-management'
import { CreateConceptWithIdProps } from './concept'
import { CreateConceptSchemeWithIdProps } from './concept-scheme'

const entityHasVersion = <T extends { sys: any }>(
  obj: T
): obj is T & { sys: { version: number } } => {
  return 'sys' in obj && 'version' in obj.sys
}

const taxonomyImport = async (
  params: OrgImportParams,
  context: OrgImportContext
) => {
  const { organizationId, silent } = params

  return new Listr(
    [
      {
        title: 'copy context',
        task: async ctx => {
          ctx = context
        }
      },
      {
        title: 'Create concepts',
        task: async (ctx: OrgImportContext) => {
          const concepts = ctx.data.taxonomy?.concepts || []

          if (!concepts.length) {
            return
          }

          await Promise.all(
            concepts.map((concept: ConceptProps | CreateConceptWithIdProps) =>
              ctx.requestQueue.add(() => {
                if (entityHasVersion(concept)) {
                  return ctx.cmaClient.concept.updatePut(
                    {
                      organizationId: organizationId,
                      conceptId: concept.sys.id,
                      version: concept.sys.version
                    },
                    omit(concept, ['broader', 'related'])
                  )
                }
                return ctx.cmaClient.concept.createWithId(
                  {
                    organizationId: organizationId,
                    conceptId: concept.sys.id
                  },
                  omit(concept, ['broader', 'related'])
                )
              })
            )
          )
        }
      },
      {
        title: 'Add broader relations',
        task: async (ctx: OrgImportContext) => {
          const concepts = ctx.data.taxonomy?.concepts

          if (!concepts) {
            return
          }

          for (const concept of concepts) {
            const { broader } = concept

            if (!broader || !broader.length) {
              return
            }

            const version = entityHasVersion(concept) ? concept.sys.version : 1

            await ctx.cmaClient.concept.patch(
              {
                organizationId: organizationId,
                conceptId: concept.sys.id,
                version
              },
              [
                {
                  op: 'add',
                  path: '/broader',
                  value: broader
                }
              ]
            )
          }
        }
      },
      {
        title: 'Add related relations',
        task: async (ctx: OrgImportContext) => {
          const concepts = ctx.data.taxonomy?.concepts

          if (!concepts) {
            return
          }

          for (const concept of concepts) {
            const { related } = concept

            if (!related || !related.length) {
              return
            }

            const version = entityHasVersion(concept) ? concept.sys.version : 1

            await ctx.cmaClient.concept.patch(
              {
                organizationId: organizationId,
                conceptId: concept.sys.id,
                version
              },
              [
                {
                  op: 'add',
                  path: '/related',
                  value: related
                }
              ]
            )
          }
        }
      },
      {
        title: 'Create concept schemes',
        task: async (ctx: OrgImportContext) => {
          const conceptSchemes = ctx.data.taxonomy?.conceptSchemes || []

          if (!conceptSchemes.length) {
            return
          }

          await Promise.all(
            conceptSchemes.map(
              (
                conceptScheme:
                  | ConceptSchemeProps
                  | CreateConceptSchemeWithIdProps
              ) =>
                ctx.requestQueue.add(() => {
                  if (entityHasVersion(conceptScheme)) {
                    return ctx.cmaClient.conceptScheme.updatePut(
                      {
                        organizationId: organizationId,
                        conceptSchemeId: conceptScheme.sys.id,
                        version: conceptScheme.sys.version
                      },
                      conceptScheme
                    )
                  }
                  return ctx.cmaClient.conceptScheme.createWithId(
                    {
                      organizationId: organizationId,
                      conceptSchemeId: conceptScheme.sys.id
                    },
                    conceptScheme
                  )
                })
            )
          )
        }
      }
    ],
    { renderer: silent ? 'silent' : 'default' }
  )
}

export default taxonomyImport
