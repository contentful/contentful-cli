module.exports = async function ({ csv, taxonomy, fs }) {
  const findParent = (data, index) => {
    let notEmptyIndex = data[index].findIndex(
      (c, index) => c != '' && index > 0
    )

    //Parent is concept scheme
    if (notEmptyIndex == 3) {
      return null
    }

    let parent = null

    while (index > 1) {
      index -= 1
      if (data[index][notEmptyIndex - 2] != '') {
        parent = data[index][0]
        break
      }
    }

    return parent
  }

  const csvFile = await fs.readFile(
    fs.cwd() +
      '/docs/organization/taxonomy-transform/examples/example-spreadsheet-2.csv'
  )
  const { data } = await csv.parse(csvFile.toString(), { header: false })
  let conceptScheme = null
  let parent = null

  for (let i = 0; i < data.length; i++) {
    const row = data[i]

    //Cocneptscheme
    if (row[1] != '') {
      conceptScheme = taxonomy.addConceptScheme(row[0], {
        prefLabel: row[1]
      })
      conceptSchemeId = row[0]
    } else {
      const notEmptyIndex = row.findIndex((c, index) => c != '' && index > 0)
      let concept = taxonomy.getConcept(row[0])

      if (!concept) {
        concept = taxonomy.addConcept(row[0], {
          prefLabel: row[notEmptyIndex]
        })
      }

      conceptScheme.addConcept(row[0])
      parent = findParent(data, i)
      if (parent) {
        concept.addBroader(parent)
      }
    }
  }
}
