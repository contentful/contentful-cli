import boxen from 'boxen'
import chalk from 'chalk'

export default function greetings() {
  console.log(
    boxen(
      `Launch your projects faster with modern content platform!
Start building and enable your content editors and codebase with powerful tools!`,
      {
        title: `Welcome to ${chalk.red('Contentful')}`,
        titleAlignment: 'left',
        padding: 1,
        borderStyle: 'round',
        borderColor: 'cyan',
        margin: {
          left: 0,
          top: 1,
          right: 0,
          bottom: 1
        }
      }
    )
  )
}
