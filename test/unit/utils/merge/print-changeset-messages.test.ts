import { printChangesetMessages } from '../../../../lib/utils/merge/print-changeset-messages'
import { ContentModel, ChangesetItemsMock } from './merge-mock'
const stripAnsi = require('strip-ansi')

describe('A print changeset messages function', () => {
  it('prints a formatted message of many changes', () => {
    const result = printChangesetMessages(ContentModel, ChangesetItemsMock)
    expect(stripAnsi(result)).toEqual(`-Deleted
  ContentType
  id: toBeDeletedContentType

+Added
  ContentType
  id: product

+Added
  ContentType
  id: simpleContentType

~Changed
  ContentType
  id: secondContentType

  ~Changed
    ContentType
      property: description
      value: "This is a new description"

  ~Changed
    ContentType
      property: name
      value: "Second Content typeeee"

  ~Changed
    Field
      id: salePrice
      property: omitted
      value: true

  ~Changed
    Field
      id: some-field
      property: validations
      position: ↕ order changed

  ~Changed
    Field
      id: rich
      property: validations -> enabledMarks
      position: ↕ order changed

  ~Changed
    Field
      id: name
      position: ↓ moved down

  ~Changed
    Field
      id: salePrice
      position: ↑ moved up

~Changed
  ContentType
  id: firstContentType

  ~Changed
    ContentType
      property: displayField
      value: "aSimpleTextFieldChanged"

  -Deleted
    Field
      id: aSimpleTextField

  +Added
    Field
      id: aSimpleTextFieldChanged
      value:
        "id": "aSimpleTextFieldChanged",
        "name": "A Simple Text field - with a new name",
        "type": "Symbol",
        ...

  +Added
    Field
      id: image
      value:
        "id": "image",
        "name": "image",
        "type": "Link",
        ...

`)
  })
})
