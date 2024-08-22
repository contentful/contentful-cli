module.exports = async function ({ csv, concepts, updateConcept, addConcept }) {
  const { data } = await csv.parseFile('./example-spreadsheet.csv')

  for (const row of data) {
    const existingConcept = concepts.find(
      c => c.prefLabel['en-US'] === row['Animal Name']
    )
    if (existingConcept) {
      updateConcept({
        ...existingConcept,
        prefLabel: { 'en-US': row['Animal Name'] }
      })
    } else {
      addConcept({
        prefLabel: { 'en-US': row['Animal Name'] }
      })
    }
  }
}
