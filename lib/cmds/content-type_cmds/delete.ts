import {createCommand} from '../../utils/command-factory'

const {command, desc, builder, handler} = createCommand({
  command: 'delete',
  desc: 'Delete a content type',
  feature: 'content_type-delete',
  usage: 'Usage: contentful content-type delete --id <id> [options]',
  needsConfirmation: true,
  confirmationMessage: 'Are you sure you want to delete this content type?',
  options: {
    id: {
      type: 'string',
      describe: 'Content type ID',
      demandOption: true
    }
  },
  handler: async (environment, argv) => {
    const contentType = await environment.getContentType(argv.id)
    if (contentType.sys.publishedVersion) {
      await contentType.unpublish()
    }
    await contentType.delete()
    return {deleted: true, id: argv.id}
  },
  quietExtractor: (data) => [data.id]
})

export {command, desc, builder, handler}
