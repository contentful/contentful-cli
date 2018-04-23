# Contentful CLI - `environment use` command

Many commands have a `--environment-id` option since they manipulate something related
to that environment in a space. Since it is very unintuitive to pass the Space ID every time, you can
use the `environment use` command to lock the CLI to a specific Environment. That one will
be used till you use another Environment or pass a different `--environment-id` to a subsequent
command. Note that if you specify a different `--space-id`, rather than using the already active space (see `space use`) then the currently in-use environment will be ignored and `'master'` will be used instead.

## Usage

```
Options:
  --environment-id, -e  ID of the Environment to use for other commands
```

### Examples

Select and activate a Environment interactively from a list of Environments:
```sh
contentful space environment use
```

Select and activate a specific Space:
```sh
contentful space environment use -e 'dev'
```

