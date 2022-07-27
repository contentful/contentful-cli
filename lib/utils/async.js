import { logError } from './log.mjs'

export const handleAsyncError =
  (asyncFn, errorHandler = logError) =>
  argv => {
    return asyncFn(argv).catch(error => {
      errorHandler(error)
      // Since the error got catched to allow async commands in yargs
      // and we can't throw to avoid unresolved promise rejections,
      // we manually exit here with exit code 1
      process.exit(1)
    })
  }
