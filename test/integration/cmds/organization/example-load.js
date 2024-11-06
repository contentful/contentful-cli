const path = require('path')

module.exports = async function ({ csv, taxonomy, fs }) {
  const csvFile = await fs.readFile(
    path.resolve(
      fs.cwd() + '/../test/integration/cmds/organization/example.csv'
    )
  )
  const { data } = await csv.parse(csvFile.toString(), { header: true })

  for (const row of data) {
    taxonomy.addConcept(row['Animal-Group'], {
      prefLabel: row['Animal-Group']
    })

    const subCategory = taxonomy.addConcept(row['Sub-Category'], {
      prefLabel: row['Sub-Category']
    })
    if (subCategory) {
      subCategory.addBroader(row['Animal-Group'])
    }

    const animal = taxonomy.addConcept(row['Animal-Name'], {
      prefLabel: row['Animal-Name'],
      descritpion: row['Skills']
    })
    if (animal) {
      animal.addBroader(row['Sub-Category'])
    }
  }
}
