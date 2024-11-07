import {
  ConceptProps,
  ConceptSchemeProps,
  CreateConceptProps,
  CreateConceptSchemeProps
} from 'contentful-management'
import { Concept } from './concept'
import { ConceptScheme } from './concept-scheme'

export class Taxonomy {
  private concepts: {
    existing: Array<Concept>
    upsert: Array<Concept>
  }

  private conceptSchemes: {
    existing: Array<ConceptScheme>
    upsert: Array<ConceptScheme>
  }

  constructor() {
    this.concepts = {
      existing: [],
      upsert: []
    }

    this.conceptSchemes = {
      existing: [],
      upsert: []
    }
  }

  toJson() {
    return {
      concepts: this.concepts.upsert.map(concept => concept.toJson()),
      conceptSchemes: this.conceptSchemes.upsert.map(conceptScheme =>
        conceptScheme.toJson()
      )
    }
  }

  setExistingConcepts(concepts: Array<ConceptProps>) {
    this.concepts.existing = concepts.map(
      concept => new Concept(concept.sys.id, concept)
    )
  }

  setExistingConceptSchemes(conceptSchemes: Array<ConceptSchemeProps>) {
    this.conceptSchemes.existing = conceptSchemes.map(
      conceptScheme => new ConceptScheme(conceptScheme.sys.id, conceptScheme)
    )
  }

  addConcept(
    id: string,
    init: Partial<Omit<CreateConceptProps, 'id'>> & {
      prefLabel: CreateConceptProps['prefLabel']
    }
  ) {
    if (this.concepts.existing.find(concept => concept.toJson().id === id)) {
      return null
    }

    if (this.concepts.upsert.find(concept => concept.toJson().id === id)) {
      return null
    }

    const concept = new Concept(id, init)

    this.concepts.upsert.push(concept)

    return concept
  }

  getConcept(id: string) {
    const existingConcept = this.concepts.existing.find(
      concept => concept.toJson().id === id
    )
    const addedConcept = this.concepts.upsert.find(
      concept => concept.toJson().id === id
    )

    if (!existingConcept && !addedConcept) {
      return null
    }

    if (existingConcept && !addedConcept) {
      this.concepts.upsert.push(existingConcept)
    }

    return addedConcept || existingConcept
  }

  addConceptScheme(
    id: string,
    init: Partial<Omit<CreateConceptSchemeProps, 'id'>> & {
      prefLabel: CreateConceptSchemeProps['prefLabel']
    }
  ) {
    if (
      this.conceptSchemes.existing.find(
        conceptScheme => conceptScheme.toJson().id === id
      )
    ) {
      return null
    }

    if (
      this.conceptSchemes.upsert.find(
        conceptScheme => conceptScheme.toJson().id === id
      )
    ) {
      return null
    }

    const conceptScheme = new ConceptScheme(id, init)

    this.conceptSchemes.upsert.push(conceptScheme)

    return conceptScheme
  }

  getConceptScheme(id: string) {
    const existingConceptScheme = this.conceptSchemes.existing.find(
      conceptScheme => conceptScheme.toJson().id === id
    )

    const addedConceptScheme = this.conceptSchemes.upsert.find(
      conceptScheme => conceptScheme.toJson().id === id
    )

    if (!existingConceptScheme && !addedConceptScheme) {
      return null
    }

    if (existingConceptScheme && !addedConceptScheme) {
      this.conceptSchemes.upsert.push(existingConceptScheme)
    }

    return addedConceptScheme || existingConceptScheme
  }
}
