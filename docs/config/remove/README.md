# Contentful CLI - `config remove` command

Removes a config from `~/.contentfulrc.json`

## Usage
```
Options:
  -h, --help                Show help                                  [boolean]
  --version                 Show version number                        [boolean]
  --management-token, --mt  Remove the API management token from the config
                                                      [boolean] [default: false]
  --active-space-id, --as   Remove the active space id form the config
                                                      [boolean] [default: false]
  --proxy, -p               Remove the proxy from the config
                                                      [boolean] [default: false]
  --all                     Remove all the things from the config
                                                      [boolean] [default: false]

Examples:
  contentful config remove [options]
```

### Example
```sh
contentful config remove --proxy 
```
