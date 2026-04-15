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
                // createWithId is broken in contentful-management — it sends no X-Contentful-Version
                // header, which the API requires on all taxonomy PUT requests. Use updatePut(version: 0)
                // instead: same PUT endpoint, but correctly sends the header. See DX-967.
                // TODO: revert to createWithId once the SDK fixes its implementation.
                return ctx.cmaClient.concept.updatePut(
                  {
                    organizationId: organizationId,
                    conceptId: concept.sys.id,
                    version: 0
                  },
                  omit(concept, ['broader', 'related'])
                )
              })
            )
          )
        }
      },
      {
        title: 'Add concept relations',
        task: async (ctx: OrgImportContext) => {
          const concepts = ctx.data.taxonomy?.concepts

          if (!concepts) {
            return
          }

          for (const concept of concepts) {
            const { broader, related } = concept

            const operations = []

            if (broader && broader.length > 0) {
              operations.push({
                op: 'add',
                path: '/broader',
                value: broader
              })
            }

            if (related && related.length > 0) {
              operations.push({
                op: 'add',
                path: '/related',
                value: related
              })
            }

            if (!operations.length) {
              continue
            }

            const version = entityHasVersion(concept)
              ? concept.sys.version + 1
              : 1

            await ctx.cmaClient.concept.patch(
              {
                organizationId: organizationId,
                conceptId: concept.sys.id,
                version
              },
              operations as any[]
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
                  // Same SDK workaround as concept create path above. See DX-967.
                  // TODO: revert to createWithId once the SDK fixes its implementation.
                  return ctx.cmaClient.conceptScheme.updatePut(
                    {
                      organizationId: organizationId,
                      conceptSchemeId: conceptScheme.sys.id,
                      version: 0
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
