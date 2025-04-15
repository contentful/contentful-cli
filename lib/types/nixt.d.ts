declare module 'nixt' {
  interface NixtInstance {
    cwd(path: string): NixtInstance
    base(command: string): NixtInstance
    clone(): NixtInstance
    run(command: string): NixtInstance
    code(code: number): NixtInstance
    expect(
      callback: (result: { stdout: string; stderr: string }) => void
    ): NixtInstance
    end(callback: (err?: Error) => void): void
  }

  interface NixtOptions {
    newlines?: boolean
    colors?: boolean
    [key: string]: any
  }

  function nixt(options?: NixtOptions): NixtInstance

  export default nixt
}
