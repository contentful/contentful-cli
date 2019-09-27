We appreciate any community contributions to this project, whether in the form of issues or Pull Requests.

This document outlines the we'd like you to follow in terms of commit messages and code style.

It also explains what to do in case you want to setup the project locally and run tests.

# Setup

Run `npm install` or `yarn` to install all necessary dependencies. When running `npm install` or `yarn` locally, `dist` is not compiled.

All necessary dependencies are installed under `node_modules` and any necessary tools can be accessed via npm scripts. There is no need to install anything globally.

# Code style

This project uses [standard](https://github.com/feross/standard). Install a relevant editor plugin if you'd like.

Everywhere where it isn't applicable, follow a style similar to the existing code.

# Commit messages and issues

This project uses the [Angular JS Commit Message Conventions](https://docs.google.com/document/d/1QrDFcIiPjSLDn3EL15IJygNPiHORgU1_OOAqWjiDU5Y/edit), via semantic-release. See the semantic-release [Default Commit Message Format](https://github.com/semantic-release/semantic-release#default-commit-message-format) section for more details.

**TLDR;**

- feat (feature) (e.g. `feat(scope): Implement new feature`)
- fix (bug fix) (e.g. `fix(scope): Fix a bug`)
- docs (documentation) (e.g. `docs(scope): Add documentation`)
- style (formatting, missing semi colons, …) (e.g. `style(scope): Format code`)
- refactor (e.g: `refactor(scope): Refactor feature`)
- test (when adding missing tests) (e.g. `feat(scope): Add missing test`)
- chore (maintain) (e.g. `chore(scope): Maintain stuff`)

**Note:** scope is optional, if there is not scope you can get rid of the parentheses

# Running tests

This project has unit and integration tests. Both of these run on both Node.js and Browser environments.

Both of these test environments are setup to deal with Babel and code transpiling, so there's no need to worry about that

- `npm test` runs all three kinds of tests and generates a coverage report
- `npm run test:unit` runs Node.js unit tests without coverage.

# Other tasks

- `npm run clean` removes any built files
- `npm run build` builds node package
- `npm run build:standalone` build standalone binary version
- `npm run dev` live rebuild - very useful when working on a feature
