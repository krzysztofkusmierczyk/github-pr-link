// Button ID to prevent duplicates
const BUTTON_ID = 'github-pr-link-copier-btn';

// Utility: wait until element appears
function waitForSelector(selector, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const interval = 100;
    let elapsed = 0;

    const check = () => {
      const el = document.querySelector(selector);
      if (el) resolve(el);
      else if ((elapsed += interval) >= timeout) reject();
      else setTimeout(check, interval);
    };

    check();
  });
}

// Find the copy branch name button and its container
async function findContainer() {
  console.log('GitHub PR Link Copier: Searching for copy branch button container...');
  
  // First, try to find the copy branch name button (the one with octicon-copy)
  // Look for button with aria-label containing "Copy head branch" or similar
  const copyBranchSelectors = [
    'button[aria-labelledby*="cn2hd"]', // Specific ID pattern from the HTML
    'svg.octicon-copy', // Copy icon SVG
  ];

  let copyButton = null;
  for (const selector of copyBranchSelectors) {
    try {
      const element = await waitForSelector(selector, 1000);
      if (element && document.contains(element)) {
        // If we found the SVG, find its parent button
        if (element.tagName === 'SVG') {
          copyButton = element.closest('button[data-component="IconButton"]');
        } else {
          copyButton = element.closest('button');
        }
        
        if (copyButton) {
          console.log(`GitHub PR Link Copier: Found copy branch button with selector: ${selector}`);
          break;
        }
      }
    } catch (e) {
      continue;
    }
  }
  
  // Alternative: search all IconButtons for one with copy icon
  if (!copyButton) {
    try {
      const allIconButtons = document.querySelectorAll('button[data-component="IconButton"]');
      for (const btn of allIconButtons) {
        const copyIcon = btn.querySelector('svg.octicon-copy');
        if (copyIcon) {
          copyButton = btn;
          console.log('GitHub PR Link Copier: Found copy branch button by searching IconButtons');
          break;
        }
      }
    } catch (e) {
      // Continue to fallback
    }
  }

  // If we found the copy button, find its parent container
  if (copyButton) {
    // Look for the parent container div with flex classes
    const container = copyButton.closest('.d-flex.flex-items-center.overflow-hidden') ||
                      copyButton.parentElement;
    
    if (container && document.contains(container)) {
      console.log('GitHub PR Link Copier: Found container via copy branch button');
      return { container, insertAfter: copyButton };
    }
  }

  // Fallback: try to find the container directly
  const containerSelectors = [
    '.d-flex.flex-items-center.overflow-hidden', // Direct container
    '.prc-PageHeader-Description-w-ejP', // Page header description
    '.PullRequestHeaderSummary-module__summaryContainer__it2THio', // Summary container
  ];

  for (const selector of containerSelectors) {
    try {
      const el = await waitForSelector(selector, 2000);
      if (el && document.contains(el)) {
        console.log(`GitHub PR Link Copier: Found container with selector: ${selector}`);
        return { container: el, insertAfter: null };
      }
    } catch (e) {
      continue;
    }
  }

  // Legacy fallback for old GitHub UI
  const legacySelectors = [
    '.gh-header-actions',
    '.gh-header-actions > div',
    '.gh-header .gh-header-actions',
  ];

  for (const selector of legacySelectors) {
    try {
      const el = await waitForSelector(selector, 1000);
      if (el && document.contains(el)) {
        console.log(`GitHub PR Link Copier: Found legacy container: ${selector}`);
        return { container: el, insertAfter: null };
      }
    } catch (e) {
      continue;
    }
  }

  throw new Error('No suitable container found');
}

// Create the copy button
function createButton() {
  // Check if button already exists
  const existingBtn = document.getElementById(BUTTON_ID);
  if (existingBtn) {
    return null; // Button already exists
  }

  // Create button matching GitHub's new UI style (IconButton)
  const button = document.createElement('button');
  button.id = BUTTON_ID;
  button.type = 'button';
  button.setAttribute('data-component', 'IconButton');
  button.setAttribute('data-size', 'small');
  button.setAttribute('data-variant', 'invisible');
  button.setAttribute('data-no-visuals', 'true');
  button.className = 'prc-Button-ButtonBase-9n-Xk prc-Button-IconButton-fyge7';
  button.style.marginLeft = '4px';
  button.style.display = 'inline-flex';
  button.style.alignItems = 'center';
  
  // Create SVG icon (copy icon similar to GitHub's)
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  svg.setAttribute('class', 'octicon octicon-link');
  svg.setAttribute('viewBox', '0 0 16 16');
  svg.setAttribute('width', '16');
  svg.setAttribute('height', '16');
  svg.setAttribute('fill', 'currentColor');
  svg.setAttribute('display', 'inline-block');
  svg.setAttribute('overflow', 'visible');
  svg.setAttribute('style', 'vertical-align:text-bottom');
  
  // Link icon path
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', 'M7.775 3.275a.75.75 0 0 0 1.06 1.06l1.25-1.25a2 2 0 1 1 2.83 2.83l-2.5 2.5a2 2 0 0 1-2.83 0 .75.75 0 0 0-1.06 1.06 3.5 3.5 0 0 0 4.95 0l2.5-2.5a3.5 3.5 0 0 0-4.95-4.95l-1.25 1.25Zm-4.69 9.64a2 2 0 0 1 0-2.83l2.5-2.5a2 2 0 0 1 2.83 0 .75.75 0 0 0 1.06-1.06 3.5 3.5 0 0 0-4.95 0l-2.5 2.5a3.5 3.5 0 0 0 4.95 4.95l1.25-1.25a.75.75 0 0 0-1.06-1.06l-1.25 1.25a2 2 0 0 1-2.83 0Z');
  svg.appendChild(path);
  
  button.appendChild(svg);
  
  // Add tooltip/aria-label
  button.setAttribute('aria-label', 'Copy PR link');
  button.setAttribute('title', 'Copy PR link');

  button.onclick = () => {
    console.log('GitHub PR Link Copier: Extracting PR data...');
    
    // Get repo name from URL: https://github.com/{owner}/{repo}/pull/{number}
    const match = window.location.pathname.match(/^\/([^\/]+)\/([^\/]+)\/pull\/\d+/);
    const repoName = match ? `${match[1]}/${match[2]}` : null;
    console.log('Repo name:', repoName);

    // Try multiple selectors for PR title (new GitHub UI)
    const prTitleSelectors = [
      'h1[data-testid="pr-title"]',
      'h1.prc-PageHeader-Title-Title-9ZwDx',
      'h1[class*="Title"]',
      '.js-issue-title',
      'h1.b1',
      'h1.gh-header-title',
      'h1',
    ];
    
    let prTitle = null;
    for (const selector of prTitleSelectors) {
      const element = document.querySelector(selector);
      if (element) {
        prTitle = element.innerText?.trim() || element.textContent?.trim();
        if (prTitle) {
          console.log(`PR title found with selector: ${selector}`, prTitle);
          break;
        }
      }
    }

    const url = window.location.href;

    // Try multiple selectors for files changed count
    // Look in tabs, header, and various locations
    const filesChangedSelectors = [
      '#files_tab_counter',
      '[id*="files_tab_counter"]',
      '[id*="files_tab"]',
      '[data-testid="files-tab-counter"]',
      'a[href*="#files"] .Counter',
      'a[href*="#files"] [class*="Counter"]',
      'a[href*="#files"] span[class*="Counter"]',
      'button[data-testid="files-tab"] .Counter',
      'button[data-testid="files-tab"] [class*="Counter"]',
      '[role="tab"][aria-selected="true"] .Counter', // Active tab counter
      '[role="tablist"] [role="tab"] .Counter', // Any tab counter
      '[class*="UnderlineNav"] [class*="Counter"]', // UnderlineNav tabs
      'nav[aria-label*="pull request"] [class*="Counter"]', // Nav with counter
    ];
    
    let filesChanged = null;
    for (const selector of filesChangedSelectors) {
      const element = document.querySelector(selector);
      if (element) {
        const text = element.innerText?.trim() || element.textContent?.trim();
        // Make sure it's a number (files count)
        if (text && /^\d+/.test(text)) {
          filesChanged = text.match(/^\d+/)?.[0] || text;
          console.log(`Files changed found with selector: ${selector}`, filesChanged);
          break;
        }
      }
    }

    // Try multiple selectors for diffstat/changes (lines added/removed)
    // Look in header, tabs, and various locations
    const diffstatSelectors = [
      '.diffstat',
      '[class*="diffstat"]',
      '[class*="Diffstat"]',
      '.prc-PageHeader-Diffstat-Diffstat-9ZwDx',
      '[data-testid="diffstat"]',
      '[class*="PageHeader"][class*="Diffstat"]',
      // Try finding in tabs area
      '[role="tabpanel"] .diffstat',
      'a[href*="#files"] + .diffstat',
    ];
    
    let changes = null;
    for (const selector of diffstatSelectors) {
      try {
        const element = document.querySelector(selector);
        if (element) {
          const text = element.innerText?.trim() || element.textContent?.trim();
          // Check if it looks like a diffstat (contains + and - or −)
          if (text && (/\+.*[\s−-]/.test(text) || /\+.*−/.test(text))) {
            changes = text;
            console.log(`Changes found with selector: ${selector}`, changes);
            break;
          }
        }
      } catch (e) {
        continue;
      }
    }

    // If we didn't find diffstat with selectors, try searching for text patterns
    if (!changes) {
      console.log('GitHub PR Link Copier: Searching for diffstat via text patterns...');
      // Look for text that matches diffstat pattern: "+123 −45" or "+1,234 −567" or "+123 -45"
      // Search in likely locations first (header, tabs, etc.)
      const likelyContainers = document.querySelectorAll(
        '[class*="header"], [class*="tab"], [class*="diffstat"], [class*="PageHeader"], [class*="Summary"]'
      );
      
      for (const container of likelyContainers) {
        const text = container.innerText?.trim() || container.textContent?.trim();
        // Match pattern like "+123 −45" or "+1,234 −567" or "+123 -45"
        const diffstatMatch = text.match(/\+[\d,]+[\s−-]+[\d,]+/);
        if (diffstatMatch) {
          changes = diffstatMatch[0].replace(/\s+/g, ' ').trim();
          console.log('Changes found via text pattern search in container:', changes);
          break;
        }
      }
      
      // If still not found, search all visible text elements (more expensive)
      if (!changes) {
        const allTextElements = document.querySelectorAll('span, div, p, a, button');
        for (const el of allTextElements) {
          if (el.offsetParent === null) continue; // Skip hidden elements
          
          const text = el.innerText?.trim() || el.textContent?.trim();
          // Match pattern like "+123 −45" or "+1,234 −567"
          const diffstatMatch = text.match(/\+[\d,]+[\s−-]+[\d,]+/);
          if (diffstatMatch && text.length < 50) { // Likely to be just the diffstat
            changes = diffstatMatch[0].replace(/\s+/g, ' ').trim();
            console.log('Changes found via text pattern search:', changes);
            break;
          }
        }
      }
    }

    // Alternative: try to find files changed from tab text
    if (!filesChanged) {
      const tabLinks = document.querySelectorAll('a[href*="#files"], button[data-testid*="files"]');
      for (const tab of tabLinks) {
        const text = tab.innerText?.trim() || tab.textContent?.trim();
        // Look for pattern like "Files changed (11)" or "11 files"
        const match = text.match(/(\d+)\s*(?:files|file)/i) || text.match(/\((\d+)\)/);
        if (match) {
          filesChanged = match[1];
          console.log('Files changed found from tab text:', filesChanged);
          break;
        }
      }
    }

    // Log what we found
    console.log('Extracted data:', { repoName, prTitle, changes, filesChanged, url });

    // Build the formatted string - be more lenient with what we require
    if (prTitle && url) {
      let formatted = `[${repoName || 'repo'}: ${prTitle}](${url})`;
      
      if (filesChanged) {
        formatted += ` — ${filesChanged} files`;
      }
      
      if (changes) {
        formatted += ` — \`${changes}\``;
      }
      
      navigator.clipboard.writeText(formatted).then(() => {
        console.log('GitHub PR Link Copier: Copied to clipboard:', formatted);
        
        // Show brief feedback (similar to GitHub's tooltip)
        const originalTitle = button.getAttribute('title');
        button.setAttribute('title', 'Copied!');
        setTimeout(() => {
          button.setAttribute('title', originalTitle);
        }, 2000);
      }).catch(err => {
        console.error('GitHub PR Link Copier: Clipboard error', err);
        alert('Failed to copy to clipboard');
      });
    } else {
      console.error('GitHub PR Link Copier: Missing required data', {
        prTitle: !!prTitle,
        url: !!url
      });
      alert(`Could not extract PR data. Found: title=${!!prTitle}, url=${!!url}`);
    }
  };

  return button;
}

// Main logic to add button
async function addButton() {
  try {
    const result = await findContainer();
    const button = createButton();
    
    if (!button) {
      console.log('GitHub PR Link Copier: Button already exists');
      return;
    }
    
    if (!result || !result.container) {
      console.warn('GitHub PR Link Copier: Container found but invalid');
      return;
    }
    
    const { container, insertAfter } = result;
    
    // If we have a specific element to insert after, use insertAdjacentElement
    if (insertAfter && insertAfter.parentNode) {
      insertAfter.insertAdjacentElement('afterend', button);
      console.log('GitHub PR Link Copier: Button added after copy branch button');
    } else {
      // Otherwise append to container
      container.appendChild(button);
      console.log('GitHub PR Link Copier: Button added to container');
    }
  } catch (e) {
    console.warn('GitHub PR Link Copier: container not found, will retry', e);
    // Try a more aggressive fallback
    tryFallbackPlacement();
  }
}

// Aggressive fallback: try to find ANY suitable place in the PR header
function tryFallbackPlacement() {
  console.log('GitHub PR Link Copier: Trying fallback placement...');
  
  // First, try to find any copy button and place after it
  const copyButtons = document.querySelectorAll('button[data-component="IconButton"] svg.octicon-copy');
  for (const copyIcon of copyButtons) {
    const copyBtn = copyIcon.closest('button');
    if (copyBtn && copyBtn.parentElement) {
      const button = createButton();
      if (button) {
        copyBtn.insertAdjacentElement('afterend', button);
        console.log('GitHub PR Link Copier: Button added via fallback (after copy button)');
        return;
      }
    }
  }
  
  // Look for common GitHub PR header elements
  const possibleContainers = [
    document.querySelector('.prc-PageHeader-Description-w-ejP'),
    document.querySelector('.d-flex.flex-items-center.overflow-hidden'),
    document.querySelector('.gh-header'),
    document.querySelector('.gh-header-actions'),
    document.querySelector('[role="banner"]'),
  ].filter(el => el !== null);

  for (const container of possibleContainers) {
    try {
      const button = createButton();
      if (button && document.contains(container)) {
        container.appendChild(button);
        console.log('GitHub PR Link Copier: Button added via fallback');
        return;
      }
    } catch (e) {
      continue;
    }
  }
  
  console.warn('GitHub PR Link Copier: All placement attempts failed');
}

// Use MutationObserver to watch for DOM changes
function setupObserver() {
  let retryCount = 0;
  const MAX_RETRIES = 10; // Prevent infinite retries
  
  const observer = new MutationObserver((mutations) => {
    // Check if button exists, if not try to add it
    const existingBtn = document.getElementById(BUTTON_ID);
    if (!existingBtn && retryCount < MAX_RETRIES) {
      retryCount++;
      console.log(`GitHub PR Link Copier: DOM changed, attempting to add button (attempt ${retryCount})`);
      addButton();
    }
  });

  // Observe the entire document for changes
  if (document.body) {
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: false
    });
    console.log('GitHub PR Link Copier: MutationObserver set up');
  } else {
    console.warn('GitHub PR Link Copier: document.body not available for observer');
  }

  return observer;
}

// Initialize - wait for page to be ready
function init() {
  console.log('GitHub PR Link Copier: Initializing...');
  
  // Check if we're on a PR page
  if (!window.location.pathname.match(/\/pull\/\d+/)) {
    console.log('GitHub PR Link Copier: Not on a PR page, skipping');
    return;
  }

  // Try to add button immediately
  addButton();

  // Set up observer to handle dynamic changes
  if (document.body) {
    setupObserver();
  } else {
    // Wait for body if not ready
    document.addEventListener('DOMContentLoaded', () => {
      setupObserver();
    });
  }
}

// Run initialization
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Also retry on navigation (GitHub uses SPA)
let lastUrl = location.href;
setInterval(() => {
  const currentUrl = location.href;
  if (currentUrl !== lastUrl) {
    lastUrl = currentUrl;
    // Small delay to let GitHub's UI update
    setTimeout(() => {
      const existingBtn = document.getElementById(BUTTON_ID);
      if (!existingBtn) {
        addButton();
      }
    }, 1000);
  }
}, 500);
