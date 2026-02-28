# CodingBot Chat Action

An AI-powered coding assistant GitHub Action that processes GitHub issues and creates PRs when tasks complete.

## Usage
See below for an example of how to use the action in your workflow.

The action is triggered when an issue is opened or commented on, and the issue has a `codingbot` label.

```yaml
name: CodingBot Chat

on:
  issues:
    types: [opened]
  issue_comment:
    types: [created]

jobs:
  codingbot-chat:
    if: |
      (github.event_name == 'issues' && contains(github.event.issue.labels.*.name, 'codingbot')) ||
      (github.event_name == 'issue_comment' && contains(github.event.issue.labels.*.name, 'codingbot'))
    runs-on: ubuntu-latest
    permissions:
      issues: write
      contents: write
      pull-requests: write
    steps:
      - uses: davidkiss/codingbot-chat-action@v1.0.8
        with:
          model: google-genai:gemini-3-flash-preview
        env:
          GOOGLE_API_KEY: ${{ secrets.GOOGLE_API_KEY }}
```

## Inputs

| Input | Default | Description |
|-------|---------|-------------|
| model | google-genai:gemini-3-flash-preview | AI model to use in [LangChain format](https://docs.langchain.com/oss/javascript/integrations/providers/all_providers). Currently supported: google-genai, openai, anthropic and ollama |
| prompt-template | You're an expert AI coding assistant. Follow the steps below:\n\n1. Brainstorm task from user {user} and save the generated specs.\n2. Confirm tasks with user then save task breakdown and output it to the user.\n3. Confirm if user is ready to implement the changes.\n4. After user confirmed, implement the code changes based on the specs and task breakdown.\n5. Final output should be \<DONE\> if the code changes are completed | System prompt template |
| skills-path | ~/.agents/skills/ | Path to install agent skills at |
| skills | davidkiss/smart-ai-skills:reflection,brainstorming,task-breakdown,coding,subagent-task-execution | Semicolon-separated list of skills to install and use for the coding bot (format: package:skill1,skill2;package2:skill3) |
| github-token | secrets.GITHUB_TOKEN | GitHub token |

## Outputs

| Output | Description |
|--------|-------------|
| response-file | Path to generated response |
| pr-url | URL of created PR |

## License

MIT