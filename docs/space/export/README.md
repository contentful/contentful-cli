# Contentful CLI - `space export` command

This command helps you backup your published Content Model, Content and Assets or move them to a new Contentful space. It will support Roles & Permissions in a future version.

To import your exported data, please refer to the [import](../import) command.

## Usage and examples

```
Usage: contentful space export [options]

Options:
  --space-id              ID of Space with source data                  [string]
                          (if not specified it will take the context active space)
  --export-dir            Defines the path for storing the export json file
                          (default path is the current directory)       [string]

  --include-drafts        Include drafts in the exported entries
                                                      [boolean] [default: false]

  --skip-content-model    Skip exporting content models
                                                      [boolean] [default: false]

  --skip-content          Skip exporting assets and entries
                                                      [boolean] [default: false]

  --skip-webhooks         Skip exporting webhooks     [boolean] [default: false]

  --download-assets       With this flags assets will also be downloaded
                                                      [boolean] [default: false]

  --max-allowed-limit     How many items per page per request
                                                      [number] [default: 1000]

  --management-host       Management API host
                                        [string] [default: "api.contentful.com"]

  --error-log-file        Full path to the error log file [string]

  --use-verbose-renderer  Display progress in new lines instead of displaying a
                          busy spinner and the status in the same line. Useful
                          for CI.                     [boolean] [default: false]

  --save-file           Save the export as a json file [boolean] [default: true]

```

### Example

```shell
contentful space export
```

## Exported data

```js
{
  "contentTypes": [],
  "entries": [],
  "assets": [],
  "locales": [],
  "webhooks": [],
  "roles: [],
  "editorInterfaces": []
}
```

## Limitations

- This tool currently does **not** support the export of space memberships.
- Exported webhooks with credentials will be exported as normal webhooks. Credentials should be added manually afterwards.
- UI extensions will not be exported 
