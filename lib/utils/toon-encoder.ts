/**
 * Minimal TOON format encoder.
 *
 * TOON (Text Object Notation) is a human-readable format similar to YAML.
 * This module provides a CJS-compatible subset implementation covering objects,
 * arrays (inline primitive, tabular, and list forms), and primitive values.
 *
 * See: https://github.com/toon-format/toon
 *
 * @remarks
 * The @toon-format/toon npm package ships as ESM-only and does not support
 * require() on Node < 22. This inline implementation ensures compatibility
 * with the project's Node >= 18 requirement.
 */

const COLON = ':'
const COMMA = ','
const SPACE = ' '
const DOUBLE_QUOTE = '"'
const BACKSLASH = '\\'
const LIST_ITEM_PREFIX = '- '
const LIST_ITEM_MARKER = '-'

// ---------------------------------------------------------------------------
// String utilities
// ---------------------------------------------------------------------------

function escapeString(value: string): string {
  return value
    .replace(/\\/g, `${BACKSLASH}${BACKSLASH}`)
    .replace(/"/g, `${BACKSLASH}${DOUBLE_QUOTE}`)
    .replace(/\n/g, `${BACKSLASH}n`)
    .replace(/\r/g, `${BACKSLASH}r`)
    .replace(/\t/g, `${BACKSLASH}t`)
}

/** Returns true if value is one of the boolean/null literals TOON reserves. */
function isBooleanOrNullLiteral(value: string): boolean {
  return value === 'true' || value === 'false' || value === 'null'
}

/** Returns true if value looks like a number and would be mis-parsed. */
function isNumericLike(value: string): boolean {
  return (
    /^-?\d+(?:\.\d+)?(?:e[+-]?\d+)?$/i.test(value) || /^0\d+$/.test(value)
  )
}

/**
 * Returns true when a string value can appear without double-quotes in output.
 *
 * A value needs quoting if it is empty, has surrounding whitespace, could be
 * confused with a literal (boolean, null, number), contains structural
 * characters, or contains the active delimiter.
 */
function isSafeUnquoted(value: string, delimiter = COMMA): boolean {
  if (!value) return false
  if (value !== value.trim()) return false
  if (isBooleanOrNullLiteral(value) || isNumericLike(value)) return false
  if (value.includes(COLON)) return false
  if (value.includes(DOUBLE_QUOTE) || value.includes(BACKSLASH)) return false
  if (/[[\]{}]/.test(value)) return false
  if (/[\n\r\t]/.test(value)) return false
  if (value.includes(delimiter)) return false
  if (value.startsWith(LIST_ITEM_MARKER)) return false
  return true
}

/** Returns true when a key can appear without quotes. */
function isValidUnquotedKey(key: string): boolean {
  return /^[A-Z_][\w.]*$/i.test(key)
}

// ---------------------------------------------------------------------------
// Primitive encoding
// ---------------------------------------------------------------------------

type JsonPrimitive = string | number | boolean | null

function encodePrimitive(value: JsonPrimitive, delimiter = COMMA): string {
  if (value === null) return 'null'
  if (typeof value === 'boolean') return String(value)
  if (typeof value === 'number') return String(value)
  return encodeStringLiteral(value, delimiter)
}

function encodeStringLiteral(value: string, delimiter = COMMA): string {
  if (isSafeUnquoted(value, delimiter)) return value
  return `${DOUBLE_QUOTE}${escapeString(value)}${DOUBLE_QUOTE}`
}

function encodeKey(key: string): string {
  if (isValidUnquotedKey(key)) return key
  return `${DOUBLE_QUOTE}${escapeString(key)}${DOUBLE_QUOTE}`
}

// ---------------------------------------------------------------------------
// Type predicates
// ---------------------------------------------------------------------------

type JsonValue = JsonPrimitive | JsonObject | JsonArray

interface JsonObject {
  [key: string]: JsonValue
}

type JsonArray = JsonValue[]

function isJsonPrimitive(value: JsonValue): value is JsonPrimitive {
  return (
    value === null ||
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  )
}

function isJsonArray(value: JsonValue): value is JsonArray {
  return Array.isArray(value)
}

function isJsonObject(value: JsonValue): value is JsonObject {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function isEmptyObject(value: JsonObject): boolean {
  return Object.keys(value).length === 0
}

function isArrayOfPrimitives(arr: JsonArray): arr is JsonPrimitive[] {
  return arr.length === 0 || arr.every((item) => isJsonPrimitive(item))
}

function isArrayOfObjects(arr: JsonArray): arr is JsonObject[] {
  return arr.length === 0 || arr.every((item) => isJsonObject(item))
}

// ---------------------------------------------------------------------------
// Tabular array detection
// ---------------------------------------------------------------------------

/**
 * Returns field names when the array qualifies as a tabular array — every row
 * is an object with the same primitive-valued keys in the same order.
 */
function extractTabularHeader(rows: JsonObject[]): string[] | undefined {
  if (rows.length === 0) return undefined
  const firstKeys = Object.keys(rows[0])
  if (firstKeys.length === 0) return undefined
  for (const row of rows) {
    const rowKeys = Object.keys(row)
    if (rowKeys.length !== firstKeys.length) return undefined
    for (const key of firstKeys) {
      if (!(key in row)) return undefined
      if (!isJsonPrimitive(row[key])) return undefined
    }
  }
  return firstKeys
}

// ---------------------------------------------------------------------------
// Header/line formatting
// ---------------------------------------------------------------------------

function formatHeader(
  length: number,
  opts?: {key?: string; fields?: string[]; delimiter?: string}
): string {
  const delimiter = opts?.delimiter ?? COMMA
  let header = ''
  if (opts?.key) header += encodeKey(opts.key)
  header += `[${length}${delimiter !== COMMA ? delimiter : ''}]`
  if (opts?.fields) {
    const quotedFields = opts.fields.map((f) => encodeKey(f))
    header += `{${quotedFields.join(delimiter)}}`
  }
  header += COLON
  return header
}

function indentedLine(depth: number, content: string, indentSize: number): string {
  return ' '.repeat(indentSize * depth) + content
}

function indentedListItem(
  depth: number,
  content: string,
  indentSize: number
): string {
  return indentedLine(depth, LIST_ITEM_PREFIX + content, indentSize)
}

// ---------------------------------------------------------------------------
// Encoding options
// ---------------------------------------------------------------------------

interface EncodeOptions {
  /** Number of spaces per indent level. Default: 2. */
  indent?: number
  /** Delimiter used for inline arrays. Default: ',' */
  delimiter?: string
}

interface ResolvedEncodeOptions {
  indent: number
  delimiter: string
}

function resolveOptions(options?: EncodeOptions): ResolvedEncodeOptions {
  return {
    indent: options?.indent ?? 2,
    delimiter: options?.delimiter ?? COMMA,
  }
}

// ---------------------------------------------------------------------------
// Core encode generators
// ---------------------------------------------------------------------------

function* encodeJsonValue(
  value: JsonValue,
  options: ResolvedEncodeOptions,
  depth: number
): Generator<string> {
  if (isJsonPrimitive(value)) {
    const encoded = encodePrimitive(value, options.delimiter)
    if (encoded !== '') yield encoded
    return
  }
  if (isJsonArray(value)) {
    yield* encodeArrayLines(undefined, value, depth, options)
  } else if (isJsonObject(value)) {
    yield* encodeObjectLines(value, depth, options)
  }
}

function* encodeObjectLines(
  value: JsonObject,
  depth: number,
  options: ResolvedEncodeOptions
): Generator<string> {
  for (const [key, val] of Object.entries(value)) {
    yield* encodeKeyValuePairLines(key, val, depth, options)
  }
}

function* encodeKeyValuePairLines(
  key: string,
  value: JsonValue,
  depth: number,
  options: ResolvedEncodeOptions
): Generator<string> {
  const encodedKey = encodeKey(key)
  if (isJsonPrimitive(value)) {
    yield indentedLine(
      depth,
      `${encodedKey}${COLON}${SPACE}${encodePrimitive(value, options.delimiter)}`,
      options.indent
    )
  } else if (isJsonArray(value)) {
    yield* encodeArrayLines(key, value, depth, options)
  } else if (isJsonObject(value)) {
    yield indentedLine(depth, `${encodedKey}${COLON}`, options.indent)
    if (!isEmptyObject(value)) {
      yield* encodeObjectLines(value, depth + 1, options)
    }
  }
}

function encodeAndJoinPrimitives(
  values: JsonPrimitive[],
  delimiter: string
): string {
  return values.map((v) => encodePrimitive(v, delimiter)).join(delimiter)
}

function encodeInlineArrayLine(
  values: JsonPrimitive[],
  delimiter: string,
  prefix?: string
): string {
  const header = formatHeader(values.length, {key: prefix, delimiter})
  if (values.length === 0) return header
  return `${header}${SPACE}${encodeAndJoinPrimitives(values, delimiter)}`
}

function* encodeArrayLines(
  key: string | undefined,
  value: JsonArray,
  depth: number,
  options: ResolvedEncodeOptions
): Generator<string> {
  const {delimiter, indent} = options

  if (value.length === 0) {
    yield indentedLine(depth, formatHeader(0, {key, delimiter}), indent)
    return
  }

  // Inline primitive array: items[3]: 1,2,3
  if (isArrayOfPrimitives(value)) {
    yield indentedLine(
      depth,
      encodeInlineArrayLine(value as JsonPrimitive[], delimiter, key),
      indent
    )
    return
  }

  // Tabular array: all rows are objects with same primitive-valued keys
  if (isArrayOfObjects(value)) {
    const header = extractTabularHeader(value as JsonObject[])
    if (header) {
      yield* encodeArrayOfObjectsAsTabularLines(
        key,
        value as JsonObject[],
        header,
        depth,
        options
      )
      return
    }
  }

  // Generic list array
  yield* encodeMixedArrayAsListItemsLines(key, value, depth, options)
}

function* encodeArrayOfObjectsAsTabularLines(
  key: string | undefined,
  rows: JsonObject[],
  header: string[],
  depth: number,
  options: ResolvedEncodeOptions
): Generator<string> {
  const {delimiter, indent} = options
  yield indentedLine(
    depth,
    formatHeader(rows.length, {key, fields: header, delimiter}),
    indent
  )
  for (const row of rows) {
    yield indentedLine(
      depth + 1,
      encodeAndJoinPrimitives(
        header.map((k) => row[k] as JsonPrimitive),
        delimiter
      ),
      indent
    )
  }
}

function* encodeMixedArrayAsListItemsLines(
  key: string | undefined,
  items: JsonArray,
  depth: number,
  options: ResolvedEncodeOptions
): Generator<string> {
  yield indentedLine(
    depth,
    formatHeader(items.length, {key, delimiter: options.delimiter}),
    options.indent
  )
  for (const item of items) {
    yield* encodeListItemValueLines(item, depth + 1, options)
  }
}

function* encodeListItemValueLines(
  value: JsonValue,
  depth: number,
  options: ResolvedEncodeOptions
): Generator<string> {
  const {delimiter, indent} = options
  if (isJsonPrimitive(value)) {
    yield indentedListItem(depth, encodePrimitive(value, delimiter), indent)
  } else if (isJsonArray(value)) {
    if (isArrayOfPrimitives(value)) {
      yield indentedListItem(
        depth,
        encodeInlineArrayLine(value as JsonPrimitive[], delimiter),
        indent
      )
    } else {
      yield indentedListItem(
        depth,
        formatHeader(value.length, {delimiter}),
        indent
      )
      for (const item of value) {
        yield* encodeListItemValueLines(item, depth + 1, options)
      }
    }
  } else if (isJsonObject(value)) {
    yield* encodeObjectAsListItemLines(value, depth, options)
  }
}

function* encodeObjectAsListItemLines(
  obj: JsonObject,
  depth: number,
  options: ResolvedEncodeOptions
): Generator<string> {
  const {delimiter, indent} = options
  if (isEmptyObject(obj)) {
    yield indentedLine(depth, LIST_ITEM_MARKER, indent)
    return
  }
  const entries = Object.entries(obj)
  const [firstKey, firstValue] = entries[0]
  const restEntries = entries.slice(1)
  const encodedFirstKey = encodeKey(firstKey)

  if (isJsonPrimitive(firstValue)) {
    yield indentedListItem(
      depth,
      `${encodedFirstKey}${COLON}${SPACE}${encodePrimitive(firstValue, delimiter)}`,
      indent
    )
  } else if (isJsonArray(firstValue)) {
    if (firstValue.length === 0) {
      yield indentedListItem(
        depth,
        `${encodedFirstKey}${formatHeader(0, {delimiter})}`,
        indent
      )
    } else if (isArrayOfPrimitives(firstValue)) {
      yield indentedListItem(
        depth,
        `${encodedFirstKey}${encodeInlineArrayLine(firstValue as JsonPrimitive[], delimiter)}`,
        indent
      )
    } else {
      yield indentedListItem(
        depth,
        `${encodedFirstKey}${formatHeader(firstValue.length, {delimiter})}`,
        indent
      )
      for (const item of firstValue) {
        yield* encodeListItemValueLines(item, depth + 2, options)
      }
    }
  } else if (isJsonObject(firstValue)) {
    yield indentedListItem(depth, `${encodedFirstKey}${COLON}`, indent)
    if (!isEmptyObject(firstValue)) {
      yield* encodeObjectLines(firstValue, depth + 2, options)
    }
  }

  if (restEntries.length > 0) {
    yield* encodeObjectLines(Object.fromEntries(restEntries), depth + 1, options)
  }
}

// ---------------------------------------------------------------------------
// Value normalisation
// ---------------------------------------------------------------------------

/**
 * Converts an arbitrary JavaScript value into a JSON-compatible value suitable
 * for TOON encoding. Handles Dates, Sets, Maps, BigInts, and objects with a
 * `toJSON()` method. Non-serialisable values become `null`.
 */
function normalizeValue(value: unknown): JsonValue {
  if (value === null || value === undefined) return null
  if (
    typeof value === 'object' &&
    value !== null &&
    'toJSON' in value &&
    typeof (value as {toJSON: unknown}).toJSON === 'function'
  ) {
    const next = (value as {toJSON(): unknown}).toJSON()
    if (next !== value) return normalizeValue(next)
  }
  if (typeof value === 'string' || typeof value === 'boolean') return value
  if (typeof value === 'number') {
    if (Object.is(value, -0)) return 0
    if (!Number.isFinite(value)) return null
    return value
  }
  if (typeof value === 'bigint') {
    if (value >= BigInt(Number.MIN_SAFE_INTEGER) && value <= BigInt(Number.MAX_SAFE_INTEGER)) {
      return Number(value)
    }
    return value.toString()
  }
  if (value instanceof Date) return value.toISOString()
  if (Array.isArray(value)) return value.map(normalizeValue)
  if (value instanceof Set) return Array.from(value).map(normalizeValue)
  if (value instanceof Map) {
    return Object.fromEntries(
      Array.from(value, ([k, v]) => [String(k), normalizeValue(v)])
    )
  }
  // Plain objects
  if (typeof value === 'object') {
    const normalized: JsonObject = {}
    for (const key in value as object) {
      if (Object.prototype.hasOwnProperty.call(value, key)) {
        normalized[key] = normalizeValue((value as Record<string, unknown>)[key])
      }
    }
    return normalized
  }
  return null
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Encodes a JavaScript value into a TOON format string.
 *
 * @param input - Any JavaScript value (objects, arrays, primitives)
 * @param options - Optional encoding configuration
 * @returns TOON formatted string
 *
 * @example
 * ```ts
 * encode({ name: 'Alice', age: 30 })
 * // name: Alice
 * // age: 30
 *
 * encode({ users: [{ id: 1, name: 'Bob' }, { id: 2, name: 'Eve' }] })
 * // users[2]{id,name}:
 * //   1,Bob
 * //   2,Eve
 * ```
 */
export function encode(input: unknown, options?: EncodeOptions): string {
  return Array.from(encodeLines(input, options)).join('\n')
}

/**
 * Encodes a JavaScript value into TOON format yielding one line at a time.
 * Suitable for streaming to files or stdout without building the full string.
 *
 * @param input - Any JavaScript value (objects, arrays, primitives)
 * @param options - Optional encoding configuration
 * @returns Iterable of TOON lines (without trailing newlines)
 */
export function encodeLines(
  input: unknown,
  options?: EncodeOptions
): Iterable<string> {
  const normalized = normalizeValue(input)
  const resolved = resolveOptions(options)
  return encodeJsonValue(normalized, resolved, 0)
}
