const { PreconditionFailedError } = require('./error')

// inquirer.prompt, but a closed stdin (</dev/null, exhausted pipe, Ctrl+D) rejects
// with an actionable error instead of crashing with ERR_USE_AFTER_CLOSE
function prompt(questions, { hint } = {}) {
  const inquirer = require('inquirer')
  const pending = inquirer.prompt(questions)
  const { ui } = pending
  if (!ui) return pending

  // The last piped answer can complete after readline already closed
  const close = ui.close.bind(ui)
  ui.close = () => {
    try {
      close()
    } catch (error) {
      if (error.code !== 'ERR_USE_AFTER_CLOSE') throw error
    }
  }

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
      // inquirer's own close (Ctrl+C, completion) detaches its exit hook first
      if (!process.listeners('exit').includes(ui.onForceClose)) return
      // Otherwise the hook would SIGINT the process on exit
      process.removeListener('exit', ui.onForceClose)
      // Let an answer from the last piped line settle first
      setImmediate(() => {
        if (settled) return
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
