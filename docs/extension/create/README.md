# Contentful CLI - `extension create` command

Creates an extension

## Usage

```
Usage: contentful extension create [options]

Options:
  --id                       ID                                    [string]
  --name                     Name                       [string] [required]
  --space-id                 Space ID                   [string] [required]
  --environment-id'          Environment id             [string] [default:master]

  --field-types              Field types                            [array]
  --descriptor               Path of descriptor file               [string]
  --src                      Src                                   [string]
  --srcdoc                   Path of srcdoc file                   [string]
  --sidebar                  Renders in sidebar                   [boolean]
  --installation-parameters  Installation parameter values         [string]

One of src or srcdoc is required
ID, name, field types, src, srcdoc and sidebar arguments can also be provided via the descriptor file
Installation parameters need to be defined in the descriptor file
Values for installation parameters can only be provided as CLI arguments
```

### Example

Update an extension using `src` without `./extension.json` descriptor file:

```shell
contentful extension create --space-id xxx --id test --name "Test Extension" --field-types Symbol --src https://new.extension
```

Create an extension using `srcdoc` with automatically assigned ID and two field types:

```shell
contentful extension create --space-id xxx --field-types Symbol --field-types Text --srcdoc ./bundle.html
```
When using `srcdoc` property, an extension is considered internally hosted. A file being pointed by the `srcdoc` property will be loaded and uploaded as a string to Contentful. All local dependencies have to be manually inlined into the file. The command line tool does not take care of link resolving and inlining of referenced local resources. The maximal size of a file used with the `srcdoc` property is `200kB`.

Create an extension using `./extension.json` descriptor file and provide installation parameter:

```shell
contentful extension create --space-id xxx --installation-parameters '{"devMode": true}'
```
