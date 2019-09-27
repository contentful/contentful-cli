const inquirer = require('inquirer')

// Simple yes/no question
async function confirmation(text) {
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

module.exports.confirmation = confirmation
