# Contentful CLI - `merge show` command

Show diff in content types between two environments.

## Usage

```
Usage: contentful merge show
Options:
  -h, --help                     Show help                             [boolean]
  --source-environment-id, --se  Source environment id       [string] [required]
  --target-environment-id, --te  Target environment id       [string] [required]
  --space-id, -s                 ID of the space that holds the environment
                                                                        [string]
  --yes, -y                      Confirm Merge app installation without prompt
```

### Example

```sh
contentful merge show --source-environment-id staging --target-environment-id master
```
