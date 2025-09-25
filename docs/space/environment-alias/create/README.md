# Contentful CLI - `space environment-alias create` command

Create a new environment alias. **NOTE:** You must opt-in to this feature in the Contentful web app on the Settings > Environments page.

## Usage

```
Options:
  --alias-id, -a               ID of the alias to create                  [required]
  --target-environment-id, -e  ID of the target environment               [required]
  --space-id, -s               ID of the space that the alias belongs to    [string]
  --management-token, -mt      API management token                         [string]
  --header, -H                 Pass an additional HTTP Header               [string]
```

### Example

```sh
contentful space environment-alias create --alias-id 'staging' --target-environment-id 'release-2'
```
