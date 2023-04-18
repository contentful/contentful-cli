export const mergeErrors = {
  ShowPollTimeout: `The diff took too long to generate. Please try again. If it persists try to use the Merge App directly or contact support.`,
  ExportPollTimeout: `The migration took too long to generate. Please try again. If it persists try to use the Merge App directly or contact support.`,
  MigrationCouldNotBeExported: `Migration could not be exported.`,
  ErrorInDiffCreation: `There was an error generating the diff. Please try again.`
} as const
