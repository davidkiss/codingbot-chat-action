#!/bin/bash

set -e

ISSUE_NUMBER=$1
ISSUE_TITLE=$2

if [ -f bot_response.md ]; then
  if tail -n 1 bot_response.md | grep -q "<DONE>"; then
    rm -f chat_history.json bot_response.md .codingbot-package-lock.json

    echo "Coding completed. Creating Git Branch..."
    
    git config --global user.name "CodingBot"
    git config --global user.email "codingbot@users.noreply.github.com"
    
    BRANCH_NAME="codingbot/issue-${ISSUE_NUMBER}"
    
    if git rev-parse --verify "$BRANCH_NAME" >/dev/null 2>&1; then
      git checkout "$BRANCH_NAME"
    else
      git checkout -b "$BRANCH_NAME"
    fi

    git add .
    if ! git diff-index --quiet HEAD --; then
      git commit -m "CodingBot: ${ISSUE_TITLE}"
      git push origin "$BRANCH_NAME"
      
      echo "Creating Pull Request..."
      PR_URL=$(gh pr create --title "${ISSUE_TITLE}" --body "Implements changes for issue #${ISSUE_NUMBER}" || gh pr view --json url -q .url)
      gh issue comment "${ISSUE_NUMBER}" --body "Task completed! Pull Request created: $PR_URL"
      echo "pr-url=$PR_URL" >> $GITHUB_OUTPUT
    else
      echo "No changes to commit, but task marked as DONE."
      gh issue comment "${ISSUE_NUMBER}" --body "Task marked as completed, but no code changes were detected."
    fi
  else
    echo "Posting response to issue #${ISSUE_NUMBER}..."
    gh issue comment "${ISSUE_NUMBER}" --body-file bot_response.md
  fi
else
  echo "No bot response generated."
fi
