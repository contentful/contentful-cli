module.exports.getId = ({ id, _: args }) => {
  if (id) {
    return id
  }

  const index = args.length - 1
  return args[index]
}
