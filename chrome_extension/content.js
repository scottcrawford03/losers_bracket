// Content script for ESPN S2 Cookie Viewer extension
// This script runs on all websites and injects espn_s2 cookie value into DOM

// Function to get espn_s2 cookie from the current page
function getEspnS2Cookie() {
  if (document.cookie) {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'espn_s2' && value) {
        return {
          name: name,
          value: decodeURIComponent(value)
        };
      }
    }
  }
  return null;
}

// Function to inject espn_s2 cookie value into DOM
function injectEspnS2IntoDOM(cookieValue) {
  // Remove existing espn-s2-cookie element if it exists
  const existingElement = document.getElementById('espn-s2-cookie');
  if (existingElement) {
    existingElement.remove();
  }

  // Create new element with espn_s2 cookie value
  const espnS2Element = document.createElement('div');
  espnS2Element.id = 'espn-s2-cookie';
  espnS2Element.setAttribute('data-espn-s2-value', cookieValue || '');
  espnS2Element.style.display = 'none'; // Hidden by default
  espnS2Element.textContent = cookieValue || '';
  
  // Add to document head for easy access
  document.head.appendChild(espnS2Element);
  
  // Also add to body as a data attribute for easier access
  document.body.setAttribute('data-espn-s2-cookie', cookieValue || '');
  
  // Dispatch custom event for other scripts to listen to
  const event = new CustomEvent('espnS2CookieUpdated', {
    detail: { value: cookieValue || null }
  });
  document.dispatchEvent(event);
}

// Function to send espn_s2 cookie data to background script and inject into DOM
function sendEspnS2Cookie() {
  const espnS2Cookie = getEspnS2Cookie();
  const url = window.location.href;
  
  // Always inject into DOM, even if cookie is null
  injectEspnS2IntoDOM(espnS2Cookie ? espnS2Cookie.value : null);
  
  if (espnS2Cookie) {
    chrome.runtime.sendMessage({
      action: 'updateEspnS2',
      cookie: {
        name: espnS2Cookie.name,
        value: espnS2Cookie.value,
        domain: window.location.hostname,
        path: window.location.pathname
      },
      url: url
    });
  } else {
    // Send null to indicate no espn_s2 cookie found
    chrome.runtime.sendMessage({
      action: 'updateEspnS2',
      cookie: null,
      url: url
    });
  }
}

// Function to get espn_s2 cookie from background script and inject into DOM
function getAndInjectEspnS2FromBackground() {
  chrome.runtime.sendMessage({action: 'injectEspnS2'}, (response) => {
    if (response && response.cookie) {
      injectEspnS2IntoDOM(response.cookie.value);
    } else {
      injectEspnS2IntoDOM(null);
    }
  });
}

// Send espn_s2 cookie when page loads
sendEspnS2Cookie();

// Also try to get from background script (for cross-domain access)
getAndInjectEspnS2FromBackground();

// Monitor for cookie changes (limited capability in content script)
let lastCookieString = document.cookie;

// Check for cookie changes periodically
setInterval(() => {
  if (document.cookie !== lastCookieString) {
    lastCookieString = document.cookie;
    sendEspnS2Cookie();
  }
  // Also periodically check background script for updates
  getAndInjectEspnS2FromBackground();
}, 2000);

// Listen for storage events (cookies might change)
window.addEventListener('storage', (e) => {
  if (e.key === 'cookies' || e.key === null) {
    sendEspnS2Cookie();
    getAndInjectEspnS2FromBackground();
  }
});

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getEspnS2') {
    const espnS2Cookie = getEspnS2Cookie();
    sendResponse({cookie: espnS2Cookie, url: window.location.href});
  }
});
