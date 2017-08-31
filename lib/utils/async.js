import { logError } from './log'

export const handleAsyncError = (asyncFn, errorHandler = logError) => (argv) => {
  return asyncFn(argv)
  .catch(errorHandler)
}
