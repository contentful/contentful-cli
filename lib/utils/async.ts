import type { Arguments } from 'yargs'
import { logError } from './log'

export const handleAsyncError =
  <TParams = Arguments>(
    asyncFn: (params: TParams) => Promise<unknown>,
    errorHandler = logError
  ) =>
  (argv: TParams) =>
    asyncFn(argv).catch((error: Error) => {
      errorHandler(error)
      // Since the error got catched to allow async commands in yargs
      // and we can't throw to avoid unresolved promise rejections,
      // we manually exit here with exit code 1
      process.exit(1)
    })
