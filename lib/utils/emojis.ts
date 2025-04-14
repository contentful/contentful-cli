const emojic = require('emojic')

const numberMap = {
  0: 'zero',
  1: 'one',
  2: 'two',
  3: 'three',
  4: 'four',
  5: 'five',
  6: 'six',
  7: 'seven',
  8: 'eight',
  9: 'nine'
}

module.exports.welcomeEmoji = `${emojic.wave} `
module.exports.successEmoji = `${emojic.sparkles} `
module.exports.errorEmoji = `${emojic.rotatingLight} `
module.exports.infoEmoji = `${emojic.bulb} `

function generateNumberEmoji(number) {
  if (process.platform !== 'darwin') {
    return number.toString()
  }
  return number
    .toString()
    .replace(/\d/g, match => `${emojic[numberMap[match]]} `)
}

module.exports.generateNumberEmoji = generateNumberEmoji
