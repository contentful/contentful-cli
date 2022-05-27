# Contentful CLI - `space accesstoken create` command

Create a new delivery access token.

## Usage

```
Usage: contentful accesstoken create --name 'Your token name' --description 'Your token description'

Options:
  --space-id          ID of Space with source data                [string]
  --management-token  Contentful management API token             [string]
  --name              Name of the Token to create                 [string]
  --description       Description giving more detailed
                      information about the usage of the Token    [string]
  --environment -e    Environment the access token will
                      have access to. Defaults to "master" if
                      omitted                                     [string]
  --silent            Suppress command output                     [boolean]
```

## Example

```sh
contentful accesstoken create --name 'Your token name' --description 'Your token description'
```
