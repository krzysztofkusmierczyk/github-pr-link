# Testing Guide for GitHub PR Link Copier

This guide explains how to test the extension during development in both Firefox and Chrome browsers.

## Prerequisites

- A GitHub account with access to at least one repository with a Pull Request
- Firefox or Chrome browser installed
- The extension source code cloned locally

## Testing in Firefox

### Step 1: Enable Developer Mode

1. Open Firefox
2. Navigate to `about:debugging`
3. Click on **"This Firefox"** in the left sidebar (or **"This Nightly"** if using Firefox Nightly)

### Step 2: Load the Extension

1. Click the **"Load Temporary Add-on..."** button
2. Navigate to your project directory: `/Users/krzysztofkusmierczyk/proj/github-link-plugin`
3. Select the `manifest.json` file
4. The extension should now appear in the list with a green "Enabled" badge

### Step 3: Verify Installation

- The extension should appear in your list of temporary add-ons
- You should see the extension name: "GitHub PR Link Copier"
- Status should show as "Enabled"

### Step 4: Test the Extension

1. Navigate to any GitHub Pull Request page (e.g., `https://github.com/owner/repo/pull/123`)
2. Look for the **"📋 Copy PR Link"** button in the PR header area
3. Click the button
4. Paste the clipboard content (Ctrl+V / Cmd+V) to verify the formatted link was copied

### Step 5: Test Dynamic Updates

To test the MutationObserver and dynamic re-injection:

1. On a PR page, mark the PR as "Ready for review" (if it's a draft)
2. The button should remain visible after the UI updates
3. Navigate between different PRs using GitHub's navigation
4. The button should appear on each new PR page

### Step 6: Debugging

- Open the browser console (F12 or Cmd+Option+I)
- Look for any errors or warnings
- Check the console for debug messages from the extension
- Use Firefox's built-in debugger to inspect the extension code

### Step 7: Reload After Changes

When you make changes to the code:

1. Go back to `about:debugging`
2. Find your extension in the list
3. Click the **"Reload"** button (or remove and re-add it)
4. Refresh the GitHub PR page to see your changes

## Testing in Chrome / Chromium

### Step 1: Enable Developer Mode

1. Open Chrome or Chromium
2. Navigate to `chrome://extensions/` (or `edge://extensions/` for Edge)
3. Toggle **"Developer mode"** in the top-right corner (switch should be ON)

### Step 2: Load the Extension

1. Click the **"Load unpacked"** button
2. Navigate to your project directory: `/Users/krzysztofkusmierczyk/proj/github-link-plugin`
3. Select the folder and click **"Select Folder"** (or **"Open"**)
4. The extension should now appear in your extensions list

### Step 3: Verify Installation

- The extension should appear in your extensions list
- You should see the extension name: "GitHub PR Link Copier"
- Status should show as "Enabled"
- The extension icon should be visible (if icons are present)

### Step 4: Test the Extension

1. Navigate to any GitHub Pull Request page (e.g., `https://github.com/owner/repo/pull/123`)
2. Look for the **"📋 Copy PR Link"** button in the PR header area
3. Click the button
4. Paste the clipboard content (Ctrl+V / Cmd+V) to verify the formatted link was copied

### Step 5: Test Dynamic Updates

To test the MutationObserver and dynamic re-injection:

1. On a PR page, mark the PR as "Ready for review" (if it's a draft)
2. The button should remain visible after the UI updates
3. Navigate between different PRs using GitHub's navigation
4. The button should appear on each new PR page

### Step 6: Debugging

- Right-click on the extension icon → **"Inspect popup"** (if applicable)
- Open DevTools (F12 or Cmd+Option+I) on the GitHub page
- Go to the **Console** tab to see any errors or debug messages
- Use the **Sources** tab to set breakpoints in `content.js`
- Check the **Extensions** page for any error messages

### Step 7: Reload After Changes

When you make changes to the code:

1. Go back to `chrome://extensions/`
2. Find your extension in the list
3. Click the **reload icon** (circular arrow) on the extension card
4. Refresh the GitHub PR page to see your changes

## Testing Checklist

Use this checklist to ensure all functionality works correctly:

### Basic Functionality
- [ ] Extension loads without errors
- [ ] Button appears on PR pages
- [ ] Button has correct styling (GitHub-like appearance)
- [ ] Clicking button copies formatted link to clipboard
- [ ] Copied link format is correct: `[repo: title](url) — X files — \`+Y −Z\``

### Edge Cases
- [ ] Button appears on draft PRs
- [ ] Button appears on PRs ready for review
- [ ] Button persists after marking PR ready for review
- [ ] Button appears after navigating between PRs
- [ ] Button appears after page refresh
- [ ] Extension works on different GitHub repositories
- [ ] Extension handles PRs with no file changes gracefully

### Error Handling
- [ ] No console errors when PR data is missing
- [ ] Appropriate error message if clipboard access fails
- [ ] Extension doesn't break GitHub's UI

## Common Issues and Troubleshooting

### Button Not Appearing

**Symptoms:** Button doesn't show up on PR pages

**Solutions:**
1. Check browser console for errors
2. Verify the extension is enabled in `about:debugging` (Firefox) or `chrome://extensions/` (Chrome)
3. Ensure you're on a valid PR page URL (`/pull/` in the path)
4. Try reloading the extension and refreshing the page
5. Check if GitHub's UI structure has changed (selector might need updating)

### Button Disappears After UI Updates

**Symptoms:** Button shows initially but disappears when marking PR ready for review

**Solutions:**
1. Check if MutationObserver is working (should auto-re-add button)
2. Verify the button ID is unique (`github-pr-link-copier-btn`)
3. Check console for any errors during DOM mutations
4. Ensure the container selector still matches GitHub's current UI

### Clipboard Not Working

**Symptoms:** Button clicks but nothing is copied

**Solutions:**
1. Verify `clipboardWrite` permission is in `manifest.json`
2. Check browser console for permission errors
3. Ensure you're clicking the button (not just hovering)
4. Try manually copying text to verify clipboard works in your browser

### Extension Not Loading

**Symptoms:** Extension fails to load or shows errors

**Solutions:**
1. Verify `manifest.json` is valid JSON (use a JSON validator)
2. Check that all required files exist (`content.js`, `manifest.json`, icons)
3. Ensure manifest version matches browser requirements (v3 for modern browsers)
4. Check for syntax errors in `content.js`

## Development Tips

1. **Use Browser DevTools**: Always keep the console open to catch errors early
2. **Test on Multiple PRs**: Different PRs may have different UI states
3. **Test Navigation**: GitHub uses SPA navigation, test both direct navigation and in-app navigation
4. **Check Permissions**: Ensure all required permissions are in `manifest.json`
5. **Version Control**: Commit working versions before making major changes

## Quick Reference

### Firefox
- Debugging page: `about:debugging`
- Load extension: Click "Load Temporary Add-on" → Select `manifest.json`
- Reload: Click "Reload" button in extension list

### Chrome
- Extensions page: `chrome://extensions/`
- Load extension: Enable Developer mode → Click "Load unpacked" → Select folder
- Reload: Click reload icon on extension card

### Test URLs
- Use any GitHub PR: `https://github.com/[owner]/[repo]/pull/[number]`
- Example: `https://github.com/microsoft/vscode/pull/12345`
