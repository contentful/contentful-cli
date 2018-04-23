# Contentful CLI - `space use` command

Many commands have a `--space-id` option since they manipulate something related
to a space. Since it is very unintuitive to pass the Space ID every time, you can
use the `space use` command to lock your CLI to a specific Space. That one will
be used till you use another Space or pass a different `--space-id` to a subsequent
command.

## Usage

```
Options:
  --space-id, -s  ID of the Space to use for other commands
```


### Examples

Select and activate a Space interactively from a list of Spaces:
```sh
contentful space use
```

Select and activate a specific Space:
```sh
contentful space use -s a552c7cb6601
```
