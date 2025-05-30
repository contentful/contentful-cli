# Contentful CLI - `organization import` command

This Command enables you to import Organization Taxonomies generated by the `export` command to Contentful Organizations.

## Usage

```
Usage: contentful organization import --organization-id <organization-id> --content-file <path/to/content_file.json>

Options:
  -h, --help                Show help                                  [boolean]
  --management-token, --mt  Contentful management API token             [string]
  --organization-id, --oid  ID of Organization with source data
                                                             [string] [required]
  --header, -H              Pass an additional HTTP Header              [string]
  --content-file, -f        Content file with entities that need to be imported
                                                             [string] [required]
  --silent, -s              Suppress any log output   [boolean] [default: false]
  --error-log-file          Full path to the error log file             [string]
```

### Example

```sh
contentful organization import --content-file <path/to/content_file.json> --organization-id <organization-id>
```

## Limitations

- This tool only imports **Taxonomy** entities. Any other Organization level entities will not be imported.
- For Space scoped entities (Entries, Assets, Apps etc) see [space command](https://github.com/contentful/contentful-cli/blob/main/docs/space/import/README.md)
