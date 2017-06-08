# Contentful CLI - `config add` command

Adds a config to `~/.contentfulrc.json`

## Usage
```
Options:
  -h, --help                Show help                                  [boolean]
  --version                 Show version number                        [boolean]
  --management-token, --mt  API management token
  --active-space-id, --as   active space id
  --proxy                   Proxy configuration in HTTP auth format: host:port
                            or user:password@host:port                  [string]
  --config                  set all the config options at once

Examples:
  contentful config add [options]

```

### Example
```sh
contentful config add --proxy user:password@host:port
```
