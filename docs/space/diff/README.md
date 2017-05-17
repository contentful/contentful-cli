# Contentful CLI - `space diff` command
This command shows the contentTypes diff between two spaces

## Usage

```
Usage: contentful space diff [options]

Options:
  --target-space           Target space to check against      [string] [required]
  --generate-patch         Generate patch file along with the diffing [boolean] [default: false]
  --patch-dir              Directory to save the patch files to [string] [default: cwd]
```

### Example

```sh
contentful space diff \
  --target-space <space-id>\
```
