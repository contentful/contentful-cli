import chalk from 'chalk'
import open from 'open'
import { Argv } from 'yargs'
import { handleAsyncError as handle } from '../utils/async'

export const command = 'feedback'

export const desc = 'Send feedback to Contentful'

export const builder = (yargs: Argv) =>
  yargs
    .usage('Usage: contentful feedback')
    .epilog(
      [
        "We'd love to hear from you! Check out our five question developer experience survey at:",
        'https://87dc93gvoy0.typeform.com/to/d1RgWfZX'
      ].join('\n')
    )

export const feedback = async () => {
  open('https://87dc93gvoy0.typeform.com/to/d1RgWfZX')
}

export function logFeedbackNudge() {
  console.log(`Have any feedback for the ${chalk.blue('Conte')}${chalk.yellow(
    'ntful'
  )}${chalk.red(
    ' CLI'
  )}? We'd love to hear from you! Check out our five question developer experience survey at:
  ${chalk.underline('https://87dc93gvoy0.typeform.com/to/d1RgWfZX')}
  `)
}

export const handler = handle(feedback)
