import chalk from 'chalk'
import { highlight } from 'cli-highlight'

export type ConnectionType = 'Contentful.js' | 'GraphQL' | 'REST API'
type SuccessProps = {
  accessToken: string
  connectionType: ConnectionType
  environmentId?: string
  spaceId?: string
}

const FEEDBACK_LINK = 'https://contentful.typeform.com/contentful-cli'

export default async function success({
  accessToken,
  connectionType,
  environmentId = '{environment_id}',
  spaceId = '{space_id}'
}: SuccessProps) {
  const examples = {
    'Contentful.js': highlight(
      `
    import contentful from "contentful";

    const client = contentful.createClient({
      space: "${spaceId}",
      accessToken: "${accessToken}"
    });

    client.getEntries()
      .then((response) => console.log(response.items))
      .catch(console.error)
    `,
      { language: 'JavaScript' }
    ),
    GraphQL: `
    curl -g \\
      -X POST \\
      -H "Content-Type: application/json" \\
      -H "Authorization: Bearer ${accessToken}" \\
      -d  '{"query":"query($preview:Boolean){entryCollection(preview:$preview){items{__typename}}}","variables":{"preview":true}}' \\
      https://graphql.contentful.com/content/v1/spaces/${spaceId}/environments/${environmentId}
      `,
    'REST API': `
    curl --include \\
      --request GET \\
      https://preview.contentful.com/spaces/${spaceId}/environments/${environmentId}/entries?access_token=${accessToken}
    `
  }

  console.log(
    chalk.cyan(
      `\n-----Try your first request-------------------------------------------------------\n`
    ),
    examples[connectionType],
    chalk.cyan(
      `\n----------------------------------------------------------------------------------\n`
    )
  )

  switch (connectionType) {
    case 'GraphQL':
      console.log(
        `Use ${chalk.magenta(
          'GraphiQL'
        )} Playground app and start building your queries: ${chalk.blue(
          'https://app.contentful.com/deeplink?link=apps-contentful&id=graphql-playground\n'
        )}`,
        `\nLearn more about GraphQL: ${chalk.blue(
          'https://contentful.com/developers/docs/references/graphql/'
        )}\n`
      )
      break
    case 'Contentful.js':
      console.log(
        `Learn more about ${chalk.yellow(
          'Content Delivery API JS'
        )} client library: ${chalk.blue(
          'https://www.contentful.com/developers/docs/javascript/sdks'
        )}\n`
      )
      break
    case 'REST API':
      console.log(
        `Learn more about Content Delivery API: ${chalk.blue(
          'https://www.contentful.com/developers/docs/references/content-delivery-api'
        )}\n`
      )
      break
  }

  console.log(
    `Share your feedback for this CLI: ${chalk.blue(FEEDBACK_LINK)}\n`
  )
}
