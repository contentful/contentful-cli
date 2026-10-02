import { spaceCreate } from '../space_cmds/create'
import { importSpace } from '../space_cmds/import'
import { spaceUse } from '../space_cmds/use'
import initialContent from './content.json'
import { prompt } from '../../utils/actions'

// init has no flags, so the space commands' flag hints don't apply here
const promptHint = 'Run `contentful init` in an interactive terminal.'

// TODO: use proper context types
export const getSpace = async (context: any) => {
  const { newSpace } = await prompt([
    {
      type: 'list',
      name: 'newSpace',
      message: 'Do you want to create a new space or use an existing one?',
      choices: [
        {
          name: 'Create new space',
          value: true
        },
        {
          name: 'Use existing space',
          value: false
        }
      ]
    }
  ])

  let space

  if (newSpace) {
    const { spaceName, content } = await prompt([
      {
        type: 'input',
        name: 'spaceName',
        message: 'What should be the name for the new created space?',
        validate: (name: string) => name !== '' || 'Space name is required'
      },
      {
        type: 'confirm',
        name: 'content',
        message: ({ spaceName }: { spaceName: string }) =>
          `Do you want to have example content in ${spaceName}?`
      }
    ])

    space = await spaceCreate({
      context,
      name: spaceName,
      promptHint
    })

    if (content) {
      await importSpace({
        context: {
          ...context,
          activeSpaceId: space.sys.id
        },
        content: initialContent
      })
    } else {
      // TODO: log message about adding content model and content
    }
  } else {
    space = await spaceUse({ context, successMsg: false, promptHint })
  }

  return space
}
