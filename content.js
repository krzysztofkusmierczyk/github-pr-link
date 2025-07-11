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

// Main logic
async function addButton() {
  try {
    // Wait for PR toolbar
    const toolbar = await waitForSelector('.gh-header-actions');

    const button = document.createElement('button');
    button.innerText = '📋 Copy PR Link';
    button.style.marginLeft = '8px';
    button.className = 'btn btn-sm';  // GitHub-like style

    button.onclick = () => {
      const title = document.querySelector('.js-issue-title')?.innerText.trim();
      const changes = document.querySelector('.diffstat')?.innerText.trim();
      const url = window.location.href;

      // Get repo name from URL: https://github.com/{owner}/{repo}/pull/{number}
      const match = window.location.pathname.match(/^\/([^\/]+)\/([^\/]+)\/pull\/\d+/);
      const repoName = match ? `${match[1]}/${match[2]}` : null;

      if (title && changes) {
	const formatted = `[${repoName}: ${title}](${url}) — \`${changes}\``;
        navigator.clipboard.writeText(formatted);
      } else {
        alert('Could not extract PR data');
      }
    };

    toolbar.appendChild(button);
  } catch (e) {
    console.warn('GitHub PR Link Copier: toolbar not found');
  }
}

addButton();
