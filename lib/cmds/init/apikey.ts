import { Space } from 'contentful-management'

export const getPreviewApiKey = async (space: Space, environmentId: string) => {
  let apiKey
  const previewApiKeys = await space.getPreviewApiKeys()
  if (!previewApiKeys.items.length) {
    const createdApiKey = await space.createApiKey({
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
    const previewApiKey = await space.getPreviewApiKey(
      createdApiKey.preview_api_key.sys.id
    )
    apiKey = previewApiKey.accessToken
  } else {
    apiKey = previewApiKeys.items[0].accessToken
  }

  return apiKey
}
