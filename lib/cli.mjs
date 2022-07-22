import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import { buildContext, assertContext } from './utils/middlewares.mjs'
import { commands } from './cmds/index.mjs'

yargs(hideBin(process.argv))
  .usage('\nUsage: contentful <cmd> [args]')
  .command(commands)
  .middleware([buildContext, assertContext])
  .scriptName('')
  .demandCommand(4, 'Please specify a command.')
  .help('h')
  .alias('h', 'help')
  .alias('v', 'version')
  .strict()
  .recommendCommands()
  .epilog('Copyright 2019 Contentful')
  .fail(function (msg, err, yargs) {
    if (err) throw err
    console.error(yargs.help())
    console.error(msg)
    process.exit(1)
  })
  .parse()
