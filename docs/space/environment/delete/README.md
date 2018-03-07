# Contentful CLI - `space environment delete` command

Deletes an Environment from a Space. You have to supply an id for the Environment.

## Usage
```
Options:
  --environment-id, -e  Id of the environment to delete               [required]
  --space-id            ID of the space that holds the environment      [string]
```

### Example
```sh
contentful space environment delete --environment-id 'staging'
```
