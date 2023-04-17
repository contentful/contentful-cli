import { errorEmoji } from '../emojis'

export const mergeErrors = {
  ShowPollTimeout: `${errorEmoji} The diff took too long to generate. Please try again. If it persists try to use the Merge App directly or contact support`,
  ExportPollTimeout: `${errorEmoji} The migration took too long to generate. Please try again. If it persists try to use the Merge App directly or contact support`,
  MigrationCouldNotBeExported: `${errorEmoji} Migration could not be exported.`
} as const
