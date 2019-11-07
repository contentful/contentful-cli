# Contentful CLI - `space environment-alias update` command

Change the target environment of the alias.

## Usage

```
Options:
  --alias-id, -a               Id of the alias to create              [required]
  --target-environment-id, -e  ID of the target environment             [string]
  --space-id, -s               ID of the space that the alias will belong to
```

### Example

```sh
contentful space environment-alias update --target-environment-id 'release-2' --alias-id 'master'
```
