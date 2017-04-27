import inquirer from 'inquirer'

export async function confirmation (text) {
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
