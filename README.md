# Contentful CLI

> [Contentful's](https://www.contentful.com) command line interface tool. Use Contentful features straight from your CLI.

[![npm](https://img.shields.io/npm/v/contentful-cli.svg)](https://www.npmjs.com/package/contentful-cli)
[![Build Status](https://travis-ci.com/contentful/contentful-cli.svg?token=fyDxSEex8FXB9BKySX88&branch=master)](https://travis-ci.com/contentful/contentful-cli)
[![codecov](https://codecov.io/gh/contentful/contentful-cli/branch/master/graph/badge.svg?token=c2bwazppuO)](https://codecov.io/gh/contentful/contentful-cli)

[Contentful](https://www.contentful.com) provides a content infrastructure for digital teams to power content in websites, apps, and devices. Unlike a CMS, Contentful was built to integrate with the modern software stack. It offers a central hub for structured content, powerful management and delivery APIs, and a customizable web app that enable developers and content creators to ship digital products faster.

## :rocket: Features

- Securely login and logout with our [OAuth service](https://www.contentful.com/developers/docs/references/authentication/).
- Manage spaces - List, create, ...
- Export your space to a JSON file.
- Import your space from a JSON file.
- Execute migration scripts written in the [Contentful Migration DSL](https://github.com/contentful/contentful-migration/blob/master/README.md#reference-documentation)
- Generate migration scripts for the [Contentful Migration DSL](https://github.com/contentful/contentful-migration/blob/master/README.md#reference-documentation) from existing spaces.
- Seed your space with example data.
- Manage installation of [extensions](https://github.com/contentful/extensions) in a space.
- Run a guide which introduces you to the Contentful basics.
- Find all available commands in the [docs section](https://github.com/contentful/contentful-cli/tree/master/docs).
- More to come soon! 🚀

## :cloud: Installation

Using [homebrew](https://brew.sh):

``` sh
brew install contentful-cli
```

Using [npm](https://npmjs.org):

``` sh
npm install -g contentful-cli
```

Using [yarn](https://yarnpkg.com):
``` sh
yarn global add contentful-cli
```

Please note that for the non standalone versions you need node `=> v8` to use the CLI.

## :hand: Usage

Use the `--help` parameter to display the help section for CLI tool or combined with a specific command to get the help section for that command.

```sh
contentful --help
# or
contentful space --help
```

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
2. `https_proxy` takes precedence over `http_proxy`


## :rescue_worker_helmet: Troubleshooting

* Unable to connect to Contentful through your Proxy? Try settings `rawProxy: true` in your `.contentfulrc.json` via:

```sh
contentful config add --raw-proxy
```

## :books: Documentation

More detailed documentation for every command can be found in the [docs section](https://github.com/contentful/contentful-cli/tree/master/docs).

## :hammer_and_wrench: Development

After installing the dependencies, there is a trick to get your version of the CLI tool available globally on your system:
```sh
npm link
```

This may collide with your already globally installed Contentful CLI. Make sure to remove that one first.

## :robot: Testing

### Integration Tests
We are using [talkback](https://github.com/ijpiantanida/talkback) proxy to record and playback http requests in our integration tests. To run tests with the talkback proxy and recordings, simply run

```sh
npm run test:integration
```

For development, it might be easier to run the talkback proxy in one shell and run tests ad-hoc (or with a `--watch` flag) using jest commands in another shell. This flow might look like this:

```
npm run pretest:integration // ensure config is set up correctly for tests
npm run run-talkback-proxy // start proxy in one shell

// open another shell

jest test/integration/cmds/space/* --watch // run tests using jest in another shell
```
See [jest](https://jestjs.io/) documentation for more details about running tests and optional flags.


:warning: Environment variables for integration tests must be set:

```
CLI_E2E_CMA_TOKEN = <cma_auth_token>
CLI_E2E_ORG_ID = <organization_id>
```

### Updating Snapshots
You might need to update snapshots and it's challenging with the recordings.

Tip: run tests without recordings to update the snapshots.

```
jest test/integration/cmds/<path to the affected test file> --updateSnapshot
``

If running `jest` alone, not from an npm script, you'll need to make sure your local config is set up correctly for the tests.

```
npm run pretest:integration // this backs up your current config and puts in integration test config
./bin/contentful.js config list // check what's in there if you're curious
./bin/contentful.js config remove --proxy // remove proxy config since you're not using talkback recordings
./bin/contentful.js config remove --raw-proxy

npm run posttest:integration // after running your tests, this restores your config to how it was before
```



## :question: Support

If you have a problem with this tool, please file an [issue](https://github.com/contentful/contentful-cli/issues/new) here on Github.

If you have other problems with Contentful not related to this library, you can contact [Customer Support](https://support.contentful.com).

## :writing_hand: Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md)

## :scroll: License

MIT
