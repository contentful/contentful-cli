# Contentful CLI

> [Contentful's](https://www.contentful.com) command line interface tool. Use Contentful features straight from your CLI.

[![npm](https://img.shields.io/npm/v/contentful-cli.svg)](https://www.npmjs.com/package/contentful-cli)
[![Contentful](https://circleci.com/gh/contentful/contentful-cli.svg?style=shield)](https://circleci.com/gh/contentful/contentful-cli)

[Contentful](https://www.contentful.com) provides a content infrastructure for digital teams to power content in websites, apps, and devices. Unlike a CMS, Contentful was built to integrate with the modern software stack. It offers a central hub for structured content, powerful management and delivery APIs, and a customizable web app that enable developers and content creators to ship digital products faster.

## :rocket: Features

- Get started with Contentful with the `init` command.
- Manage spaces - list, create, delete,...
- Manage content types - get, list, create, update, delete, publish, unpublish.
- Manage entries - get, list, create, update, delete, publish, unpublish, archive, unarchive.
- Manage assets - get, list, upload, update, delete, publish, unpublish.
- Export your space to a JSON file.
- Import your space from a JSON file.
- Execute migration scripts written in the [Contentful Migration DSL](https://github.com/contentful/contentful-migration/blob/main/README.md#reference-documentation)
- Generate migration scripts for the [Contentful Migration DSL](https://github.com/contentful/contentful-migration/blob/main/README.md#reference-documentation) from existing spaces.
- Seed your space with example data.
- Manage installation of [extensions](https://github.com/contentful/extensions) in a space.
- Securely login and logout with our [OAuth service](https://www.contentful.com/developers/docs/references/authentication/).
- Run organization security & configuration checks (security contact, audit logging, access tokens, SSO, MFA) with `contentful organization sec-check`.
- Find all available commands in the [docs section](https://github.com/contentful/contentful-cli/tree/main/docs).

## :cloud: Installation

Make sure you have [Node LTS](https://nodejs.org/en/) installed

Then using [npm](https://npmjs.org) or [yarn](https://yarnpkg.com):

```sh
npm install -g contentful-cli
# Or
yarn global add contentful-cli
```

Please note that for the non standalone versions you need Node LTS to use the CLI.

## :hand: Usage

Use the `--help` parameter to display the help section for CLI tool or combined with a specific command to get the help section for that command.

```sh
contentful --help
# Or
contentful space --help
```

## :package: Content Management Commands

The CLI provides commands for managing content types, entries, and assets directly from the command line. All commands support the following standard options:

| Option | Alias | Description |
|--------|-------|-------------|
| `--space-id` | `-s` | ID of the space to use |
| `--environment-id` | `-e` | ID of the environment (default: `master`) |
| `--management-token` | `--mt` | Contentful management API token |
| `--json` | | Output as JSON |
| `--quiet` | `-q` | Output IDs only (for piping) |
| `--agent-mode` | | Output in TOON format for agent consumption |

### Content Type commands

```sh
contentful content-type get --id <content-type-id>
contentful content-type list
contentful content-type create --name "Blog Post" --fields '[{"id":"title","name":"Title","type":"Symbol"}]'
contentful content-type update --id <id> --name "Updated Name"
contentful content-type delete <id>
contentful content-type publish <id>
contentful content-type unpublish <id>
```

### Entry commands

```sh
contentful entry get <entry-id>
contentful entry list [--content-type <content-type-id>]
contentful entry create --content-type <ct-id> --fields '{"title":{"en-US":"Hello"}}'
contentful entry update <id> --fields '{"title":{"en-US":"Updated"}}'
contentful entry delete <id>
contentful entry publish <id>
contentful entry unpublish <id>
contentful entry archive <id>
contentful entry unarchive <id>
```

### Asset commands

```sh
contentful asset get <asset-id>
contentful asset list
contentful asset upload --file ./image.png --title "My Image"
contentful asset update <id> --title "New Title"
contentful asset delete <id>
contentful asset publish <id>
contentful asset unpublish <id>
```

### Dry-run mode

Commands that create, update, or delete resources support `--dry-run` to preview the operation without making changes:

```sh
contentful entry create --content-type blogPost --fields '{"title":{"en-US":"Test"}}' --dry-run
contentful asset upload --file ./photo.jpg --title "Photo" --dry-run
```

### Piping and scripting

Use `--quiet` to output only IDs, making it easy to pipe into other commands:

```sh
# Unpublish all entries of a content type
contentful entry list --content-type blogPost --quiet | xargs -I{} contentful entry unpublish {}
```

## :books: Documentation

More detailed documentation for every command can be found in the [docs section](https://github.com/contentful/contentful-cli/tree/main/docs).

## Using the CLI tool with a proxy

You can save the proxy configuration in your `.contentfulrc.json` via:

```sh
contentful config add --proxy user:auth@host:port
```

We also respect the `http(s)_proxy` environment variables:

```sh
https_proxy=user:auth@host:port contentful
```

When multiple proxy configurations exists, precedence is taken in this form:

1. `http_proxy` takes precedence over `.contentfulrc.json`
2. `https_proxy` takes precedence over `.contentfulrc.json`
3. `https_proxy` takes precedence over `http_proxy`

## Configuring the CLI for EU usage

You can override the host configuration in your `.contentfulrc.json` via:

```sh
contentful config add --host api.eu.contentful.com --host-delivery cdn.eu.contentful.com
```

Then any subsequent command will use the EU hosts. E.g. `contentful login` will log you in to your EU Contentful instance.

## :rescue_worker_helmet: Troubleshooting

- Unable to connect to Contentful through your Proxy? Try settings `rawProxy: true` in your `.contentfulrc.json` via:

```sh
contentful config add --raw-proxy
```

## :hammer_and_wrench: Development

1. Install dependencies
   ```sh
   npm i
   ```
2. To avoid development version colliding with your already installed Contentful CLI, change the command name in `package.json`
   ```diff
     "bin": {
   -     "contentful": "bin/contentful.js"
   +     "ctfl": "bin/contentful.js"
     }
   ```
3. Link your local version, and happy hacking :tada:
   ```sh
   npm link
   ```



## :question: Support

If you have a problem with this tool, please file an [issue](https://github.com/contentful/contentful-cli/issues/new) here on Github.

If you have other problems with Contentful not related to this library, you can contact [Customer Support](https://support.contentful.com).

## :writing_hand: Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md)

## :scroll: License

MIT

