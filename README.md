# GitHub PR Link Copier

A lightweight browser extension for Chrome and Firefox that adds a "Copy PR Link" button on GitHub Pull Request pages.  
When clicked, it copies a markdown-formatted link containing:

- Repository name (`owner/repo`)
- Pull Request title
- Number of lines changed (diffstat)
- Link to the PR

Example output:

```markdown
[user/repo-name: PR Title](https://github.com/user/repo-name/pull/338) — 4 files — `+156 −108`
```

Which renders as:

[user/repo-name: PR Title](https://github.com/user/repo-name/pull/338) — 4 files — `+156 −108`

## Features

- Simple, one-click copy
- Markdown-friendly format
- No tracking, no external requests
- Works on all GitHub PR pages

## Permissions

- `clipboardWrite`: To copy text to clipboard when button is clicked.
- `activeTab`: To operate only on GitHub PR pages.

## Privacy

This extension does not collect, store, or transmit any user data.

## Installation

- [Chrome Web Store (coming soon)]()
- [Firefox Add-ons](https://github.com/krzysztofkusmierczyk/github-pr-link)

## License

MIT
