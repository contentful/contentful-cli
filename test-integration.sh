#!/usr/bin/env bash
if [[ "$TRAVIS_BRANCH" == "master" || $TRAVIS_PULL_REQUEST ]]; then
  npm run test:integration:ci
fi
