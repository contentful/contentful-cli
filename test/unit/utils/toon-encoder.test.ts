import {encode, encodeLines} from '../../../lib/utils/toon-encoder'

describe('toon-encoder', () => {
  describe('encode()', () => {
    it('encodes a simple flat object', () => {
      expect(encode({name: 'Alice', age: 30})).toBe('name: Alice\nage: 30')
    })

    it('encodes boolean and null values', () => {
      expect(encode({active: true, deleted: false, owner: null})).toBe(
        'active: true\ndeleted: false\nowner: null'
      )
    })

    it('encodes an inline primitive array', () => {
      expect(encode({items: [1, 2, 3]})).toBe('items[3]: 1,2,3')
    })

    it('encodes an empty array', () => {
      expect(encode({items: []})).toBe('items[0]:')
    })

    it('encodes a tabular array of objects with uniform primitive fields', () => {
      const result = encode({
        users: [
          {id: 1, name: 'Alice'},
          {id: 2, name: 'Bob'},
        ],
      })
      expect(result).toBe('users[2]{id,name}:\n  1,Alice\n  2,Bob')
    })

    it('encodes a list array of mixed-structure objects', () => {
      const result = encode({items: [{a: 1, b: [1, 2]}, {a: 2, b: [3, 4]}]})
      expect(result).toBe(
        'items[2]:\n  - a: 1\n    b[2]: 1,2\n  - a: 2\n    b[2]: 3,4'
      )
    })

    it('encodes a nested object', () => {
      const result = encode({outer: {inner: {value: 'deep'}}})
      expect(result).toBe('outer:\n  inner:\n    value: deep')
    })

    it('encodes an empty object as empty string', () => {
      expect(encode({})).toBe('')
    })

    it('encodes a standalone primitive string', () => {
      expect(encode('hello')).toBe('hello')
    })

    it('quotes string values that contain colons', () => {
      expect(encode({url: 'http://example.com'})).toBe(
        'url: "http://example.com"'
      )
    })

    it('quotes string values that match boolean/null literals', () => {
      expect(encode({flag: 'true'})).toBe('flag: "true"')
      expect(encode({flag: 'null'})).toBe('flag: "null"')
    })

    it('escapes double quotes inside string values', () => {
      expect(encode({msg: 'say "hi"'})).toBe('msg: "say \\"hi\\""')
    })

    it('quotes object keys that contain special characters', () => {
      expect(encode({'my key': 'value'})).toBe('"my key": value')
    })

    it('encodes numeric values correctly', () => {
      expect(encode({int: 42, float: 3.14, neg: -1})).toBe(
        'int: 42\nfloat: 3.14\nneg: -1'
      )
    })

    it('normalises -0 to 0', () => {
      expect(encode({n: -0})).toBe('n: 0')
    })

    it('normalises non-finite numbers to null', () => {
      expect(encode({a: Infinity, b: NaN})).toBe('a: null\nb: null')
    })

    it('normalises Date to ISO string (quoted because ISO contains colons)', () => {
      const d = new Date('2024-01-15T00:00:00.000Z')
      // ISO strings contain colons so they must be quoted in TOON
      expect(encode({ts: d})).toBe('ts: "2024-01-15T00:00:00.000Z"')
    })

    it('respects custom indent option', () => {
      const result = encode({outer: {inner: 1}}, {indent: 4})
      expect(result).toBe('outer:\n    inner: 1')
    })
  })

  describe('encodeLines()', () => {
    it('returns an iterable of lines', () => {
      const lines = Array.from(encodeLines({a: 1, b: 2}))
      expect(lines).toEqual(['a: 1', 'b: 2'])
    })
  })
})
