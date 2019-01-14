#!/bin/bash
set -euo pipefail

applicationName=$1
publishedArtifact=$2

payload=$(
cat <<EOM
{
    "attachments": [
        {
            "fallback": "$applicationName has a new release available to deploy.",
            "color": "#33CC66",
            "pretext": "$applicationName has a new release available to deploy.",
            "title": "$CIRCLE_PROJECT_REPONAME",
            "title_link": "https://circleci.com/workflow-run/$CIRCLE_WORKFLOW_WORKSPACE_ID",
            "text": "$publishedArtifact",
            "ts": $(date '+%s')
        }
    ]
}
EOM
)

curl -X POST --data-urlencode payload="$payload" "$SLACK_WEBHOOK_URL"
