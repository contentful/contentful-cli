module.exports = function (context) {
  context.addConcept({
    prefLabel: { 'en-US': 'Hello world' + Date.now().toString() }
  })
}
