import getContentfulCollection from 'contentful-collection'
import { ContentTypeProps, PlainClientAPI } from 'contentful-management'

function getAll({
  client,
  environmentId,
  spaceId
}: {
  client: PlainClientAPI
  spaceId: string
  environmentId: string
}) {
  return getContentfulCollection<ContentTypeProps>(options =>
    client.raw.get(
      `/spaces/${spaceId}/environments/${environmentId}/content_types`,
      {
        params: {
          limit: options.limit || 100,
          skip: options.skip
        }
      }
    )
  )
}

export const ContentTypeApiHelper = {
  getAll
}
