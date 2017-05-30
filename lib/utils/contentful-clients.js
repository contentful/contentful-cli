import { createClient } from 'contentful-management'
import {version} from '../../package.json'

export function createManagementClient (params) {
  params.application = `contentful-cli/${version}`
  return createClient(params)
}
