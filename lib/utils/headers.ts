/**
 * Turn header option into an object. Invalid header values
 * are ignored.
 *
 * @example
 * getHeadersFromOption('Accept: Any')
 * // -> {Accept: 'Any'}
 *
 * @example
 * getHeadersFromOption(['Accept: Any', 'X-Version: 1'])
 * // -> {Accept: 'Any', 'X-Version': '1'}
 */
export function getHeadersFromOption(
  value?: string | string[]
): Record<string, string> {
  if (!value) {
    return {}
  }

  const values = Array.isArray(value) ? value : [value]

  return values.reduce<Record<string, string>>((headers, value) => {
    value = value.trim()

    const separatorIndex = value.indexOf(':')

    // Invalid header format
    if (separatorIndex === -1) {
      return headers
    }

    const headerKey = value.slice(0, separatorIndex).trim()
    const headerValue = value.slice(separatorIndex + 1).trim()

    return {
      ...headers,
      [headerKey]: headerValue
    }
  }, {})
}
