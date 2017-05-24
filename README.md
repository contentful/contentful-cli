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

Using Brew on MacOS:
```sh
brew install contentful-cli
```

Standalone installation on Linux or MacOS:
- Download the latest version of the executeable for your OS
- Add the download directory to path `export PATH=$PATH:~/downloaddirectory`
- You now have the Contentful cli tool installed.

Standalone installation on Windows:
- Download the latest version of the `.exe`
- Add the executeable to your Path:
    1. Open the start menu and type "Edit environment variables"
    2. Click "Edit environment variables for your account"
    3. In the User variables box select the Path variable.
    4. Click "Edit..."
    5. In the new dialog, click "New"
    6. Add the location where you downloaded the `.exe` and click OK
    7. Restart your system
- You now have the Contentful cli tool installed.

## :hand: Usage

Use the `--help` parameter to display the help section for CLI tool or combined with a specific command to get the help section for that command.

```sh
contentful --help
# or
contentful space --help
```

## :question: Support

If you have other problems with Contentful not related to this library, you can contact [Customer Support](https://support.contentful.com).

## :scroll: License

MIT
