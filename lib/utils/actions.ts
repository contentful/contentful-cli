import inquirer from 'inquirer'

/**
 * Simple yes/no question
 * @param text The confirmation message to display
 * @returns A boolean indicating the user's response
 */
export async function confirmation(text?: string): Promise<boolean> {
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
