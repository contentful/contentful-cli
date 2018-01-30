# Contentful CLI - `extension create` command

Creates an extension

## Usage

```
Usage: contentful extension create [options]

Options:
  --id           ID                                                [string]
  --name         Name                                   [string] [required]
  --space-id     Space ID                               [string] [required]
  --field-types  Field types                             [array] [required]
  --descriptor   Descriptor                                        [string]
  --src          Src                                               [string]
  --srcdoc       Srcdoc                                            [string]
  --sidebar      Sidebar                                          [boolean]

One of src or srcdoc is required
ID, name, field types, src, srcdoc and sidebar arguments can also be provided via the descriptor file
```

### Example

```shell
contentful extension create --space-id xxx --id test --name "Test Extension" --field-types Symbol --src https://awesome.extension

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
