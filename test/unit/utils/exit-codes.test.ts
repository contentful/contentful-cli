import {
  classifyError,
  handleAsyncErrorWithExitCode,
  EXIT_SUCCESS,
  EXIT_CLIENT_ERROR,
  EXIT_SERVER_ERROR
} from '../../../lib/utils/exit-codes'

const exitStub = jest.fn()
let originalExit: typeof process.exit

beforeAll(() => {
  originalExit = global.process.exit
  global.process.exit = exitStub as any
})

afterAll(() => {
  global.process.exit = originalExit
})

beforeEach(() => {
  exitStub.mockClear()
})

describe('exit code constants', () => {
  test('EXIT_SUCCESS is 0', () => {
    expect(EXIT_SUCCESS).toBe(0)
  })

  test('EXIT_CLIENT_ERROR is 1', () => {
    expect(EXIT_CLIENT_ERROR).toBe(1)
  })

  test('EXIT_SERVER_ERROR is 2', () => {
    expect(EXIT_SERVER_ERROR).toBe(2)
  })
})

describe('classifyError', () => {
  describe('server errors (status >= 500)', () => {
    test('returns EXIT_SERVER_ERROR for error with response.status 500', () => {
      const error = { response: { status: 500 } }
      expect(classifyError(error)).toBe(EXIT_SERVER_ERROR)
    })

    test('returns EXIT_SERVER_ERROR for error with response.status 502', () => {
      const error = { response: { status: 502 } }
      expect(classifyError(error)).toBe(EXIT_SERVER_ERROR)
    })

    test('returns EXIT_SERVER_ERROR for error with response.status 503', () => {
      const error = { response: { status: 503 } }
      expect(classifyError(error)).toBe(EXIT_SERVER_ERROR)
    })

    test('returns EXIT_SERVER_ERROR for error with statusCode 500', () => {
      const error = { statusCode: 500 }
      expect(classifyError(error)).toBe(EXIT_SERVER_ERROR)
    })

    test('returns EXIT_SERVER_ERROR for error with status 500', () => {
      const error = { status: 500 }
      expect(classifyError(error)).toBe(EXIT_SERVER_ERROR)
    })
  })

  describe('client errors (status < 500)', () => {
    test('returns EXIT_CLIENT_ERROR for error with response.status 400', () => {
      const error = { response: { status: 400 } }
      expect(classifyError(error)).toBe(EXIT_CLIENT_ERROR)
    })

    test('returns EXIT_CLIENT_ERROR for error with response.status 404', () => {
      const error = { response: { status: 404 } }
      expect(classifyError(error)).toBe(EXIT_CLIENT_ERROR)
    })

    test('returns EXIT_CLIENT_ERROR for error with response.status 409', () => {
      const error = { response: { status: 409 } }
      expect(classifyError(error)).toBe(EXIT_CLIENT_ERROR)
    })

    test('returns EXIT_CLIENT_ERROR for error with statusCode 400', () => {
      const error = { statusCode: 400 }
      expect(classifyError(error)).toBe(EXIT_CLIENT_ERROR)
    })

    test('returns EXIT_CLIENT_ERROR for error with status 404', () => {
      const error = { status: 404 }
      expect(classifyError(error)).toBe(EXIT_CLIENT_ERROR)
    })
  })

  describe('errors with no status', () => {
    test('returns EXIT_CLIENT_ERROR for plain Error object', () => {
      const error = new Error('something went wrong')
      expect(classifyError(error)).toBe(EXIT_CLIENT_ERROR)
    })

    test('returns EXIT_CLIENT_ERROR for object with no status fields', () => {
      const error = { message: 'no status here' }
      expect(classifyError(error)).toBe(EXIT_CLIENT_ERROR)
    })

    test('returns EXIT_CLIENT_ERROR for empty object', () => {
      expect(classifyError({})).toBe(EXIT_CLIENT_ERROR)
    })
  })

  describe('non-object errors', () => {
    test('returns EXIT_CLIENT_ERROR for string error', () => {
      expect(classifyError('some error string')).toBe(EXIT_CLIENT_ERROR)
    })

    test('returns EXIT_CLIENT_ERROR for null', () => {
      expect(classifyError(null)).toBe(EXIT_CLIENT_ERROR)
    })

    test('returns EXIT_CLIENT_ERROR for undefined', () => {
      expect(classifyError(undefined)).toBe(EXIT_CLIENT_ERROR)
    })

    test('returns EXIT_CLIENT_ERROR for number', () => {
      expect(classifyError(42)).toBe(EXIT_CLIENT_ERROR)
    })
  })
})

describe('handleAsyncErrorWithExitCode', () => {
  test('calls the async function with argv on success', async () => {
    const asyncFn = jest.fn().mockResolvedValue('result')
    const errorHandler = jest.fn()

    const handlerFn = handleAsyncErrorWithExitCode(asyncFn, errorHandler)
    expect(typeof handlerFn).toBe('function')

    const argv = { value: 'foo' }
    const result = await handlerFn(argv)

    expect(asyncFn).toHaveBeenCalledWith(argv)
    expect(result).toBe('result')
    expect(errorHandler).not.toHaveBeenCalled()
    expect(exitStub).not.toHaveBeenCalled()
  })

  test('calls errorHandler and process.exit on rejection with client error', async () => {
    const error = new Error('not found')
    const asyncFn = jest.fn().mockRejectedValue(error)
    const errorHandler = jest.fn()

    const handlerFn = handleAsyncErrorWithExitCode(asyncFn, errorHandler)
    await handlerFn({ value: 'foo' })

    expect(errorHandler).toHaveBeenCalledWith(error)
    expect(exitStub).toHaveBeenCalledWith(EXIT_CLIENT_ERROR)
  })

  test('calls process.exit with EXIT_SERVER_ERROR for 500 status errors', async () => {
    const error = Object.assign(new Error('server error'), {
      response: { status: 500 }
    })
    const asyncFn = jest.fn().mockRejectedValue(error)
    const errorHandler = jest.fn()

    const handlerFn = handleAsyncErrorWithExitCode(asyncFn, errorHandler)
    await handlerFn({})

    expect(errorHandler).toHaveBeenCalledWith(error)
    expect(exitStub).toHaveBeenCalledWith(EXIT_SERVER_ERROR)
  })

  test('calls process.exit with EXIT_CLIENT_ERROR for 404 status errors', async () => {
    const error = Object.assign(new Error('not found'), {
      response: { status: 404 }
    })
    const asyncFn = jest.fn().mockRejectedValue(error)
    const errorHandler = jest.fn()

    const handlerFn = handleAsyncErrorWithExitCode(asyncFn, errorHandler)
    await handlerFn({})

    expect(exitStub).toHaveBeenCalledWith(EXIT_CLIENT_ERROR)
  })

  test('uses logError as default error handler', async () => {
    const error = new Error('default handler test')
    const asyncFn = jest.fn().mockRejectedValue(error)

    // Should not throw — logError is the default
    const handlerFn = handleAsyncErrorWithExitCode(asyncFn)
    await handlerFn({})

    expect(exitStub).toHaveBeenCalledWith(EXIT_CLIENT_ERROR)
  })
})
