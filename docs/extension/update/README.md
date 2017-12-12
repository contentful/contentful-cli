# Contentful CLI - `extension update` command

Updates a UI extension

## Usage

```
Usage: contentful extension update [options]

Options:
  --id           ID                                     [string] [required]
  --name         Name                                   [string] [required]
  --space-id     Space ID                               [string] [required]
  --field-types  Field types                             [array] [required]
  --descriptor   Descriptor                                        [string]
  --src          Src                                               [string]
  --srcdoc       Srcdoc                                            [string]
  --sidebar      Sidebar                                          [boolean]
  --version      Version                                           [string]
  --force        Force flag                                       [boolean]

One of src or srcdoc is required
One of version or force is required
ID, name, field types, src, srcdoc and sidebar arguments can also be provided via the descriptor file
```

### Example

```shell
contentful extension update --space-id xxx --id test --name "Test Extension" --field-types Symbol --src https://new.extension --force

┌─────────────┬───────────────────────┐
│ Property    │ Value                 │
├─────────────┼───────────────────────┤
│ ID          │ test                  │
├─────────────┼───────────────────────┤
│ Name        │ New Extension         │
├─────────────┼───────────────────────┤
│ Field types │ Symbol                │
├─────────────┼───────────────────────┤
│ Src         │ https://new.extension │
├─────────────┼───────────────────────┤
│ Version     │ 1                     │
└─────────────┴───────────────────────┘
```
