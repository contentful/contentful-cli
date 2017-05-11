import test from 'ava'

import {
  welcomeEmoji,
  successEmoji,
  errorEmoji,
  infoEmoji,
  generateNumberEmoji
} from '../../lib/utils/emojis'

const emojis = [welcomeEmoji, successEmoji, errorEmoji, infoEmoji]

test('emojis should have space at the end to avoid display issues', (t) => {
  emojis.forEach((emoji) => {
    t.is(emoji.charAt(emoji.length - 1), ' ', `Emoji ${emoji} has a space at the end`)
  })
})

test('numbered emojis', (t) => {
  const numberEmoji = generateNumberEmoji(123)
  t.is((numberEmoji.match(/ /g) || []).length, 3, 'Generated emoji number has spaces inbetween to avoid display issues')
})
