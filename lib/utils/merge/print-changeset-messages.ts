import { ContentTypeProps } from 'contentful-management'
import { createMessageLogStructure } from './create-merge-message'
import { renderChangesetMessages } from './render-changeset-messages'
import { ChangesetItem } from './types'

export function printChangesetMessages(
  targetModel: ContentTypeProps[],
  items: ChangesetItem[]
): string {
  const messages = createMessageLogStructure(targetModel, items)
  const addedString = renderChangesetMessages(messages.added)
  const deletedString = renderChangesetMessages(messages.deleted)
  const updatedString = renderChangesetMessages(messages.updated)

  let response = ''

  function maybeAdd(value?: string) {
    if (value && value.length > 0) {
      response += value
      response += '\n'
    }
  }

  maybeAdd(deletedString)
  maybeAdd(addedString)
  maybeAdd(updatedString)

  return response
}
