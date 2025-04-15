declare module 'emojic' {
  interface EmojicInterface {
    wave: string
    sparkles: string
    rotatingLight: string
    bulb: string
    zero: string
    one: string
    two: string
    three: string
    four: string
    five: string
    six: string
    seven: string
    eight: string
    nine: string
    [key: string]: string
  }

  const emojic: EmojicInterface
  export = emojic
}
