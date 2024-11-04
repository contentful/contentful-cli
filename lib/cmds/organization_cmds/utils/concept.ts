import { CreateConceptProps } from 'contentful-management'
import { defaultLocale } from '../taxonomy-transform'

export class Concept {
  private model: CreateConceptProps & { id: string }

  public constructor(
    id: string,
    init: Partial<Omit<CreateConceptProps, 'id'>> & {
      prefLabel: CreateConceptProps['prefLabel']
    }
  ) {
    this.model = { id, ...init }
  }

  toJson() {
    return structuredClone(this.model)
  }

  setUri(uri: string | null) {
    this.model.uri = uri
    return this
  }

  setDefinition(definition: string | null) {
    if (!this.model.definition) {
      this.model.definition = {}
    }
    this.model.definition[defaultLocale] = definition
    return this
  }

  addAltLabel(altLabel: string) {
    if (!this.model.altLabels) {
      this.model.altLabels = { [defaultLocale]: [] }
    }
    this.model.altLabels[defaultLocale].push(altLabel)
    return this
  }

  removeAltLabel(altLabel: string) {
    if (this.model.altLabels) {
      this.model.altLabels[defaultLocale] = this.model.altLabels[
        defaultLocale
      ].filter(label => label !== altLabel)
    }
    return this
  }

  addHiddenLabel(hiddenLabel: string) {
    if (!this.model.hiddenLabels) {
      this.model.hiddenLabels = { [defaultLocale]: [] }
    }
    this.model.hiddenLabels[defaultLocale].push(hiddenLabel)
    return this
  }

  removeHiddenLabel(hiddenLabel: string) {
    if (this.model.hiddenLabels) {
      this.model.hiddenLabels[defaultLocale] = this.model.hiddenLabels[
        defaultLocale
      ].filter(label => label !== hiddenLabel)
    }
    return this
  }

  setEditorialNote(editorialNote: string | null) {
    if (!this.model.editorialNote) {
      this.model.editorialNote = {}
    }
    this.model.editorialNote[defaultLocale] = editorialNote
    return this
  }

  setHistoryNote(historyNote: string | null) {
    if (!this.model.historyNote) {
      this.model.historyNote = {}
    }
    this.model.historyNote[defaultLocale] = historyNote
    return this
  }

  setExample(example: string | null) {
    if (!this.model.example) {
      this.model.example = {}
    }
    this.model.example[defaultLocale] = example
    return this
  }

  setNote(note: string | null) {
    if (!this.model.note) {
      this.model.note = {}
    }
    this.model.note[defaultLocale] = note
    return this
  }

  setScopeNote(scopeNote: string | null) {
    if (!this.model.scopeNote) {
      this.model.scopeNote = {}
    }
    this.model.scopeNote[defaultLocale] = scopeNote
    return this
  }

  addNotation(notation: string) {
    if (!this.model.notations) {
      this.model.notations = []
    }
    this.model.notations.push(notation)
    return this
  }

  removeNotation(notation: string) {
    if (this.model.notations) {
      this.model.notations = this.model.notations.filter(n => n !== notation)
    }
    return this
  }

  addBroader(conceptId: string) {
    if (!this.model.broader) {
      this.model.broader = []
    }
    this.model.broader.push({
      sys: {
        id: conceptId,
        type: 'Link',
        linkType: 'TaxonomyConcept'
      }
    })
    return this
  }

  removeBroader(conceptId: string) {
    if (this.model.broader) {
      this.model.broader = this.model.broader.filter(
        concept => concept.sys.id !== conceptId
      )
    }
    return this
  }

  addRelated(conceptId: string) {
    if (!this.model.related) {
      this.model.related = []
    }
    this.model.related.push({
      sys: {
        id: conceptId,
        type: 'Link',
        linkType: 'TaxonomyConcept'
      }
    })
    return this
  }

  removeRelated(conceptId: string) {
    if (this.model.related) {
      this.model.related = this.model.related.filter(
        concept => concept.sys.id !== conceptId
      )
    }
    return this
  }
}
