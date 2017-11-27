# Contentful CLI

> [Contentful's](https://www.contentful.com) command line interface tool. Use Contentful features straight from your CLI.

[![npm](https://img.shields.io/npm/v/contentful-cli.svg)](https://www.npmjs.com/package/contentful-cli)
[![Build Status](https://travis-ci.com/contentful/contentful-cli.svg?token=fyDxSEex8FXB9BKySX88&branch=master)](https://travis-ci.com/contentful/contentful-cli)
[![codecov](https://codecov.io/gh/contentful/contentful-cli/branch/master/graph/badge.svg?token=L0f5L0tgr9)](https://codecov.io/gh/contentful/contentful-cli)

[Contentful](https://www.contentful.com) is a content management platform for web applications, mobile apps and connected devices. It allows you to create, edit & manage content in the cloud and publish it anywhere via a powerful API. Contentful offers tools for managing editorial teams and enabling cooperation between organizations.

## :rocket: Features

- Securely login and logout with our [OAuth service](https://www.contentful.com/developers/docs/references/authentication/).
- Manage spaces - List, create, ...
- Seed your space with example data
- Run a guide which introduces you to the Contentful basics.
- Find all available commands in the [docs section](https://github.com/contentful/contentful-cli/tree/master/docs).
- More to come soon! 🚀

## :cloud: Installation

Using [npm](http://npmjs.org):

``` sh
npm install -g contentful-cli
```

Using [yarn](https://yarnpkg.com):
``` sh
yarn global add contentful-cli
```

Please note that for the non standalone versions you need node `=> v6` to use the CLI.

## :hand: Usage

Use the `--help` parameter to display the help section for CLI tool or combined with a specific command to get the help section for that command.

```sh
contentful --help
# or
contentful space --help
```

### Enable bash-completion

To enable bash-completion for available commands use the `completion` command and concat the generated script to your .bashrc or .bash_profile.

```sh
contentful completion
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

## :books: Documentation

More detailed documentation for every command can be found in the [docs section](https://github.com/contentful/contentful-cli/tree/master/docs).

## :hammer_and_wrench: Development

After installing the dependencies, there is a trick to get your version of the CLI tool available globally on your system:
```sh
npm link
```

This may collide with your already globally installed Contentful CLI. Make sure to remove that one first.

## :robot: Testing

### End-To-End Functional Tests

:warning: Environment variables should be set:

```
CMA_TOKEN = <cma_auth_token>
ORG_ID = <organization_id>
```

#### npm:
```sh
npm run test:e2e
```

#### or using AVA:
```sh
$ ava test/integration/** --verbose --serial
```

:warning: Since the e2e tests are running in serial mode currently, you should be logged out or `rm ~/.contentfulrc.json`


## :question: Support

If you have a problem with this tool, please file an [issue](https://github.com/contentful/contentful-cli/issues/new) here on Github.

If you have other problems with Contentful not related to this library, you can contact [Customer Support](https://support.contentful.com).

## :writing_hand: Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md)

## :scroll: License

MIT
