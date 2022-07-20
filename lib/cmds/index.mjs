import * as config from './config.mjs'
import * as configCommands from './config_cmds/index.mjs'
import * as contentType from './content-type.mjs'
import * as contentTypeCommands from './content-type_cmds/index.mjs'
import * as extension from './extension.mjs'
import * as extensionCommands from './extension_cmds/index.mjs'
import * as login from './login.mjs'
import * as logout from './logout.mjs'
import * as organization from './organization.mjs'
import * as organizationCommands from './organization_cmds/index.mjs'
import * as snake from './snake.mjs'
import * as space from './space.mjs'
import * as spaceCommands from './space_cmds/index.mjs'

export const commands = [
  config,
  configCommands,
  contentTypeCommands,
  contentType,
  extension,
  extensionCommands,
  login,
  logout,
  organization,
  organizationCommands,
  snake,
  space,
  spaceCommands
]
