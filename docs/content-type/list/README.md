# Contentful CLI - `content-type list` command

Prints the Content Types in a space

## Usage

```
Usage: contentful content-type list [options]

Options:
  --space-id, -s            Space id                                                  [string]
  --management-token, -mt   Management token                                          [string]
  --environment-id, -e      Environment id                                            [string]
```

### Example

```shell
contentful content-type list --space-id xxx -e master

Environment: "master"
┌───────────────────┬────────────────────────┐
│ Content Type Name │ Content Type ID        │
├───────────────────┼────────────────────────┤
│ Test              │ test                   │
└───────────────────┴────────────────────────┘
```
