# Contentful CLI - `organization export` command

This command helps you export organization data to a json file

## Usage

```
contentful organization export

export a space data to a json file

Options:
  -h, --help                Show help                                    [boolean]
  --organization-id         ID of organization                             [string]

  --save-file               Save the export as a json file
                                                         [boolean] [default: true]

  --header                  Pass an additional HTTP Header
  --output-file             Output file.
                                        [string] [default: ./migrations/<timestamp>-<organization-id>.json]
```

### Example

```sh
contentful organization export
```

## Exported data

```js
{
  "taxonomy": {"concepts": [], "conceptSchemes": []},
}
```
