# Contentful CLI

> [Contentful's](https://www.contentful.com) command line interface tool. Use Contentful features straight from your CLI.

[![npm](https://img.shields.io/npm/v/contentful-cli.svg)](https://www.npmjs.com/package/contentful-cli)
[![Contentful](https://circleci.com/gh/contentful/contentful-cli.svg?style=shield)](https://circleci.com/gh/contentful/contentful-cli)

[Contentful](https://www.contentful.com) provides a content infrastructure for digital teams to power content in websites, apps, and devices. Unlike a CMS, Contentful was built to integrate with the modern software stack. It offers a central hub for structured content, powerful management and delivery APIs, and a customizable web app that enable developers and content creators to ship digital products faster.

## :rocket: Features

- Get started with Contentful with the `init` command.
- Manage spaces - list, create, delete,...
- Export your space to a JSON file.
- Import your space from a JSON file.
- Execute migration scripts written in the [Contentful Migration DSL](https://github.com/contentful/contentful-migration/blob/master/README.md#reference-documentation)
- Generate migration scripts for the [Contentful Migration DSL](https://github.com/contentful/contentful-migration/blob/master/README.md#reference-documentation) from existing spaces.
- Seed your space with example data.
- Manage installation of [extensions](https://github.com/contentful/extensions) in a space.
- Securely login and logout with our [OAuth service](https://www.contentful.com/developers/docs/references/authentication/).
- Find all available commands in the [docs section](https://github.com/contentful/contentful-cli/tree/master/docs).

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

## :books: Documentation

More detailed documentation for every command can be found in the [docs section](https://github.com/contentful/contentful-cli/tree/master/docs).

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

## :robot: Testing

### Integration tests

To run integration tests locally, you'll need the following:

1. Set environment variables in `.jest/env.js` (can be found in 1Password)
   ```js
   process.env.CONTENTFUL_INTEGRATION_TEST_CMA_TOKEN = '<cma_auth_token>'
   process.env.CLI_E2E_ORG_ID = '<organization_id>'
   ```
2. Run [talkback](https://github.com/ijpiantanida/talkback) proxy to record and playback http requests
   ```sh
   npm run talkback-proxy
   ```
3. In another terminal shell run your preferred tests
   ```sh
   ## Run all integration tests
   npm run test:jest
   ## Or run specific tests
   npx jest test/integration/cmds/space/* --watch
   ```

### Unit tests

Simply run:

```sh
# Run all unit tests
npm run test:unit:watch
# Or run specific tests
npx jest /test/unit/cmds/* --watch
```

See [jest](https://jestjs.io/) documentation for more details about running tests and optional flags.

### Updating Snapshots

You might need to update snapshots and it's challenging with the recordings.

Tip: run tests without recordings to update the snapshots.

```
npx jest test/integration/cmds/<path to the affected test file> --updateSnapshot
```

## :question: Support

If you have a problem with this tool, please file an [issue](https://github.com/contentful/contentful-cli/issues/new) here on Github.

If you have other problems with Contentful not related to this library, you can contact [Customer Support](https://support.contentful.com).

## :writing_hand: Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md)

## :scroll: License

MIT
