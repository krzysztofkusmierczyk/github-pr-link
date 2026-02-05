# Quick Start Guide

Quick reference for loading and testing the extension during development.

## Firefox

1. Open `about:debugging`
2. Click **"This Firefox"**
3. Click **"Load Temporary Add-on..."**
4. Select `manifest.json` from project root
5. Navigate to any GitHub PR page
6. Look for **"📋 Copy PR Link"** button

**Reload:** Click "Reload" button in `about:debugging` after code changes

## Chrome

1. Open `chrome://extensions/`
2. Enable **"Developer mode"** (top-right toggle)
3. Click **"Load unpacked"**
4. Select the project folder
5. Navigate to any GitHub PR page
6. Look for **"📋 Copy PR Link"** button

**Reload:** Click reload icon on extension card after code changes

## Testing Checklist

- [ ] Button appears on PR page
- [ ] Button copies formatted link when clicked
- [ ] Button persists after marking PR ready for review
- [ ] Button appears after navigating between PRs

## Debugging

- **Firefox:** Open console (F12) on GitHub page
- **Chrome:** Open DevTools (F12) → Console tab
- Check for errors related to selectors or permissions

## Common Issues

**Button not appearing?**
- Check console for errors
- Verify extension is enabled
- Ensure you're on a PR page (`/pull/` in URL)
- Reload extension and refresh page

**Button disappears?**
- Should auto-reappear via MutationObserver
- Check console for errors
- Verify selectors match GitHub's current UI

For detailed information, see [testing.md](./testing.md).
