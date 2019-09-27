const {
  welcomeEmoji,
  successEmoji,
  errorEmoji,
  infoEmoji,
  generateNumberEmoji
} = require('../../../lib/utils/emojis')

const emojis = [welcomeEmoji, successEmoji, errorEmoji, infoEmoji]

test('emojis should have space at the end to avoid display issues', () => {
  emojis.forEach(emoji => {
    expect(emoji.charAt(emoji.length - 1)).toBe(' ')
  })
})

test('numbered emojis osx', () => {
  if (process.platform === 'darwin') {
    const numberEmoji = generateNumberEmoji(123)
    expect((numberEmoji.match(/ /g) || []).length).toBe(3)
  } else {
    const numbers = generateNumberEmoji(123)
    expect(numbers).toBe('123')
    expect((numbers.match(/ /g) || []).length).toBe(0)
  }
})
