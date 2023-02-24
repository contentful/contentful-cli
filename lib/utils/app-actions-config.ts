type AppActionTypes = 'create-changeset' | 'export-changeset'

export type Host = 'api.flinkly.com' | 'api.contentful.com'

const AppDefinitionIds: {
  [host in Host]: string
} = {
  'api.contentful.com': 'cQeaauOu1yUCYVhQ00atE',
  'api.flinkly.com': '7tBJPpcwK1E1KqlxlMiKw5'
}

const ActionIds: {
  [host in Host]: {
    [action in AppActionTypes]: string
  }
} = {
  'api.flinkly.com': {
    'create-changeset': '4gwoIghhNwPmt8ISGkjOu1',
    'export-changeset': '5saqHxAG2N0xHaZYXEe5dO'
  },
  'api.contentful.com': {
    'create-changeset': '3yquPqLswfwwbY7taePuYp',
    'export-changeset': '2z5CsfaFfA26RrLSXPcQtS'
  }
}

export const getAppDefinitionId = (host?: Host) => {
  if (!host) {
    host = 'api.contentful.com'
  }

  return AppDefinitionIds[host as Host]
}

export const getAppActionId = (action: AppActionTypes, host?: Host) => {
  if (!host) {
    host = 'api.contentful.com'
  }
  return ActionIds[host as Host][action as AppActionTypes]
}
