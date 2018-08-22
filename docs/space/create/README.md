# Contentful CLI - `space create` command

Create a new Space. You have to supply a name for the space, while the ´--organization`
option is only relevant for power users.

## Usage
```
Usage: contentful space create --name 'Your Space Name'

Options:
  -h, --help                Show help                                  [boolean]
  --name, -n                Name of the space to create               [required]
  --management-token        Contentful management API token             [string]
  --organization-id, --org  Organization owning the new space
  --default-locale, -l      The default locale of the new space         [string]
```

### Example
```sh
contentful space create --name 'Your Space Name'
```
