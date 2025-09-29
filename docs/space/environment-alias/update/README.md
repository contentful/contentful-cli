# Contentful CLI - `space environment-alias update` command

Change the target environment of the alias. **NOTE:** You must opt-in to this feature in the Contentful web app on the Settings > Environments page.

## Usage

```
Options:
  --alias-id, -a               ID of the alias to update                [required]
  --target-environment-id, -e  ID of the target environment               [string]
  --space-id, -s               ID of the space that the alias belongs to  [string]
  --management-token, -mt      API management token                       [string]
  --header, -H                 Pass an additional HTTP Header             [string]
```

### Example

```sh
contentful space environment-alias update --target-environment-id 'release-2' --alias-id 'master'
```
