import yargs from 'yargs'
import {version} from '../package.json'

yargs.usage('\nUsage: contentful <cmd> [args]')
  .completion()
  .commandDir('cmds')
  .demandCommand(4, 'Please specify a command.')
  .help('h')
  .alias('h', 'help')
  .strict()
  .version(version)
  .epilog('Copyright 2017 Contentful, this is a BETA release')
  .parse(process.argv.slice(2))
