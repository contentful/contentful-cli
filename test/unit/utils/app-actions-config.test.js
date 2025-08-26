import {
  getAppDefinitionId,
  getAppActionId
} from '../../../lib/utils/app-actions-config'

describe('app-actions-config', () => {
  describe('getAppDefinitionId', () => {
    it('returns correct app definition ID for api.contentful.com', () => {
      const result = getAppDefinitionId('api.contentful.com')
      expect(result).toBe('cQeaauOu1yUCYVhQ00atE')
    })

    it('returns correct app definition ID for api.eu.contentful.com', () => {
      const result = getAppDefinitionId('api.eu.contentful.com')
      expect(result).toBe('cQeaauOu1yUCYVhQ00atE')
    })

    it('returns correct app definition ID for api.flinkly.com', () => {
      const result = getAppDefinitionId('api.flinkly.com')
      expect(result).toBe('7tBJPpcwK1E1KqlxlMiKw5')
    })

    it('defaults to api.contentful.com when no host is provided', () => {
      const result = getAppDefinitionId()
      expect(result).toBe('cQeaauOu1yUCYVhQ00atE')
    })

    it('returns undefined app definition ID when invalid host is provided', () => {
      const result = getAppDefinitionId('invalid-host')
      expect(result).toBe(undefined)
    })
  })

  describe('getAppActionId', () => {
    describe('create-changeset action', () => {
      it('returns correct action ID for api.contentful.com', () => {
        const result = getAppActionId('create-changeset', 'api.contentful.com')
        expect(result).toBe('3yquPqLswfwwbY7taePuYp')
      })

      it('returns correct action ID for api.eu.contentful.com', () => {
        const result = getAppActionId(
          'create-changeset',
          'api.eu.contentful.com'
        )
        expect(result).toBe('3yquPqLswfwwbY7taePuYp')
      })

      it('returns correct action ID for api.flinkly.com', () => {
        const result = getAppActionId('create-changeset', 'api.flinkly.com')
        expect(result).toBe('4gwoIghhNwPmt8ISGkjOu1')
      })

      it('defaults to api.contentful.com when no host is provided', () => {
        const result = getAppActionId('create-changeset')
        expect(result).toBe('3yquPqLswfwwbY7taePuYp')
      })

      it('returns undefined app action ID when invalid host is provided', () => {
        const result = getAppActionId('create-changeset', 'invalid-host')
        expect(result).toBe(undefined)
      })
    })

    describe('export-changeset action', () => {
      it('returns correct action ID for api.contentful.com', () => {
        const result = getAppActionId('export-changeset', 'api.contentful.com')
        expect(result).toBe('2z5CsfaFfA26RrLSXPcQtS')
      })

      it('returns correct action ID for api.eu.contentful.com', () => {
        const result = getAppActionId(
          'export-changeset',
          'api.eu.contentful.com'
        )
        expect(result).toBe('2z5CsfaFfA26RrLSXPcQtS')
      })

      it('returns correct action ID for api.flinkly.com', () => {
        const result = getAppActionId('export-changeset', 'api.flinkly.com')
        expect(result).toBe('5saqHxAG2N0xHaZYXEe5dO')
      })

      it('defaults to api.contentful.com when no host is provided', () => {
        const result = getAppActionId('export-changeset')
        expect(result).toBe('2z5CsfaFfA26RrLSXPcQtS')
      })

      it('returns undefined app action ID when invalid host is provided', () => {
        const result = getAppActionId('export-changeset', 'invalid-host')
        expect(result).toBe(undefined)
      })
    })
  })
})
