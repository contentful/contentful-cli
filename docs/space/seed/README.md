# Contentful CLI - `space seed` command

Seed a Content model including some example Content entries to your space.

Current it supports the following seed template:
* `blog`: Simple example blog template with `Post`, `Author` and `Category` Content types.

## Usage

```
Options:
  --template, -t  The template to apply on your Space
                                                    [required] [choices: "blog"]
  --spaceId, -s   ID of the Space to seed the data to
```

### Example
```sh
contentful space seed --template blog
```
