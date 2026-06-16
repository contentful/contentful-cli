import Listr from 'listr'
import { OrgImportContext, OrgImportParams } from '../import'
import { omit } from 'lodash'
import { ConceptProps, ConceptSchemeProps } from 'contentful-management'
import { CreateConceptWithIdProps } from './concept'
import { CreateConceptSchemeWithIdProps } from './concept-scheme'

const entityHasVersion = <T extends { sys: { id: string; version?: unknown } }>(
  obj: T
): obj is T & { sys: { version: number } } => {
  return typeof obj.sys.version === 'number'
}

type TaxonomyRelationPatch = {
  op: 'add'
  path: '/broader' | '/related'
  value: unknown
}

const taxonomyImport = async (params: OrgImportParams) => {
  const { organizationId, silent } = params

  return new Listr(
    [
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
                  return ctx.cmaClient.concept.update(
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
        title: 'Add concept relations',
        task: async (ctx: OrgImportContext) => {
          const concepts = ctx.data.taxonomy?.concepts

          if (!concepts) {
            return
          }

          for (const concept of concepts) {
            const { broader, related } = concept

            const operations: TaxonomyRelationPatch[] = []

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
              operations
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
                    return ctx.cmaClient.conceptScheme.update(
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
