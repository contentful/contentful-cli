const guideOptimalColumns = 120
export const GUIDE_MAX_WIDTH = process.stdout.columns < guideOptimalColumns ? process.stdout.columns : guideOptimalColumns
export class AbortedError extends Error { }
