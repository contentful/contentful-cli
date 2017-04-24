import {infoStyle, warningStyle, errorStyle} from './styles'

export function info (/**/) {
  let args = arguments
  args.map((arg) => infoStyle(arg))
  console.info.apply(null, args)
}

export function warning (/**/) {
  let args = arguments
  args.map((arg) => warningStyle(arg))
  console.warning.apply(null, args)
}

export function error (/**/) {
  let args = arguments
  args.map((arg) => errorStyle(arg))
  console.error.apply(null, args)
}
