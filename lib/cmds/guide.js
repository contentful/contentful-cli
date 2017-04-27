import inquirer from 'inquirer'
import chalk from 'chalk'
import shellescape from 'shell-escape'
import opn from 'opn'

import { handler as loginHandler } from './login'
import { handler as spaceCreateHandler } from './space_cmds/create'
import { handler as spaceUseHandler } from './space_cmds/use'
import { getContext } from '../context'
import { confirmation } from '../utils/actions'
import { log, success } from '../utils/log'
import { frame } from '../utils/text'
import { highlightStyle } from '../utils/styles'
import { welcomeEmoji, infoEmoji, successEmoji } from '../utils/emojis'

export const command = 'guide'

export const desc = 'A guide introducing basic concepts of working with Contentful'

export const handler = async function guide () {
  let context = await getContext()
  log()
  log(`${welcomeEmoji} Welcome to the ${highlightStyle('Contentful')} guide!`)
  log()

  // Step 1 - Login
  if (!context.cmaToken) {
    log(`First we need to store your ${highlightStyle('Content Management API access token')} (CMA token). We will open up a web page for you where you will find your ${highlightStyle('CMA token')}.`)
    log(`If you're not logged in or don't have an account yet you can sign up or login from the same page. Copy your ${highlightStyle('CMA token')} and then come back here.`)
    log(`${chalk.green('Remember')} to always keep your access tokens secure, they allow complete access to all of your content.`)
    log()
    log(`We will now run the following command for you:`)
    log()
    frame('$ contentful login')
    log()

    await loginHandler()
    context = await getContext()
  } else {
    log(`First we need to store your ${highlightStyle('Content Management API access token')} (CMA token).`)
    log()
    log(chalk.bold('Looks like you are already logged in, so we can skip this step.'))
    log()
    log(`${infoEmoji} ${chalk.green('Remember')} to always keep your access tokens secure, they allow complete access to all of your content.`)
  }

  // Step 2 - Create space or use existing
  log()
  log(`The next step is to create a ${highlightStyle('Space')}.`)
  log()
  log(`A ${highlightStyle('space')} is the container for all of your content for a project. This includes content entries, media assets and settings for localizing content.`)
  log(`You want to give your ${highlightStyle('space')} a simple and descriptive name so that you can immeadiately understand what it's for. A suggestion for this example space would be "Blog", but you're free to choose what makes the most sense to you.`)
  log()

  let spaceId = null
  while (!spaceId) {
    const spaceActionAnswer = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'How do you want to proceed?',
        choices: [
          {
            name: 'Create a new space',
            value: 'new'
          },
          {
            name: 'Use an existing space',
            value: 'existing'
          }
        ]
      }
    ])

    if (spaceActionAnswer.action === 'new') {
      const spaceNameAnswer = await inquirer.prompt([
        {
          type: 'input',
          name: 'name',
          message: 'Space name:'
        }
      ])

      const createSpaceCommand = ['contentful', 'space', 'create', '--name', spaceNameAnswer.name]

      log()
      log(`We will now run the following command for you:`)
      log()
      frame('$ ' + shellescape(createSpaceCommand))
      log()

      try {
        const space = await spaceCreateHandler({
          name: spaceActionAnswer.name
        })
        spaceId = space.sys.id
      } catch (err) {
        // Error already displayed to user
      }
    }

    if (spaceActionAnswer.action === 'existing') {
      log()
      log(`We will now run the following command for you:`)
      log()
      frame('$ contentful space use')
      log()
      const space = await spaceUseHandler()
      spaceId = space.sys.id
    }
  }

  // Step 3 - Seed content model
  log()
  log(`Now that we have created a space it is time to create some ${highlightStyle('content types')}. You can think of ${highlightStyle('content types')} as blueprints for what your content should look like.`)
  log()
  log(`This guide will create 3 ${highlightStyle('content types')} for you: ${chalk.bold('Post')}, ${chalk.bold('Author')} and ${chalk.bold('Category')}.`)
  log(`* A ${chalk.bold('post')} consists of a number of fields that represents the content you can fill a Post entry with, for example a title, a body, an image and a reference to an Author.`)
  log(`* The ${chalk.bold('author')} represents the author of one or more blog posts and has fields such as name, profile photo and biography.`)
  log(`* The ${chalk.bold('category')} content type represents a category that a blog post can belong to.`)
  log(`${infoEmoji}  At Contentful we refer to this as your ${chalk.bold('content model')}.`)
  log()
  log(`We will now run the following command for you:`)
  log()
  frame('$ contentful seed blog --content-model')
  log()
  log(chalk.magenta('Hint: @todo -> Nothing is happening here for now'))
  log()

  // Step 4 - Seed content
  log()
  log(`The next step is to start creating some actual ${highlightStyle('content')} from these ${highlightStyle('content types')}. We will create two blog posts, two authors and two categories. These are refered to as ${chalk.bold('entries')}, they represent instances of your content types. We also create a few images that will be stored in Contentful for you. Binary files such as these are refered to as ${chalk.bold('assets')}.`)
  log()
  log(`We will now run the following command for you:`)
  log()
  frame('$ contentful seed blog --content')
  log()
  log(chalk.magenta('Hint: @todo -> Nothing is happening here for now'))
  log()

  // Finished
  success(`${successEmoji} Congratulations! Your ${highlightStyle('space')}, ${highlightStyle('content model')} and ${highlightStyle('content')} have now been created.`)
  log()
  log(`The next step is to start consuming the content. We will open a browser window for you where you can choose your prefered language and download a boilerplate project.`)
  log()

  await confirmation('Are you ready to continue to the boilerplates?')

  await opn('https://github.com/contentful?utf8=%E2%9C%93&q=boilerplate&type=&language=', {
    wait: false
  })
}
