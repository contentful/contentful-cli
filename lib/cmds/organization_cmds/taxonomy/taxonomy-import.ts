import Listr from 'listr'
import { OrgImportContext, OrgImportParams } from '../import'
import { ConceptProps } from 'contentful-management'
import { CreateConceptWithIdProps } from './concept'
import { omit } from 'lodash'
import {
  ConceptScheme,
  ConceptSchemeProps
} from 'contentful-management/dist/typings/entities/concept-scheme'
import { CreateConceptSchemeWithIdProps } from './concept-scheme'

const taxonomyImport = async (
  params: OrgImportParams,
  contex: OrgImportContext
) => {
  const { organizationId, silent } = params

  return new Listr(
    [
      {
        title: 'copy context',
        task: async ctx => {
          ctx = contex
        }
      },
      {
        title: 'Create concepts',
        task: async ctx => {
          const concepts = ctx.data.taxonomy?.concepts || []

          if (!concepts.length) {
            return
          }

          await Promise.all(
            concepts.map((concept: ConceptProps | CreateConceptWithIdProps) =>
              ctx.requestQueue.add(() => {
                return ctx.cmaClient.concept.createWithId(
                  {
                    organizationId: organizationId,
                    conceptId: concept.sys.id,
                    version: (concept as ConceptProps).sys.version
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
        task: async ctx => {
          const concepts = ctx.data.taxonomy?.concepts

          if (!concepts) {
            return
          }

          await Promise.all(
            concepts.map((concept: ConceptProps) => {
              const { broader } = concept

              if (!broader || !broader.length) {
                return
              }

              const version = concept.sys.version || 1

              return ctx.cmaClient.concept.update(
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
            })
          )
        }
      },
      {
        title: 'Add related relations',
        task: async ctx => {
          const concepts = ctx.data.taxonomy?.concepts

          if (!concepts) {
            return
          }

          await Promise.all(
            concepts.map((concept: ConceptProps) => {
              const { related } = concept

              if (!related || !related.length) {
                return
              }

              const version = concept.sys.version || 1

              return ctx.cmaClient.concept.update(
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
            })
          )
        }
      },
      {
        title: 'Create concept schemes',
        task: async ctx => {
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
                ctx.requestQueue.add(() =>
                  ctx.cmaClient.conceptScheme.create(
                    {
                      organizationId: organizationId
                    },
                    conceptScheme
                  )
                )
            )
          )
        }
      }
    ],
    { renderer: silent ? 'silent' : 'default' }
  )
}

export default taxonomyImport
