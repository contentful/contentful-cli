# Contentful CLI - `space seed` command

Seed a Content model including some example Content entries to your space.

Current it supports the following seed template:
* `blog`: Simple example blog template with `Post`, `Author` and `Category` Content types.

## Usage

```
Usage: contentful space seed --template blog

Options:
  -h, --help          Show help                                        [boolean]
  --template, -t      The template to apply on your Space. All possible options
                      are listed here:
                      https://github.com/contentful/content-models    [required]
  --space-id, -s      ID of the Space to seed the data to
  --management-token  Contentful management API token                   [string]
  --yes               Skip the confirmation question            [default: false]
```

### Example
```sh
contentful space seed --template blog
```
