#!/usr/bin/env bash
#
# Script to automatically create a pr in the Homebrew/homebrew-core repo to update the contentful-cli formula
# (works only for macOS, with HOMEBREW_GITHUB_API_TOKEN set and a valid ssh key)

command -v brew >/dev/null 2>&1 || /usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
brew update
brew install coreutils

if [ ! $(git config --global user.email) ]; then git config --global user.email "support@contentful.com"; fi
if [ ! $(git config --global user.name) ]; then git config --global user.name "contentful"; fi

package="contentful-cli"
version=$(npm show ${package} version)
url="https://registry.npmjs.org/${package}/-/${package}-${version}.tgz"
sha256=$(curl -s ${url} | gsha256sum | awk '{ print $1 }')

brew bump-formula-pr --strict ${package} --url=${url} --sha256=${sha256} --no-browse --message="This PR was automatically created via a script. Contact @contentful with any questions."
