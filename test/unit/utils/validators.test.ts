import {
  validateId,
  validateJsonFields,
  validateLimit,
  validateNonNegativeInt,
  validatePositiveInt
} from '../../../lib/utils/validators'

describe('validateId', () => {
  describe('valid inputs', () => {
    it('accepts alphanumeric ids', () => {
      expect(validateId('abc123', 'entryId')).toBe('abc123')
    })

    it('accepts ids with hyphens', () => {
      expect(validateId('my-entry', 'entryId')).toBe('my-entry')
    })

    it('accepts ids with underscores', () => {
      expect(validateId('entry_1', 'entryId')).toBe('entry_1')
    })

    it('accepts uppercase letters', () => {
      expect(validateId('ABC', 'entryId')).toBe('ABC')
    })

    it('returns the validated value', () => {
      const result = validateId('valid-id_123', 'testLabel')
      expect(result).toBe('valid-id_123')
    })
  })

  describe('invalid inputs', () => {
    it('throws for empty string', () => {
      expect(() => validateId('', 'entryId')).toThrow('entryId is required')
    })

    it('throws for path traversal characters', () => {
      expect(() => validateId('path/traversal', 'entryId')).toThrow(
        'Invalid entryId'
      )
    })

    it('throws for strings with spaces', () => {
      expect(() => validateId('has spaces', 'entryId')).toThrow(
        'Invalid entryId'
      )
    })

    it('throws for strings with control characters', () => {
      expect(() => validateId('control\x00char', 'entryId')).toThrow(
        'Invalid entryId'
      )
    })

    it('throws for strings with semicolons', () => {
      expect(() => validateId('semi;colon', 'entryId')).toThrow(
        'Invalid entryId'
      )
    })

    it('throws for dot notation', () => {
      expect(() => validateId('dot.notation', 'entryId')).toThrow(
        'Invalid entryId'
      )
    })

    it('throws for null cast as string', () => {
      expect(() => validateId(null as unknown as string, 'entryId')).toThrow(
        'entryId is required'
      )
    })

    it('throws for undefined cast as string', () => {
      expect(() =>
        validateId(undefined as unknown as string, 'entryId')
      ).toThrow('entryId is required')
    })

    it('includes the label in the error message', () => {
      expect(() => validateId('bad/id', 'spaceId')).toThrow('Invalid spaceId')
    })

    it('includes the invalid value in the error message', () => {
      expect(() => validateId('bad/id', 'entryId')).toThrow('"bad/id"')
    })
  })
})

describe('validateJsonFields', () => {
  describe('valid inputs', () => {
    it('parses a valid JSON object', () => {
      const result = validateJsonFields('{"title": {"en-US": "Hello"}}')
      expect(result).toEqual({ title: { 'en-US': 'Hello' } })
    })

    it('returns a plain object', () => {
      const result = validateJsonFields('{"key": "value"}')
      expect(typeof result).toBe('object')
      expect(result).not.toBeNull()
      expect(Array.isArray(result)).toBe(false)
    })
  })

  describe('invalid inputs', () => {
    it('throws with SyntaxError message for invalid JSON', () => {
      expect(() => validateJsonFields('not json')).toThrow(
        'Invalid JSON in --fields:'
      )
    })

    it('throws "must be a JSON object" for a JSON string', () => {
      expect(() => validateJsonFields('"string"')).toThrow(
        'Fields must be a JSON object'
      )
    })

    it('throws "must be a JSON object" for a JSON array', () => {
      expect(() => validateJsonFields('[1,2]')).toThrow(
        'Fields must be a JSON object'
      )
    })

    it('throws "must be a JSON object" for JSON null', () => {
      expect(() => validateJsonFields('null')).toThrow(
        'Fields must be a JSON object'
      )
    })
  })
})

describe('validatePositiveInt', () => {
  describe('valid inputs', () => {
    it('accepts 1', () => {
      expect(validatePositiveInt(1, '--skip')).toBe(1)
    })

    it('accepts 100', () => {
      expect(validatePositiveInt(100, '--skip')).toBe(100)
    })

    it('accepts numeric string "50"', () => {
      expect(validatePositiveInt('50', '--skip')).toBe(50)
    })
  })

  describe('invalid inputs', () => {
    it('throws for 0', () => {
      expect(() => validatePositiveInt(0, '--skip')).toThrow(
        '--skip must be a positive integer'
      )
    })

    it('throws for negative number', () => {
      expect(() => validatePositiveInt(-1, '--skip')).toThrow(
        '--skip must be a positive integer'
      )
    })

    it('throws for non-numeric string', () => {
      expect(() => validatePositiveInt('abc', '--skip')).toThrow(
        '--skip must be a positive integer'
      )
    })

    it('throws for float', () => {
      expect(() => validatePositiveInt(1.5, '--skip')).toThrow(
        '--skip must be a positive integer'
      )
    })

    it('includes the label in the error message', () => {
      expect(() => validatePositiveInt(0, '--myParam')).toThrow('--myParam')
    })

    it('includes the invalid value in the error message', () => {
      expect(() => validatePositiveInt(-5, '--skip')).toThrow('got: -5')
    })
  })
})

describe('validateNonNegativeInt', () => {
  describe('valid inputs', () => {
    it('accepts 0', () => {
      expect(validateNonNegativeInt(0, '--skip')).toBe(0)
    })

    it('accepts 1', () => {
      expect(validateNonNegativeInt(1, '--skip')).toBe(1)
    })

    it('accepts 100', () => {
      expect(validateNonNegativeInt(100, '--skip')).toBe(100)
    })
  })

  describe('invalid inputs', () => {
    it('throws for negative number', () => {
      expect(() => validateNonNegativeInt(-1, '--skip')).toThrow(
        '--skip must be a non-negative integer'
      )
    })

    it('throws for non-numeric string', () => {
      expect(() => validateNonNegativeInt('abc', '--skip')).toThrow(
        '--skip must be a non-negative integer'
      )
    })

    it('throws for float', () => {
      expect(() => validateNonNegativeInt(1.5, '--skip')).toThrow(
        '--skip must be a non-negative integer'
      )
    })

    it('includes the label in the error message', () => {
      expect(() => validateNonNegativeInt(-1, '--offset')).toThrow('--offset')
    })

    it('includes the invalid value in the error message', () => {
      expect(() => validateNonNegativeInt(-3, '--skip')).toThrow('got: -3')
    })
  })
})

describe('validateLimit', () => {
  describe('valid inputs', () => {
    it('accepts 1', () => {
      expect(validateLimit(1)).toBe(1)
    })

    it('accepts 100', () => {
      expect(validateLimit(100)).toBe(100)
    })

    it('accepts 1000', () => {
      expect(validateLimit(1000)).toBe(1000)
    })
  })

  describe('invalid inputs', () => {
    it('throws for 0', () => {
      expect(() => validateLimit(0)).toThrow(
        '--limit must be a positive integer'
      )
    })

    it('throws for value greater than 1000', () => {
      expect(() => validateLimit(1001)).toThrow(
        '--limit must be between 1 and 1000'
      )
    })

    it('throws for negative number', () => {
      expect(() => validateLimit(-1)).toThrow(
        '--limit must be a positive integer'
      )
    })
  })
})
