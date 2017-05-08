import inquirer from 'inquirer'

// Simple yes/no question
export async function confirmation (text) {
  text = text || 'Are you ready?'

  const readyAnswer = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'ready',
      message: text,
      default: true
    }
  ])

  return readyAnswer.ready
}

// Simple yes/no question while no will result in being asked again.
export async function reoccurringConfirmation (text) {
  text = text || 'Are you ready?'
  let readyAnswer = {
    ready: false
  }
  while (!readyAnswer.ready) {
    readyAnswer = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'ready',
        message: text,
        default: true
      }
    ])
  }
}
