# Contentful CLI - `space migration` command

This command parses and runs a migration script based on [Contentful's migration tooling](https://github.com/contentful/contentful-migration) on a Contentful space.

## Usage

```sh

Usage: contentful space migration [args] <path-to-script-file>

Script: path to a migration script.

Options:
  -h, --help, --help    Show help                                      [boolean]
  --version             Show version number                            [boolean]
  --space-id, -s        ID of the space to run the migration script on[required]
  --environment-id, -e  ID of the environment within the space to run the
                        migration script on                  [default: "master"]
  --management-token,   The Contentful management access token to use
  --mt                  This takes precedence over environment variables or
                        .contentfulrc
  --yes, -y             Skips any confirmation before applying the migration
                        script                        [boolean] [default: false]
  --retry-limit         Number of retries before failure
  --config              An optional configuration JSON file containing all the
                        options for a single run

```

## Examples

```sh
contentful space migration  --space-id abcedef my-migration.js
```
