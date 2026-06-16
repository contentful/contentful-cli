const ID_PATTERN = /^[a-zA-Z0-9_-]+$/

export function validateId(value: string, label: string): string {
  if (!value || typeof value !== 'string') {
    throw new Error(`${label} is required`)
  }
  if (!ID_PATTERN.test(value)) {
    throw new Error(
      `Invalid ${label}: "${value}". Must contain only letters, numbers, hyphens, and underscores.`
    )
  }
  return value
}

export function validateJsonFields(value: string): Record<string, unknown> {
  try {
    const parsed = JSON.parse(value)
    if (
      typeof parsed !== 'object' ||
      parsed === null ||
      Array.isArray(parsed)
    ) {
      throw new Error('Fields must be a JSON object')
    }
    return parsed as Record<string, unknown>
  } catch (err) {
    if (err instanceof SyntaxError) {
      throw new Error(`Invalid JSON in --fields: ${err.message}`)
    }
    throw err
  }
}

export function validatePositiveInt(value: unknown, label: string): number {
  const num = Number(value)
  if (!Number.isInteger(num) || num < 1) {
    throw new Error(`${label} must be a positive integer, got: ${value}`)
  }
  return num
}

export function validateNonNegativeInt(value: unknown, label: string): number {
  const num = Number(value)
  if (!Number.isInteger(num) || num < 0) {
    throw new Error(`${label} must be a non-negative integer, got: ${value}`)
  }
  return num
}

export function validateLimit(value: unknown): number {
  const num = validatePositiveInt(value, '--limit')
  if (num > 1000) {
    throw new Error('--limit must be between 1 and 1000')
  }
  return num
}
