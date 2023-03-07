import { Patch } from '@contentful/jsondiffpatch'
import chalk from 'chalk'
import getContentfulCollection from 'contentful-collection'
import { ContentTypeProps, PlainClientAPI } from 'contentful-management'

type Entity = {
  sys: {
    id: string
    linkType: string
  }
}

export type Changeset =
  | {
      changeType: 'add'
      entity: Entity
      data: ContentTypeProps
    }
  | {
      changeType: 'delete'
      entity: Entity
    }
  | {
      changeType: 'update'
      entity: Entity
      patch: Patch
    }

export function getContentType({
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

export function printDiff(target: ContentTypeProps[], changeset: Changeset[]) {
  console.log('Here is what would change in the target environment: ')

  changeset.forEach(c => {
    if (c.changeType === 'add') {
      console.log(
        chalk.green(
          `+ (ID: ${c.entity.sys.id}) ${c.data.name} ${c.entity.sys?.linkType} added`
        )
      )
    }
  })

  for (const contentType of target) {
    const change = changeset.find(c => c.entity.sys.id === contentType.sys.id)

    if (change) {
      if (change.changeType === 'delete') {
        console.log(
          chalk.red(
            `- (ID: ${contentType.sys.id}) ${contentType.sys.type} called ${contentType.name} was deleted`
          )
        )
      } else if (change.changeType === 'update') {
        console.log(
          chalk.blue(
            `~ (ID: ${contentType.sys.id}) ${contentType.sys.type} called ${contentType.name} was updated`
          )
        )
      }
    }
  }
}
