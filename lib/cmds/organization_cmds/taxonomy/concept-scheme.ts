import { CreateConceptSchemeProps } from 'contentful-management'
import { defaultLocale } from '../taxonomy-transform'

export type CreateConceptSchemeWithIdProps = CreateConceptSchemeProps & {
  sys: { id: string }
}

export class ConceptScheme {
  private model: CreateConceptSchemeProps & { sys: { id: string } }

  public constructor(
    id: string,
    init: Partial<Omit<CreateConceptSchemeProps, 'id'>> & {
      prefLabel: CreateConceptSchemeProps['prefLabel']
    }
  ) {
    this.model = { sys: { id }, ...init }
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

  setPrefLabel(prefLabel: string) {
    if (!this.model.prefLabel) {
      this.model.prefLabel = {}
    }
    this.model.prefLabel[defaultLocale] = prefLabel
    return this
  }

  addTopConcept(conceptId: string) {
    if (!this.model.topConcepts) {
      this.model.topConcepts = []
    }
    this.model.topConcepts.push({
      sys: {
        id: conceptId,
        type: 'Link',
        linkType: 'TaxonomyConcept'
      }
    })

    this.model.totalConcepts = (this.model.totalConcepts || 0) + 1

    return this
  }

  removeTopConcept(conceptId: string) {
    if (this.model.topConcepts) {
      this.model.topConcepts = this.model.topConcepts.filter(
        concept => concept.sys.id !== conceptId
      )
    }
    if (this.model.concepts) {
      this.model.concepts = this.model.concepts.filter(
        concept => concept.sys.id !== conceptId
      )
    }

    this.model.totalConcepts = this.model.totalConcepts
      ? this.model.totalConcepts - 1
      : 0

    return this
  }

  addConcept(conceptId: string) {
    if (!this.model.concepts) {
      this.model.concepts = []
    }
    this.model.concepts.push({
      sys: {
        id: conceptId,
        type: 'Link',
        linkType: 'TaxonomyConcept'
      }
    })

    this.model.totalConcepts = (this.model.totalConcepts || 0) + 1

    return this
  }

  removeConcept(conceptId: string) {
    if (this.model.concepts) {
      if (!this.model.concepts.find(concept => concept.sys.id === conceptId)) {
        throw new Error(
          `Concept with id ${conceptId} does not exist in Concept Scheme`
        )
      }

      this.model.concepts = this.model.concepts.filter(
        concept => concept.sys.id !== conceptId
      )

      this.model.totalConcepts = this.model.totalConcepts
        ? this.model.totalConcepts - 1
        : 0
    }

    return this
  }
}
