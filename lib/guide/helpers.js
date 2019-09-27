const guideOptimalColumns = 120
module.exports.GUIDE_MAX_WIDTH =
  process.stdout.columns < guideOptimalColumns
    ? process.stdout.columns
    : guideOptimalColumns
class AbortedError extends Error {}
module.exports.AbortedError = AbortedError
