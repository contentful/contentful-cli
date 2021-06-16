# Contentful CLI - `space environment create` command

Create a new Environment within a Space. You have to supply an id for the Environment.

## Usage

```
Options:
  --environment-id, -e      Id of the environment to create           [required]
  --name, -n                Name of the environment to create         [required]
  --source, --src           ID of the source environment to create the new
                            environment from                            [string]
  --space-id, -s            ID of the space that the environment will belong to
                                                                        [string]
  --await-processing, -w    Wait until the environment is processed and ready
                                                      [boolean] [default: false]
  --processing-timeout, -t  Await processing times out after specified number of
                            minutes (only is applied if await-processing is set)
                                                           [number] [default: 5]
  --management-token, --mt  Contentful management API token             [string]
  --header, -H              Pass an additional HTTP Header              [string]
```

### Example

```sh
contentful space environment create --environment-id 'staging' --name 'Staging'
```
