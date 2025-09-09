# Contentful CLI - `space environment-alias update` command

Change the target environment of the alias.

## Usage

```
Options:
  --alias-id, -a               ID of the alias to update              [required]
  --target-environment-id, -e  ID of the target environment             [string]
  --space-id, -s               ID of the space that the alias belongs to
```

### Example

```sh
contentful space environment-alias update --target-environment-id 'release-2' --alias-id 'master'
```
