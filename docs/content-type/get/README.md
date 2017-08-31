# Contentful CLI - `content-type get` command

Prints the structure of the requested Content Type

## Usage

```
Usage: contentful content-type get [options]

Options:
  --version   Show version number                                      [boolean]
  --id        Content Type id                                [string] [required]
  --space-id  Space id                                                  [string]
```

### Example

```shell
contentful content-type get --space-id xxx --id test
┌───────────────┬──────────┐
│ CT Property   │ CT Value │
├───────────────┼──────────┤
│ ID            │ test     │
├───────────────┼──────────┤
│ Name          │ Test     │
├───────────────┼──────────┤
│ Display Field │ long     │
└───────────────┴──────────┘
┌───┬──────────┬────────────┬────────────┬──────────┐
│ * │ Field ID │ Field Name │ Field Type │ Required │
├───┼──────────┼────────────┼────────────┼──────────┤
│ * │ long     │ long       │ Text       │ false    │
└───┴──────────┴────────────┴────────────┴──────────┘
```

