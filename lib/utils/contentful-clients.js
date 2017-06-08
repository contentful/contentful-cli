import { createClient } from 'contentful-management'
import { version } from '../../package.json'
import { getContext } from '../context'

export function createManagementClient (params) {
  params.application = `contentful.cli/${version}`

  const context = getContext()
  if (context.proxy) {
    params.proxy = context.proxy
  }
  return createClient(params)
}
