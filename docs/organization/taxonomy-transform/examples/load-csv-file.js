module.exports = async function ({ csv, taxonomy, fs }) {
  const csvFile = await fs.readFile(
    fs.cwd() +
      '/docs/organization/taxonomy-transform/examples/example-spreadsheet.csv'
  )
  const { data } = await csv.parse(csvFile.toString(), { header: true })

  console.log(taxonomy.addConcept)

  for (const row of data) {
    taxonomy.addConcept(row['Animal Group'], {
      prefLabel: row['Animal Group']
    })

    const subCategory = taxonomy.addConcept(row['Sub-Category'], {
      prefLabel: row['Sub-Category']
    })
    if (subCategory) {
      subCategory.addBroader(row['Animal Group'])
    }

    const animal = taxonomy.addConcept(row['Animal Name'], {
      prefLabel: row['Animal Name'],
      descritpion: row['Skills']
    })
    if (animal) {
      animal.addBroader(row['Sub-Category'])
    }
  }
}
