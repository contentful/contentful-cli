import { printChangesetMessages } from '../../../../lib/utils/merge/print-changeset-messages'
import { ContentModel, ChangesetItemsMock } from './merge-mock'
const stripAnsi = require('strip-ansi')

describe('A print changeset messages function', () => {
  it('prints a formatted message of many changes', () => {
    const result = printChangesetMessages(ContentModel, ChangesetItemsMock)
    expect(stripAnsi(result)).toEqual(`-Deleted
 type: ContentType
 id: toBeDeletedContentType

+Added
 type: ContentType
 id: product

+Added
 type: ContentType
 id: simpleContentType

~Changed
 type: ContentType
 id: secondContentType

  ~Changed
   type: ContentType
   property: description
   value: "This is a new description"

  ~Changed
   type: ContentType
   property: name
   value: "Second Content typeeee"

  ~Changed
   type: Field
   id: salePrice
   property: omitted
   value: true

  ~Changed
   type: Field
   id: firstContentType
   property: validations
   position: order changed

  ~Changed
   type: Field
   id: rich
   property: validations -> enabledMarks
   position: order changed

  ~Changed
   type: Field
   id: name
   position: moved down

  ~Changed
   type: Field
   id: salePrice
   position: moved up

~Changed
 type: ContentType
 id: firstContentType

  ~Changed
   type: ContentType
   property: displayField
   value: "aSimpleTextFieldChanged"

  -Deleted
   type: Field
   id: aSimpleTextField

  +Added
   type: Field
   id: aSimpleTextFieldChanged
   value: "{"id":"aSimpleTextFieldChanged","name":"A Sim..."

  +Added
   type: Field
   id: image
   value: "{"id":"image","name":"image","type":"Link","l..."

`)
  })
})
