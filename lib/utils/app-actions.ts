import {
  type AppActionCategoryParams,
  callAppAction,
  isResultWithError
} from '@contentful/app-action-utils'
import { PlainClientAPI } from 'contentful-management'

const SubsetTransform = {
  to: (input: string[]) => input.join(','),
  from: (input?: string) => {
    if (!input) {
      return []
    }
    return input.replace(/\s+/g, '').split(',')
  }
}

export function toJSMigration(tsMigration: string): string {
  return tsMigration.replace(
    '(migration: any, context: any)',
    '(migration, context)'
  )
}

type CallCreateChangesetParams = {
  api: PlainClientAPI
  appDefinitionId: string
  appActionId: string
  parameters: AppActionCategoryParams['CreateChangeset']
  environmentId?: string
  spaceId?: string
}

export const callCreateChangeset = async ({
  api,
  appDefinitionId,
  appActionId,
  parameters,
  environmentId,
  spaceId
}: CallCreateChangesetParams) => {
  const params = {
    appDefinitionId,
    appActionId,
    ...(environmentId ? { environmentId } : {}),
    ...(spaceId ? { spaceId } : {})
  }

  const createResponse = await api.appActionCall.create(params, { parameters })

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return createResponse.sys.id
}

export const callCreateChangesetWithResponse = async ({
  api,
  appDefinitionId,
  appActionId,
  parameters,
  environmentId,
  spaceId
}: CallCreateChangesetParams) => {
  const params = {
    appDefinitionId,
    appActionId,
    ...(environmentId ? { environmentId } : {}),
    ...(spaceId ? { spaceId } : {})
  }

  return await api.appActionCall.createWithResponse(params, { parameters })
}

type GetExportMigrationParams = {
  api: PlainClientAPI
  appDefinitionId: string
  appActionId: string
  spaceId: string
  targetEnvironmentId: string
  changesetRef: string
  subset?: string[]
  abortSignal?: AbortSignal
}

export const getExportMigration = async ({
  api,
  appDefinitionId,
  appActionId,
  spaceId,
  targetEnvironmentId,
  changesetRef,
  subset,
  abortSignal
}: GetExportMigrationParams) => {
  const { result } = await callAppAction<
    AppActionCategoryParams['ConsumeChangeset'],
    { migration: string }
  >({
    api,
    appDefinitionId,
    appActionId,
    parameters: {
      targetEnvironmentId,
      changesetRef,
      subset: subset ? SubsetTransform.to(subset) : undefined
    },
    abortSignal,
    additionalParameters: {
      environmentId: targetEnvironmentId,
      spaceId
    }
  })

  if (isResultWithError(result)) {
    throw new Error(result.errorMessage)
  }

  return result.message
}
