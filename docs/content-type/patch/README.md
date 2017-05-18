# Contentful CLI - `content-type patch` command

Modifies a Content Type by applying patches to its structure. This patches are inspired in the format described
in http://jsonpatch.com/

## Usage
```
Usage: contentful content-type patch [options]

  --space-id        Space id                                            [string]
  --dry-run         Do not save the changes to the Content Type
                                                      [boolean] [default: false]
  --no-confirm      Do not ask for confirmation for each patch
                                                      [boolean] [default: false]
  --patch-file, -p                                                    [required]
```

### Example

```shell
contentful content-type patch --space-id xxx patch --patch-file ./Test.json
```

