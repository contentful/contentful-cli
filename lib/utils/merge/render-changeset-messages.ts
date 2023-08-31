import { Message } from './create-merge-message'

const spacer = ' '
function StringRenderer({ indentString = spacer.repeat(2) }) {
  const lines: string[] = []
  return {
    addLine: (text: string, indent: number) => {
      return lines.push(`${indentString.repeat(indent)}${text}`)
    },
    toString: () => lines.join('\n')
  }
}

const ChangeTypeToIndicatorMap: Record<string, string> = {
  add: '+Added',
  delete: '-Deleted',
  update: '~Changed',
  move: '~Changed'
}
export function renderChangesetMessages(messages: Message[]): string {
  const renderer = StringRenderer({})

  for (const message of messages) {
    renderer.addLine(
      `${ChangeTypeToIndicatorMap[message.changeType]}`,
      message.level
    )
    for (const messageLine of message.messages) {
      renderer.addLine(`${spacer}${messageLine}`, message.level)
    }
    // add empty line between every block
    renderer.addLine('', 0)
  }

  return renderer.toString()
}
