import {createCommand} from '../../utils/command-factory'
import {firstLocaleValue} from '../../utils/output'
import {validateId} from '../../utils/validators'
const fs = require('fs')
const path = require('path')

const {command, desc, builder, handler} = createCommand({
  command: 'upload',
  desc: 'Upload and create an asset',
  feature: 'asset-upload',
  usage: 'Usage: contentful asset upload [options]',
  examples: [
    ['contentful asset upload --file ./hero.png --title "Hero Image"', 'Upload with auto-detected MIME type'],
    ['contentful asset upload --file ./doc.pdf --title "Whitepaper" --content-type application/pdf', 'Upload with explicit MIME type'],
    ['contentful asset upload --file ./logo.svg --title "Logo" --id brand-logo', 'Upload with a custom asset ID'],
    ['contentful asset upload --file ./photo.jpg --title "Photo" --dry-run', 'Preview upload without making changes']
  ],
  supportsDryRun: true,
  options: {
    file: {
      type: 'string',
      describe: 'Local file path to upload',
      demandOption: true
    },
    title: {
      alias: 't',
      type: 'string',
      describe: 'Asset title',
      demandOption: true
    },
    description: {
      alias: 'd',
      type: 'string',
      describe: 'Asset description'
    },
    'content-type': {
      alias: 'ct',
      type: 'string',
      describe: 'MIME type (auto-detected from extension if omitted)'
    },
    locale: {
      type: 'string',
      describe: "Locale for fields (default: space's default locale)",
      default: 'en-US'
    },
    id: {
      type: 'string',
      describe: 'Custom asset ID'
    }
  },
  handler: async (client, argv) => {
    const filePath = argv.file
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`)
    }

    const locale = argv.locale || 'en-US'
    const fileName = path.basename(filePath)
    const contentType = argv.contentType || detectMimeType(fileName)

    // Step 1: Create upload
    const upload = await client.upload.create({}, {
      file: fs.createReadStream(filePath)
    })

    // Step 2: Create asset
    const assetData = {
      fields: {
        title: {[locale]: argv.title},
        ...(argv.description ? {description: {[locale]: argv.description}} : {}),
        file: {
          [locale]: {
            contentType,
            fileName,
            uploadFrom: {
              sys: {type: 'Link', linkType: 'Upload', id: upload.sys.id}
            }
          }
        }
      }
    }

    let asset
    if (argv.id) {
      validateId(argv.id, 'Asset ID')
      asset = await client.asset.createWithId({assetId: argv.id}, assetData)
    } else {
      asset = await client.asset.create({}, assetData)
    }

    // Step 3: Process for all locales
    asset = await client.asset.processForAllLocales({}, asset)

    // Step 4: Poll for processing completion
    asset = await pollAssetProcessing(client, asset.sys.id, locale)

    return asset
  },
  dryRunHandler: async (_client, argv) => {
    const filePath = argv.file
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`)
    }
    const fileName = path.basename(filePath)
    return {
      dryRun: true,
      action: 'upload',
      file: filePath,
      fileName,
      title: argv.title,
      description: argv.description,
      contentType: argv.contentType || detectMimeType(fileName),
      assetId: argv.id || '(auto-generated)'
    }
  },
  tableFormat: (data) => ({
    rows: [
      ['ID', data.sys?.id || data.assetId || '-'],
      ['Title', firstLocaleValue(data.fields?.title) || data.title || '-'],
      ['File', firstLocaleValue(data.fields?.file)?.fileName || data.fileName || '-'],
      ['URL', firstLocaleValue(data.fields?.file)?.url || '-']
    ]
  }),
  quietExtractor: (data) => [data.sys?.id || '']
})

async function pollAssetProcessing(
  client: any,
  assetId: string,
  locale: string,
  maxAttempts = 30,
  interval = 1000
): Promise<any> {
  for (let i = 0; i < maxAttempts; i++) {
    const asset = await client.asset.get({assetId})
    const file = asset.fields?.file?.[locale]
    if (file && file.url) {
      return asset
    }
    await new Promise((resolve) => setTimeout(resolve, interval))
  }
  throw new Error(
    `Asset ${assetId} processing timed out after ${maxAttempts} attempts`
  )
}

function detectMimeType(fileName: string): string {
  const ext = path.extname(fileName).toLowerCase()
  const mimeMap: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.webp': 'image/webp',
    '.pdf': 'application/pdf',
    '.mp4': 'video/mp4',
    '.mp3': 'audio/mpeg',
    '.json': 'application/json',
    '.txt': 'text/plain',
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript'
  }
  return mimeMap[ext] || 'application/octet-stream'
}

export {command, desc, builder, handler}
