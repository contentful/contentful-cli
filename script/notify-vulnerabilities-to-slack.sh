#!/bin/bash

echo $(env)

SLACK_WEBHOOK="$1"

MESSAGE=$(
  cat <<HEREDOC
:boom: Scheduled audit build found vulnerabilities on the *$CIRCLE_PROJECT_REPONAME* repository
:arrow_right: Build url: $CIRCLE_BUILD_URL
HEREDOC
)

echo $MESSAGE

curl -X POST \
  -H 'Content-type: application/json' \
  $SLACK_WEBHOOK \
  --data "{\"text\": \"$MESSAGE\"}"
