import chalk from 'chalk'
import getContentfulCollection from 'contentful-collection'
import { ContentTypeProps, PlainClientAPI } from 'contentful-management'

type Patch =
  | {
      op: 'remove' | 'replace'
      path: string
      value: string
    }
  | {
      op: 'add'
      path: string
      value: Record<string, unknown>
    }

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
      patch: Patch[]
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

export function printUpdate(patches: Patch[], contentType: ContentTypeProps) {
  for (const patch of patches) {
    const pathParts = patch.path.split('/').filter(Boolean)
    const field = contentType.fields[Number(pathParts[1])]

    if (patch.op === 'remove') {
      console.log(
        chalk.red(`\t- (ID: ${field.id}) Field ${field?.name} was deleted`)
      )
    } else if (patch.op === 'replace') {
      console.log(
        chalk.blue(
          `\t~ (ID: ${field.id}) Property ${pathParts[2]} was updated to ${patch.value} in field ${field?.name}`
        )
      )
    } else if (patch.op === 'add') {
      console.log(
        chalk.green(
          `\t+ (ID: ${patch.value?.id}) Property ${field.name} was added`
        )
      )
    }
  }
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
        printUpdate(change.patch, contentType)
      }
    }
  }
}
