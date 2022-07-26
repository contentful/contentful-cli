var keypress = require('keypress')

/**
 * Keyboard input handler
 */
module.exports = function useKeyPress(handler) {
  // make `process.stdin` begin emitting "keypress" events
  keypress(process.stdin)
  // listen for the "keypress" event
  process.stdin.on('keypress', function (ch, key) {
    if (!key) {
      return
    }

    handler(key)

    // exit on ctrl+c
    if (key.ctrl && key.name == 'c') {
      process.stdin.pause()
    }
  })
  process.stdin.setRawMode(true)
  process.stdin.resume()
}
