# Contentful CLI - `space patch` command

Modifies a space's content types by applying patches to their structure. These patches are inspired by the format described in http://jsonpatch.com/

## Usage
``
Usage: contentful space patch [options]

--space-id        Space id                                            [string]
--dry-run         Do not save the changes to the Content Model
[boolean] [default: false]
--yes      Do not ask for confirmation for each patch
[boolean] [default: false]
--patch-dir, -p                                                    [required]
``

### Example

``shell
contentful space patch --patch-dir ./patches 
``
