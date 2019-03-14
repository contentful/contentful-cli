# Contentful CLI - `space environment create` command

Create a new Environment within a Space. You have to supply an id for the Environment.

## Usage
```
Options:
  --environment-id, -e   Id of the environment to create                   [required]
  --name, -n             Name of the environment to create
  --source, -src         ID of the source environment to create the new environment from
  --space-id             ID of the space the environment will belong to    [string]
  --await-processing, -w Wait until the environment is processed and ready [boolean] [default: false]
```

### Example
```sh
contentful space environment create --environment-id 'staging' --name 'Staging'
```
