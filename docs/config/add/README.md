# Contentful CLI - `config add` command

Adds a config to `~/.contentfulrc.json`

## Usage
```
Options:
  --management-token, --mt       API management token
  --active-space-id, --as        active space id
  --active-environment-id, --ae  active environment id
  --host, -h                     Show help                             [boolean]
  --proxy                        Proxy configuration in HTTP auth format:
                                 host:port or user:password@host:port   [string]
  --raw-proxy                    Pass proxy config as raw config instead of
                                 creating a httpsAgent                 [boolean]
  --config                       set all the config options at once

Examples:
  contentful config add [options]

```

### Example
```sh
contentful config add --proxy user:password@host:port
```
