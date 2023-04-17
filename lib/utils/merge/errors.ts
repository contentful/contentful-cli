import { errorEmoji } from '../emojis'

export const mergeErrors = {
  PollTimeout: `${errorEmoji} The migration took too long to generate. Please try again. If it persists try to use the Merge App directly or contact support`
} as const
