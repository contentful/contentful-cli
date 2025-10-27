export interface PlainClient {
  raw: {
    get: (
      path: string,
      opts?: { params?: Record<string, string | number | boolean | undefined> }
    ) => Promise<unknown>
  }
}

export interface SecurityContext {
  client: PlainClient
  organizationId: string
  userId: string
  role?: string
}

export interface SecurityCheckRunResult {
  pass: boolean
  data?: Record<string, unknown>
}

export interface SecurityCheck {
  id: string
  description: string
  // If any dependency fails, this check is skipped and marked pass=false
  dependsOn?: string[]
  // run may return a simple boolean or a richer object with data
  run: (ctx: SecurityContext) => Promise<boolean | SecurityCheckRunResult>
}
