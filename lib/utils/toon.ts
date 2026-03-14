import {encode} from './toon-encoder'

/**
 * Serialize data to TOON format for --agent-mode output.
 * Wraps the inline TOON encoder (CJS-compatible).
 */
export function toTOON(data: unknown): string {
  return encode(data)
}
