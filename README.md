# CodingBot Chat Action

An AI-powered coding assistant GitHub Action that processes GitHub issues and creates PRs when tasks complete.

## Usage

```yaml
name: CodingBot Chat

on:
  issues:
    types: [opened]
  issue_comment:
    types: [created]

jobs:
  codingbot-chat:
    runs-on: ubuntu-latest
    permissions:
      issues: write
      contents: write
      pull-requests: write
    steps:
      - uses: davidkiss/codingbot-chat-action@v1.0.6
        with:
          model: google-genai:gemini-3-flash-preview
        env:
          GOOGLE_API_KEY: ${{ secrets.GOOGLE_API_KEY }}
```

## Inputs

| Input | Default | Description |
|-------|---------|-------------|
| model | google-genai:gemini-3-flash-preview | AI model to use |
| prompt-template | (built-in) | System prompt template |
| skills-path | ~/.agents/skills/ | Path to agent skills |
| skills | davidkiss/smart-ai-skills:reflection,brainstorming,task-breakdown,coding,subagent-task-execution | Semicolon-separated list of skills to install and use for the coding bot (format: package:skill1,skill2;package2:skill3) |
| github-token | secrets.GITHUB_TOKEN | GitHub token |

## Outputs

| Output | Description |
|--------|-------------|
| response-file | Path to generated response |
| pr-url | URL of created PR |

## License

MIT