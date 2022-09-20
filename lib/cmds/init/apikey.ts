import { Space } from 'contentful-management'

export const getPreviewApiKey = async (space: Space, environmentId: string) => {
  let apiKey
  const apiKeys = await space.getPreviewApiKeys()
  if (!apiKeys.items.length) {
    apiKey = await space.createApiKey({
      name: space.name,
      environments: [
        {
          sys: {
            type: 'Link',
            linkType: 'Environment',
            id: environmentId
          }
        }
      ]
    })
    apiKey = await space.getPreviewApiKey(apiKey.sys.id)
    apiKey = apiKey.accessToken
  } else {
    apiKey = apiKeys.items[0].accessToken
  }

  return apiKey
}
