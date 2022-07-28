import * as accessToken from './accesstoken.js'
import { commands as accessTokenCommands } from './accesstoken_cmds/index.js'
import * as alias from './alias.js'
import { commands as aliasCommands } from './alias_cmds/index.js'
import * as create from './create.js'
import * as deleteCommand from './delete.js'
import * as environment from './environment.js'
import { commands as environmentCommands } from './environment_cmds/index.js'
import * as exportCommand from './export.js'
import * as generate from './generate.js'
import { commands as generateCommands } from './generate_cmds/index.js'
import * as importCommand from './import.js'
import * as list from './list.js'
import * as migration from './migration.js'
import * as seed from './seed.js'
import * as use from './use.js'

export const commands = [
  accessToken,
  accessTokenCommands,
  alias,
  aliasCommands,
  create,
  deleteCommand,
  environment,
  environmentCommands,
  exportCommand,
  generate,
  generateCommands,
  importCommand,
  list,
  migration,
  seed,
  use
]
