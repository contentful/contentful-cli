interface GetIdOptions {
  id?: string
  _: string[]
}

export function getId({ id, _: args }: GetIdOptions): string | undefined {
  if (id) {
    return id
  }

  const index = args.length - 1
  return args[index]
}
