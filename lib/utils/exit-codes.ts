import { logError } from './log'

export const EXIT_SUCCESS = 0
export const EXIT_CLIENT_ERROR = 1
export const EXIT_SERVER_ERROR = 2

export function classifyError(error: unknown): number {
  if (error && typeof error === 'object') {
    const status =
      (error as any)?.response?.status ||
      (error as any)?.statusCode ||
      (error as any)?.status
    if (typeof status === 'number' && status >= 500) {
      return EXIT_SERVER_ERROR
    }
  }
  return EXIT_CLIENT_ERROR
}

export const handleAsyncErrorWithExitCode =
  (
    asyncFn: (params: any) => Promise<unknown>,
    errorHandler: (error: Error) => void = logError
  ) =>
  (argv: any) =>
    asyncFn(argv).catch((error: Error) => {
      errorHandler(error)
      process.exit(classifyError(error))
    })
