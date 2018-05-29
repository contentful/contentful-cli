# Contentful CLI - `extension delete` command

Deletes an extension

## Usage

```
Usage: contentful extension get [options]

Options:
  --id                       Extension id                              [string] [required]
  --space-id                 Space id                                             [string]
  --environment-id          Environment id             [string] [default:master]
  --version                  Version                                              [string]
  --force                    Force flag                                          [boolean]

One of version or force is required
```
### Example

```shell
contentful extension delete --space-id xxx --id test

Successfully deleted extension with ID test
```
