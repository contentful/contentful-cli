function migrationFunction(migration, context) {
    migration.deleteContentType("comments")

    const footer = migration.editContentType("footer");
    footer
        .displayField("link")

    const footerV79Z1N4K3KZvjkbn = footer.deleteField("v79z1n4K3KZvjkbn");
    const footerLink = footer.createField("link");
    footerLink
        .name("Link")
        .type("Symbol")
        .localized(false)
        .required(false)
        .validations([])
        .disabled(false)
        .omitted(false)

    const headline = migration.editContentType("headline");
    const headlineDzaIi8HVqybcWgAl = headline.deleteField("DZAIi8hVqybcWGAl");
}
module.exports = migrationFunction;
