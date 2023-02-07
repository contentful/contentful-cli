import { Argv } from 'yargs'
import { logError } from './log'

export const handleAsyncError =
  (asyncFn: (params: any) => Promise<unknown>, errorHandler = logError) =>
  (argv: Argv) =>
    asyncFn(argv).catch((error: Error) => {
      errorHandler(error)
      // Since the error got catched to allow async commands in yargs
      // and we can't throw to avoid unresolved promise rejections,
      // we manually exit here with exit code 1
      process.exit(1)
    })
