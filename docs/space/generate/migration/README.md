# Contentful CLI - `space generate migration` command

Generate a migration file for your content model or a specific content type

## Usage

```
Options:
  --space-id, -s  ID of the Space to use
  --environment-id, -e  ID of the Environment to use
  --content-type-id, -c  Optional - ID of the Content Type to use. If omitted will generate a migration for the complete content model
  --filename, -f  Optional - Name of the generated file. If omitted will generate one with the format SPACE_ID-ENV_ID[-CT_ID]-TIMESTAMP
```

This command will try to use if configured the Space ID and Environment ID saved by using `space use` and `space environment use`.

### Examples

Generate a migration for a space:

```sh
contentful space generate migration -s space_id -e master
```

Generate a migration for a specific content type in a space

```sh
contentful space generate migration -s space_id -e master -c my_content_type
```

Generate a migration with a specific destination file

```sh
contentful space generate migration -s space_id -e master -f 01-initial-migration.js
```
