# Contentful CLI - `space export` command

This command helps you backup your published Content Model, Content and Assets or move them to a new Contentful space. It will support Roles & Permissions in a future version.

To import your exported data, please refer to the [import](../import) command.

## Usage

```
contentful space export

export a space data to a json file

Options:
  -h, --help              Show help                                    [boolean]
  --space-id              ID of Space with source data                  [string]
  --environment-id        ID of Environment with source data
                                                    [string] [default: "master"]
  --management-token      Contentful management API token               [string]
  --export-dir            Defines the path for storing the export json file
                          (default path is the current directory)       [string]
  --include-drafts        Include drafts in the exported entries
                                                      [boolean] [default: false]
  --skip-content-model    Skip exporting content models
                                                      [boolean] [default: false]
  --skip-content          Skip exporting assets and entries
                                                      [boolean] [default: false]
  --skip-roles            Skip exporting roles and permissions
                                                      [boolean] [default: false]
  --skip-webhooks         Skip exporting webhooks     [boolean] [default: false]
  --content-only          only export entries and assets
                                                      [boolean] [default: false]
  --download-assets       With this flags assets will also be downloaded
                                                                       [boolean]
  --max-allowed-limit     How many items per page per request
                                                        [number] [default: 1000]
  --host                  Management API host
                                        [string] [default: "api.contentful.com"]
  --proxy                 Proxy configuration in HTTP auth format:
                          [http|https]://host:port or
                          [http|https]://user:password@host:port        [string]
  --error-log-file        Full path to the error log file               [string]
  --query-entries         Exports only entries that matches these queries[array]
  --query-assets          Exports only assets that matches these queries [array]
  --content-file          The filename for the exported data            [string]
  --save-file             Save the export as a json file
                                                       [boolean] [default: true]
  --use-verbose-renderer  Display progress in new lines instead of displaying a
                          busy spinner and the status in the same line. Useful
                          for CI.                     [boolean] [default: false]
  --config                An optional configuration JSON file containing all the
                          options for a single run
```

### Example

```sh
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
  "editorInterfaces": []
}
```

## Limitations

- This tool currently does **not** support the export of space memberships.
- Exported webhooks with credentials will be exported as normal webhooks. Credentials should be added manually afterwards.
- UI extensions will not be exported
