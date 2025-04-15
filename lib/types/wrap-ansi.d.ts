declare module 'wrap-ansi' {
  function wrapAnsi(
    input: string,
    columns: number,
    options?: {
      hard?: boolean
      trim?: boolean
      wordWrap?: boolean
    }
  ): string

  export default wrapAnsi
}
