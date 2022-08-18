import { highlight } from 'cli-highlight'

export type ConnectionType = 'Contentful.js' | 'GraphQL' | 'REST API'

const FEEDBACK_LINK = 'https://contentful.typeform.com/contentful-cli'

export default async function success({
  accessToken,
  connectionType,
  entryId = '{entry_id}',
  environmentId = '{environment_id}',
  spaceId = '{space_id}'
}: {
  accessToken: string
  connectionType: ConnectionType
  entryId: string
  environmentId: string
  spaceId: string
}) {
  const examples = {
    'Contentful.js': highlight(
      `
  const contentful = require("contentful");
  const client = contentful.createClient({
    space: "${spaceId}",
    accessToken: "${accessToken}"
  });
  client
    .getEntry("${entryId}")
    .then(entry => console.log(entry))
    .catch(err => console.log(err));
    `
    ),
    GraphQL: `
  curl -g \\
    -X POST \\
    -H "Content-Type: application/json" \\
    -H "Authorization: Bearer ${accessToken}" \\
    -d  '{"query":"your GraphQL query here' \\
    https://graphql.contentful.com/content/v1/spaces/${spaceId}/environments/${environmentId}
    `,
    'REST API': `
  curl --include \\
    --request GET \\
    --header 'Authorization: Bearer ${accessToken}' \\
    https://api.contentful.com/spaces/${spaceId}/environments/${environmentId}/entries/${entryId}
    `
  }

  console.log(`Try your first request with ${connectionType}:`)
  console.log(examples[connectionType])
  console.log(
    "Don't forget to replace environment ID and entry ID with your own values\n"
  )

  if (connectionType === 'GraphQL') {
    console.log(
      'Try the GraphQL Playground app to get started building your queries: https://app.contentful.com/deeplink?link=apps-contentful&id=graphql-playground\n'
    )
  }

  console.log(
    'Do you want to give us feedback on the experience of using this command?'
  )
  console.log(`Share your thoughts at ${FEEDBACK_LINK}`)
}
