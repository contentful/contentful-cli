import { logError } from './log'

export const EXIT_SUCCESS = 0
export const EXIT_CLIENT_ERROR = 1
export const EXIT_SERVER_ERROR = 2

interface ErrorWithStatus {
  response?: {
    status?: unknown
  }
  statusCode?: unknown
  status?: unknown
}

function errorStatus(error: unknown): unknown {
  if (!error || typeof error !== 'object') return undefined
  const candidate = error as ErrorWithStatus
  return candidate.response?.status || candidate.statusCode || candidate.status
}

export function classifyError(error: unknown): number {
  const status = errorStatus(error)
  if (typeof status === 'number' && status >= 500) {
    return EXIT_SERVER_ERROR
  }
  return EXIT_CLIENT_ERROR
}

export const handleAsyncErrorWithExitCode =
  <TParams>(
    asyncFn: (params: TParams) => Promise<unknown>,
    errorHandler: (error: Error) => void = logError
  ) =>
  (argv: TParams) =>
    asyncFn(argv).catch((error: Error) => {
      errorHandler(error)
      process.exit(classifyError(error))
    })
