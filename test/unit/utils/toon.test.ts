import { toTOON } from '../../../lib/utils/toon'
import { encode } from '../../../lib/utils/toon-encoder'

describe('toTOON()', () => {
  describe('simple objects', () => {
    it('serializes a flat object to TOON string', () => {
      expect(toTOON({ name: 'Alice', age: 30 })).toBe('name: Alice\nage: 30')
    })

    it('serializes an empty object to empty string', () => {
      expect(toTOON({})).toBe('')
    })

    it('serializes a nested object', () => {
      const result = toTOON({ outer: { inner: { value: 'deep' } } })
      expect(result).toBe('outer:\n  inner:\n    value: deep')
    })

    it('serializes object with mixed value types', () => {
      const result = toTOON({ id: 1, label: 'item', active: true, owner: null })
      expect(result).toBe('id: 1\nlabel: item\nactive: true\nowner: null')
    })
  })

  describe('arrays of objects — tabular format', () => {
    it('uses tabular format for arrays of uniform objects', () => {
      const result = toTOON([
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' }
      ])
      expect(result).toBe('[2]{id,name}:\n  1,Alice\n  2,Bob')
    })

    it('uses list format for arrays of non-uniform objects', () => {
      const result = toTOON([
        { a: 1, b: [1, 2] },
        { a: 2, b: [3, 4] }
      ])
      expect(result).toBe(
        '[2]:\n  - a: 1\n    b[2]: 1,2\n  - a: 2\n    b[2]: 3,4'
      )
    })
  })

  describe('primitives', () => {
    it('serializes a string', () => {
      expect(toTOON('hello')).toBe('hello')
    })

    it('serializes a number', () => {
      expect(toTOON(42)).toBe('42')
    })

    it('serializes a float', () => {
      expect(toTOON(3.14)).toBe('3.14')
    })

    it('serializes boolean true', () => {
      expect(toTOON(true)).toBe('true')
    })

    it('serializes boolean false', () => {
      expect(toTOON(false)).toBe('false')
    })

    it('serializes null', () => {
      expect(toTOON(null)).toBe('null')
    })

    it('serializes undefined as null', () => {
      expect(toTOON(undefined)).toBe('null')
    })
  })

  describe('nested objects', () => {
    it('serializes deeply nested structures', () => {
      const result = toTOON({
        user: {
          profile: {
            name: 'Alice',
            location: 'Berlin'
          }
        }
      })
      expect(result).toBe(
        'user:\n  profile:\n    name: Alice\n    location: Berlin'
      )
    })

    it('serializes object with nested array of objects', () => {
      const result = toTOON({
        team: {
          members: [
            { id: 1, role: 'admin' },
            { id: 2, role: 'viewer' }
          ]
        }
      })
      expect(result).toBe(
        'team:\n  members[2]{id,role}:\n    1,admin\n    2,viewer'
      )
    })

    it('serializes object with nested primitive array', () => {
      const result = toTOON({ tags: ['a', 'b', 'c'] })
      expect(result).toBe('tags[3]: a,b,c')
    })
  })

  describe('round-trip consistency', () => {
    it('produces the same output as encode() from toon-encoder', () => {
      const input = {
        id: 1,
        name: 'Test',
        tags: ['x', 'y'],
        meta: { created: true }
      }
      expect(toTOON(input)).toBe(encode(input))
    })

    it('is consistent across multiple calls with the same input', () => {
      const input = {
        items: [
          { id: 1, name: 'A' },
          { id: 2, name: 'B' }
        ]
      }
      expect(toTOON(input)).toBe(toTOON(input))
    })
  })
})
