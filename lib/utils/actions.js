const inquirer = require('inquirer')
const { PreconditionFailedError } = require('./error')

// inquirer.prompt, but a closed stdin (</dev/null, exhausted pipe) rejects
// with an actionable error instead of crashing with ERR_USE_AFTER_CLOSE
function prompt(questions, { hint } = {}) {
  const pending = inquirer.prompt(questions)
  const { ui } = pending
  if (!ui) return pending

  return new Promise((resolve, reject) => {
    let settled = false
    pending.then(
      answers => {
        settled = true
        resolve(answers)
      },
      error => {
        settled = true
        reject(error)
      }
    )

    ui.rl.once('close', () => {
      // Let an answer from the last piped line settle first
      setImmediate(() => {
        // Ctrl+C also closes the readline, but leaves stdin open
        if (settled || !ui.rl.input.readableEnded) return
        // inquirer's exit hook would crash on the already closed readline
        process.removeListener('exit', ui.onForceClose)
        reject(
          new PreconditionFailedError(
            `Cannot prompt for input because stdin is closed.\n${
              hint || 'Run this command in an interactive terminal.'
            }`
          )
        )
      })
    })
  })
}

module.exports.prompt = prompt

// Simple yes/no question
async function confirmation(text, options) {
  text = text || 'Are you ready?'

  const readyAnswer = await prompt(
    [
      {
        type: 'confirm',
        name: 'ready',
        message: text,
        default: true
      }
    ],
    options
  )

  return readyAnswer.ready
}

module.exports.confirmation = confirmation
