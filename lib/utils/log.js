import {infoStyle, warningStyle, errorStyle, successStyle} from './styles'

export function info (/**/) {
  let args = Array.from(arguments)
  let styledArgs = args.map((arg) => infoStyle(arg))
  console.log.apply(null, styledArgs)
}

export function warning (/**/) {
  let args = Array.from(arguments)
  let styledArgs = args.map((arg) => warningStyle(arg))
  console.log.apply(null, styledArgs)
}
export function success (/**/) {
  let args = Array.from(arguments)
  let styledArgs = args.map((arg) => successStyle(arg))
  console.log.apply(null, styledArgs)
}

export function error (/**/) {
  let args = Array.from(arguments)
  let styledArgs = args.map((arg) => errorStyle(arg))
  console.log.apply(null, styledArgs)
}
