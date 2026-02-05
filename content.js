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
  // Find copy branch button by looking for IconButton with copy icon
  const copyIcon = await waitForSelector('svg.octicon-copy', 2000).catch(() => null);
  const copyButton = copyIcon?.closest('button[data-component="IconButton"]');

  if (copyButton) {
    const container = copyButton.closest('.d-flex.flex-items-center.overflow-hidden') ||
                      copyButton.parentElement;
    if (container && document.contains(container)) {
      return { container, insertAfter: copyButton };
    }
  }

  // Fallback: find container directly
  const container = await waitForSelector('.d-flex.flex-items-center.overflow-hidden', 2000)
    .catch(() => document.querySelector('.gh-header-actions'));
  
  if (container && document.contains(container)) {
    return { container, insertAfter: null };
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
    // Get repo name from URL
    const match = window.location.pathname.match(/^\/([^\/]+)\/([^\/]+)\/pull\/\d+/);
    const repoName = match ? `${match[1]}/${match[2]}` : null;

    // Get PR title - try multiple selectors
    const prTitleSelectors = [
      'h1[data-testid="pr-title"]',
      '.js-issue-title',
      'h1.b1',
      'h1.gh-header-title',
      'h1[class*="Title"]',
      'h1',
    ];
    
    let prTitle = null;
    for (const selector of prTitleSelectors) {
      const el = document.querySelector(selector);
      if (el) {
        prTitle = el.innerText?.trim() || el.textContent?.trim();
        if (prTitle) break;
      }
    }

    // Get files changed count from tab counter
    const filesCounterSelectors = [
      '#files_tab_counter',
      'a[href*="#files"] .Counter',
      'button[data-testid*="files"] .Counter',
      '[role="tab"] a[href*="#files"] .Counter',
    ];
    
    let filesChanged = null;
    for (const selector of filesCounterSelectors) {
      const el = document.querySelector(selector);
      if (el) {
        filesChanged = el.innerText?.trim() || el.textContent?.trim();
        if (filesChanged) break;
      }
    }

    // Get diffstat (lines added/removed)
    const diffstatSelectors = [
      '.diffstat',
      '[class*="diffstat"]',
      '[class*="Diffstat"]',
    ];
    
    let changes = null;
    for (const selector of diffstatSelectors) {
      const el = document.querySelector(selector);
      if (el) {
        const text = el.innerText?.trim() || el.textContent?.trim();
        if (text && /\+.*[\s−-]/.test(text)) {
          changes = text;
          break;
        }
      }
    }

    const url = window.location.href;

    // Build formatted string - require at least URL
    if (url) {
      let formatted = prTitle 
        ? `[${repoName || 'repo'}: ${prTitle}](${url})`
        : `[${repoName || 'repo'}](${url})`;
      
      if (filesChanged) {
        formatted += ` — ${filesChanged} files`;
      }
      
      if (changes) {
        formatted += ` — \`${changes}\``;
      }
      
      navigator.clipboard.writeText(formatted).then(() => {
        // Show brief feedback
        const originalTitle = button.getAttribute('title');
        button.setAttribute('title', 'Copied!');
        setTimeout(() => {
          button.setAttribute('title', originalTitle);
        }, 2000);
      }).catch(() => {
        alert('Failed to copy to clipboard');
      });
    } else {
      alert('Could not extract PR data');
    }
  };

  return button;
}

// Main logic to add button
async function addButton() {
  try {
    const result = await findContainer();
    const button = createButton();
    
    if (!button || !result?.container) {
      return;
    }
    
    const { container, insertAfter } = result;
    
    if (insertAfter?.parentNode) {
      insertAfter.insertAdjacentElement('afterend', button);
    } else {
      container.appendChild(button);
    }
  } catch (e) {
    tryFallbackPlacement();
  }
}

// Fallback placement
function tryFallbackPlacement() {
  const copyIcon = document.querySelector('button[data-component="IconButton"] svg.octicon-copy');
  const copyBtn = copyIcon?.closest('button');
  
  if (copyBtn?.parentElement) {
    const button = createButton();
    if (button) {
      copyBtn.insertAdjacentElement('afterend', button);
      return;
    }
  }
  
  const container = document.querySelector('.gh-header-actions') ||
                    document.querySelector('.gh-header');
  const button = createButton();
  if (button && container) {
    container.appendChild(button);
  }
}

// Use MutationObserver to watch for DOM changes
function setupObserver() {
  let retryCount = 0;
  const MAX_RETRIES = 10;
  
  const observer = new MutationObserver(() => {
    const existingBtn = document.getElementById(BUTTON_ID);
    if (!existingBtn && retryCount < MAX_RETRIES) {
      retryCount++;
      addButton();
    }
  });

  if (document.body) {
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: false
    });
  }

  return observer;
}

// Initialize
function init() {
  if (!window.location.pathname.match(/\/pull\/\d+/)) {
    return;
  }

  addButton();

  if (document.body) {
    setupObserver();
  } else {
    document.addEventListener('DOMContentLoaded', setupObserver);
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
