import { getContext } from '../context'

export default async function normalizer ({spaceId}) {
  const context = await getContext()
  const { activeSpaceId } = context
  return {
    spaceId: spaceId || activeSpaceId
  }
}
