#!/usr/bin/env bash
#
# Script to automatically create a pr in the Homebrew/homebrew-core repo to update the contentful-cli formula
# (works only for macOS, with HOMEBREW_GITHUB_API_TOKEN set and a valid ssh key)

command -v brew >/dev/null 2>&1 || /usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
brew update
brew install coreutils

DRY_RUN=" --dry-run"
if [ "${CIRCLE_BRANCH}" == "master" ]; then DRY_RUN=""; fi

if [ ! $(git config --global user.email) ]; then git config --global user.email "support@contentful.com"; fi
if [ ! $(git config --global user.name) ]; then git config --global user.name "contentful"; fi

package="contentful-cli"
version=$(npm show ${package} version)
url="https://registry.npmjs.org/${package}/-/${package}-${version}.tgz"
sha256=$(curl -s ${url} | gsha256sum | awk '{ print $1 }')

# send stderr to variable, pass stdout through
{
  err=$(
    brew bump-formula-pr --strict ${package} --url=${url} --sha256=${sha256} --no-browse --message="This PR was automatically created via a script. Contact @contentful with any questions." ${DRY_RUN} 2>&1 >&3 3>&-
  )
} 3>&1

echo "$err"

function has_substring() {
  [[ "$1" =~ "$2" ]]
}

if has_substring "$err" "Error:"; then
  # fail soft for CI (if version not bumped, pr already opened or running on feature branch)
  if has_substring "$err" "You probably need to bump this formula manually"; then
    echo "Soft Fail${DRY_RUN}: Potentially manual PR required"
    exit 0
  fi
  if has_substring "$err" "Duplicate PRs should not be opened."; then
    echo "Soft Fail${DRY_RUN}: Duplicate PR found"
    exit 0
  fi
  echo "Hard Fail${DRY_RUN}:"
  exit 1
fi
