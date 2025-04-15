import emojic = require('emojic')

interface NumberMap {
  [key: string]: string
}

const numberMap: NumberMap = {
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

export const welcomeEmoji = `${emojic.wave} `
export const successEmoji = `${emojic.sparkles} `
export const errorEmoji = `${emojic.rotatingLight} `
export const infoEmoji = `${emojic.bulb} `

export function generateNumberEmoji(number: number): string {
  if (process.platform !== 'darwin') {
    return number.toString()
  }
  return number
    .toString()
    .replace(/\d/g, match => `${emojic[numberMap[match]]} `)
}
