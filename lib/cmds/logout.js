const { setContext, storeRuntimeConfig } = require('../context')
const { confirmation } = require('../utils/actions')
const { handleAsyncError: handle } = require('../utils/async')
const { log, warning, success } = require('../utils/log')

module.exports.command = 'logout'

module.exports.desc = 'Logout from Contentful'

async function logout() {
  warning(
    'This will log you out by deleting the CMA token stored on your system.'
  )
  const confirmed = await confirmation('Do you want to log out now?')

  if (!confirmed) {
    log('Log out aborted by user.')
    return
  }
  await setContext({ managementToken: null })
  await storeRuntimeConfig()

  success('Successfully logged you out.')
}

module.exports.logout = logout

module.exports.handler = handle(logout)
