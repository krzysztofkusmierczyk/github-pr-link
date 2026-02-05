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
  // Approach 1: Wait for copy icon, then find button and container
  const copyIcon = await waitForSelector('svg.octicon-copy', 5000).catch(() => null);
  if (copyIcon) {
    const copyButton = copyIcon.closest('button[data-component="IconButton"]');
    if (copyButton) {
      // Walk up the DOM to find the flex container
      let container = copyButton.parentElement;
      while (container && container !== document.body) {
        const classes = container.className || '';
        if (typeof classes === 'string' && 
            classes.includes('d-flex') && 
            classes.includes('flex-items-center') && 
            classes.includes('overflow-hidden')) {
          if (document.contains(container)) {
            return { container, insertAfter: copyButton };
          }
        }
        container = container.parentElement;
      }
      
      // Fallback: use parent if we found the button
      if (copyButton.parentElement && document.contains(copyButton.parentElement)) {
        return { container: copyButton.parentElement, insertAfter: copyButton };
      }
    }
  }
  
  // Approach 2: Find container by waiting for it directly
  try {
    const container = await waitForSelector('div.d-flex.flex-items-center.overflow-hidden', 3000);
    if (container) {
      const copyBtn = container.querySelector('button[data-component="IconButton"] svg.octicon-copy')?.closest('button');
      if (copyBtn) {
        return { container, insertAfter: copyBtn };
      }
      return { container, insertAfter: null };
    }
  } catch (e) {
    // Continue to fallback
  }

  // Approach 3: Try immediate query (no wait)
  const container = document.querySelector('div.d-flex.flex-items-center.overflow-hidden') ||
                    document.querySelector('.gh-header-actions') ||
                    document.querySelector('.gh-header');
  
  if (container) {
    const copyBtn = container.querySelector('button[data-component="IconButton"] svg.octicon-copy')?.closest('button');
    if (copyBtn) {
      return { container, insertAfter: copyBtn };
    }
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
  // Use inline styles instead of random class names
  button.style.marginLeft = '4px';
  button.style.display = 'inline-flex';
  button.style.alignItems = 'center';
  button.style.background = 'none';
  button.style.border = 'none';
  button.style.padding = '4px';
  button.style.cursor = 'pointer';
  button.style.color = 'inherit';
  
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

    // Get PR title - use data-component attribute (stable) or fallback to class patterns
    let prTitle = null;
    const titleEl = document.querySelector('h1[data-component="PH_Title"]') ||
                    document.querySelector('h1[data-testid="pr-title"]') ||
                    document.querySelector('.js-issue-title') ||
                    document.querySelector('h1');
    
    if (titleEl) {
      // Get text from the title span, or fallback to entire h1 text
      const titleSpan = titleEl.querySelector('span[class*="Text"]') ||
                       titleEl.querySelector('span.markdown-title');
      prTitle = (titleSpan?.innerText || titleSpan?.textContent || titleEl.innerText || titleEl.textContent)?.trim();
      
      // Remove PR number if present (e.g., "Title #409" -> "Title")
      prTitle = prTitle?.replace(/\s*#\d+\s*$/, '').trim();
    }

    // Get files changed count from tab counter
    // Use stable ID selector first, then fallback to class patterns
    let filesChanged = null;
    
    const filesTab = document.querySelector('#prs-files-anchor-tab') ||
                     document.querySelector('a[href*="/changes"]');
    
    if (filesTab) {
      // Look for counter span with data-variant="secondary" (stable attribute)
      const counter = filesTab.querySelector('span[data-variant="secondary"]') ||
                     filesTab.querySelector('span[aria-hidden="true"][class*="Counter"]') ||
                     filesTab.querySelector('span[aria-hidden="true"]');
      
      if (counter) {
        filesChanged = counter.innerText?.trim() || counter.textContent?.trim();
        // Extract just the number if there's extra text
        const numMatch = filesChanged.match(/(\d+)/);
        if (numMatch) {
          filesChanged = numMatch[1];
        }
      }
    }
    
    // Fallback: try legacy selector
    if (!filesChanged) {
      const legacyCounter = document.querySelector('#files_tab_counter');
      if (legacyCounter) {
        filesChanged = legacyCounter.innerText?.trim() || legacyCounter.textContent?.trim();
      }
    }

    // Get diffstat (lines added/removed)
    // Look for the diffstat wrapper div, then find the addition/deletion spans
    let changes = null;
    
    // Try to find the diffstat wrapper by class pattern (random class name, but structure is consistent)
    const diffstatWrapper = document.querySelector('[class*="diffStatesWrapper"]') ||
                           document.querySelector('.diffstat') ||
                           document.querySelector('[class*="diffstat"]');
    
    if (diffstatWrapper) {
      // Look for spans with success (addition) and danger (deletion) colors
      const additionSpan = diffstatWrapper.querySelector('span.fgColor-success, span[class*="success"]');
      const deletionSpan = diffstatWrapper.querySelector('span.fgColor-danger, span[class*="danger"]');
      
      if (additionSpan && deletionSpan) {
        const additions = additionSpan.innerText?.trim() || additionSpan.textContent?.trim();
        const deletions = deletionSpan.innerText?.trim() || deletionSpan.textContent?.trim();
        
        if (additions && deletions) {
          // Format as "+123 −45"
          changes = `${additions} ${deletions}`;
        }
      }
      
      // Fallback: try sr-only text which has the format "Lines changed: 599 additions & 5 deletions"
      if (!changes) {
        const srOnly = diffstatWrapper.querySelector('.sr-only, [class*="VisuallyHidden"]');
        if (srOnly) {
          const text = srOnly.innerText || srOnly.textContent;
          const match = text.match(/(\d+)\s+additions?\s*&\s*(\d+)\s+deletions?/i);
          if (match) {
            changes = `+${match[1]} −${match[2]}`;
          }
        }
      }
    }
    
    // Fallback: search in header area for pattern like "+123 −45"
    if (!changes) {
      const header = document.querySelector('.gh-header') ||
                     document.querySelector('[role="banner"]') ||
                     document.querySelector('header');
      
      if (header) {
        const text = header.innerText || header.textContent;
        const match = text.match(/\+[\d,]+[\s−-]+[\d,]+/);
        if (match) {
          changes = match[0].replace(/\s+/g, ' ').trim();
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
  // Try to find copy button and place after it
  const copyIcon = document.querySelector('svg.octicon-copy');
  if (copyIcon) {
    const copyBtn = copyIcon.closest('button[data-component="IconButton"]') ||
                    copyIcon.closest('button');
    
    if (copyBtn?.parentElement) {
      const button = createButton();
      if (button) {
        copyBtn.insertAdjacentElement('afterend', button);
        return;
      }
    }
  }
  
  // Try to find container and append button
  const containers = [
    document.querySelector('.d-flex.flex-items-center.overflow-hidden'),
    document.querySelector('.gh-header-actions'),
    document.querySelector('.gh-header'),
    document.querySelector('[role="banner"]'),
    document.querySelector('header'),
  ].filter(el => el !== null);
  
  for (const container of containers) {
    const button = createButton();
    if (button && document.contains(container)) {
      container.appendChild(button);
      return;
    }
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

  // Try immediately, then retry after a short delay for dynamic content
  addButton();
  setTimeout(() => {
    const existingBtn = document.getElementById(BUTTON_ID);
    if (!existingBtn) {
      addButton();
    }
  }, 1000);

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
