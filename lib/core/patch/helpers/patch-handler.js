import patchHandler from '../patch-files-handler'

export default function (args, createContentfulClient, applyPatches, helpers, logging) {
  args.patchFilePaths = [args.patchFilePath]

  return patchHandler(args, createContentfulClient, applyPatches, helpers, logging)
}
