import { createClient } from 'contentful-management'
import version from '../../version'

export function createManagementClient (params) {
  params.application = `contentful-cli/${version}`
  return createClient(params)
}
