# Contentful CLI - `extension update` command

Updates an extension

## Usage

```
Usage: contentful extension update [options]

Options:
  --id                       ID                         [string] [required]
  --name                     Name                       [string] [required]
  --space-id                 Space ID                   [string] [required]
  --environment-id          Environment id             [string] [default:master]
  --field-types              Field types                            [array]
  --descriptor               Path of descriptor file               [string]
  --src                      Src                                   [string]
  --srcdoc                   Path of srcdoc file                   [string]
  --sidebar                  Renders in sidebar                   [boolean]
  --version                  Version                               [string]
  --force                    Force update                         [boolean]
  --installation-parameters  Installation parameter values         [string]

One of src or srcdoc is required
One of version or force is required
ID, name, field types, src, srcdoc and sidebar arguments can also be provided via the descriptor file
Installation parameters need to be defined in the descriptor file
Values for installation parameters can only be provided as CLI arguments
```

### Examples

Update an extension without providing its current version:

```shell
contentful extension update --space-id xxx --id test --name "Test Extension" --field-types Symbol --src https://new.extension --force
```

Update an extension using `srcdoc` and two field types:

```shell
contentful extension update --space-id xxx --id test --field-types Symbol --field-types Text --srcdoc ./bundle.html --version 2
```

Update an extension using `./extension.json` descriptor file and provide installation parameter:

```shell
contentful extension update --space-id xxx --installation-parameters '{"devMode": true}' --force
```
