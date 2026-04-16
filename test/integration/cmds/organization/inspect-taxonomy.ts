import { createClient } from 'contentful-management'

const organizationId = process.env.CLI_E2E_ORG_ID!
const accessToken = process.env.CONTENTFUL_INTEGRATION_TEST_CMA_TOKEN!

if (!organizationId || !accessToken) {
  console.error('Missing CLI_E2E_ORG_ID or CONTENTFUL_INTEGRATION_TEST_CMA_TOKEN')
  process.exit(1)
}

const client = createClient({ accessToken }, { type: 'plain' })

async function main() {
  const concepts = await client.concept.getMany({ organizationId })
  console.log(`\n=== Concepts (${concepts.items.length}) ===`)
  for (const c of concepts.items) {
    console.log(`  ${c.sys.id}  v${c.sys.version}  "${c.prefLabel?.['en-US']}"`)
  }

  const schemes = await client.conceptScheme.getMany({ organizationId })
  console.log(`\n=== Concept Schemes (${schemes.items.length}) ===`)
  for (const s of schemes.items) {
    console.log(`  ${s.sys.id}  v${s.sys.version}  "${s.prefLabel?.['en-US']}"`)
  }
}

main().catch(console.error)
