import Listr from 'listr'
import { OrgImportContext, OrgImportParams } from '../import'
import { ConceptProps } from 'contentful-management'
import { CreateConceptWithIdProps } from './concept'
import { omit } from 'lodash'

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
              ctx.requestQueue.add(() =>
                ctx.cmaClient.concept.create(
                  {
                    organizationId: organizationId
                  },
                  omit(concept, ['sys', 'broader'])
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
