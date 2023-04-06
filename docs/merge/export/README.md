# Contentful CLI - `merge export` command

Export diff between two environments as a migration.

## Usage

```
Usage: contentful merge export
Options:
  -h, --help                     Show help                             [boolean]
  --source-environment-id, --se  Source environment id       [string] [required]
  --target-environment-id, --te  Target environment id       [string] [required]
  --yes, -y                      Confirm Merge app installation without prompt
  --output-file, -o              Output file. It defaults to
                                 ./migrations/<timestamp>-<space-id>-<source-env
                                 ironment-id>-<target-environment-id>.js[string]
```

### Example

```sh
contentful merge export --source-environment-id staging --target-environment-id master
```
