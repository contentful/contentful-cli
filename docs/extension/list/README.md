# Contentful CLI - `extension list` command

Prints the Extensions in a space

## Usage

```
Usage: contentful extension list [options]

Options:
  --space-id  Space id                                                  [string]
```

### Example

```shell
contentful extension list --space-id xxx

┌────────────────┬──────────────┬──────────────┐
│ Extension Name │ Extension ID │ Version      │
├────────────────┼──────────────┼──────────────┤
│ Test           │ test         │ 3            │
└────────────────┴──────────────┴──────────────┘
```
