# Contentful CLI - `login` command

Start a new session with our CLI tool.

As the CLI tool uses our Content Management API, you need to have an CMA access
token to use all the commands. This command will take care of that.

If no managementToken is supplied by using the `--management-token` flag,
a browser window will open, which let's you login or signup to a Contentful account.
As soon as are logged in, you have to press authorize the Contentful CLI tool
from within your browser which will afterwards display a freshly generated
secure CMA access token.

If a managementToken is supplied, any existing token will be **overwritten**.

The token will be stored in a `.contentfulrc.json` file within your user directory.

Running the command while logged in already will show your current token.

The logout is done via [contentful logout](../logout)

## Usage
```
Options:
  --management-token, --mt   Management token to use to login
```

## Example

```sh
contentful login
```
