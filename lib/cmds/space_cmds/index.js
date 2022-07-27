import * as accessToken from './accesstoken.mjs'
import { commands as accessTokenCommands } from './accesstoken_cmds/index.mjs'
import * as alias from './alias.mjs'
import { commands as aliasCommands } from './alias_cmds/index.mjs'
import * as create from './create.mjs'
import * as deleteCommand from './delete.mjs'
import * as environment from './environment.mjs'
import { commands as environmentCommands } from './environment_cmds/index.mjs'
import * as exportCommand from './export.mjs'
import * as generate from './generate.mjs'
import { commands as generateCommands } from './generate_cmds/index.mjs'
import * as importCommand from './import.mjs'
import * as list from './list.mjs'
import * as migration from './migration.mjs'
import * as seed from './seed.mjs'
import * as use from './use.mjs'

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
