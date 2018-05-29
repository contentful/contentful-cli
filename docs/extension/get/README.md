# Contentful CLI - `extension get` command

Prints information about the requested extension

## Usage

```
Usage: contentful extension get [options]

Options:
  --id                      Extension id                                   [string] [required]
  --space-id                Space id                                       [string]
  --environment-id          Environment id                                 [string] [default:master]
```

### Example

```shell
contentful extension get --space-id xxx --id test

┌─────────────┬───────────────────────────┐
│ Property    │ Value                     │
├─────────────┼───────────────────────────┤
│ ID          │ test                      │
├─────────────┼───────────────────────────┤
│ Name        │ Test Extension            │
├─────────────┼───────────────────────────┤
│ Field types │ Symbol                    │
├─────────────┼───────────────────────────┤
│ Src         │ https://awesome.extension │
├─────────────┼───────────────────────────┤
│ Version     │ 1                         │
└─────────────┴───────────────────────────┘
```
