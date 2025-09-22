// Content script for ESPN Cookie Viewer extension
// This script runs on all websites and injects configured cookie values into DOM

// Function to get cookies from the current page based on cookie list
function getCookiesFromPage() {
  const foundCookies = {};
  
  if (document.cookie) {
    const cookies = document.cookie.split(';');
    cookies.forEach(cookie => {
      const [name, value] = cookie.trim().split('=');
      if (name && value) {
        foundCookies[name] = {
          name: name,
          value: decodeURIComponent(value)
        };
      }
    });
  }
  
  return foundCookies;
}

// Function to inject cookies into DOM
function injectCookiesIntoDOM(cookies) {
  console.log('Injecting cookies into DOM:', cookies);
  
  // Remove existing cookie elements
  const existingElements = document.querySelectorAll('[id^="espn-cookie-"]');
  existingElements.forEach(el => el.remove());
  
  // Clear existing data attributes
  const dataAttributes = document.body.getAttributeNames().filter(name => name.startsWith('data-espn-cookie-'));
  dataAttributes.forEach(attr => document.body.removeAttribute(attr));
  
  // Inject each cookie
  Object.keys(cookies).forEach(cookieName => {
    const cookie = cookies[cookieName];
    if (cookie && cookie.value) {
      console.log(`Injecting cookie ${cookieName}:`, cookie.value);
      
      // Create element for each cookie
      const cookieElement = document.createElement('div');
      cookieElement.id = `espn-cookie-${cookieName}`;
      cookieElement.setAttribute(`data-espn-cookie-${cookieName}`, cookie.value);
      cookieElement.style.display = 'none'; // Hidden by default
      cookieElement.textContent = cookie.value;
      
      // Add to document head for easy access
      document.head.appendChild(cookieElement);
      
      // Also add to body as data attributes for easier access
      document.body.setAttribute(`data-espn-cookie-${cookieName}`, cookie.value);
      
      console.log(`Cookie ${cookieName} injected successfully`);
    }
  });
  
  // Dispatch custom event for other scripts to listen to
  const event = new CustomEvent('espnCookiesUpdated', {
    detail: { cookies: cookies }
  });
  document.dispatchEvent(event);
  
  console.log('All cookies injected and event dispatched');
}

// Function to send cookie data to background script and inject into DOM
function sendCookiesToBackground() {
  const allCookies = getCookiesFromPage();
  const url = window.location.href;
  
  // Get configured cookie list from background script
  chrome.runtime.sendMessage({action: 'getCookieList'}, (response) => {
    if (response && response.cookieList) {
      const filteredCookies = {};
      
      // Only include cookies that are in the configured list
      response.cookieList.forEach(cookieName => {
        if (allCookies[cookieName]) {
          filteredCookies[cookieName] = {
            name: allCookies[cookieName].name,
            value: allCookies[cookieName].value,
            domain: window.location.hostname,
            path: window.location.pathname
          };
        }
      });
      
      // Send to background script first
      chrome.runtime.sendMessage({
        action: 'updateCookies',
        cookies: filteredCookies,
        url: url
      });
      
      // Then get all cookies from background script (including cross-domain ones) and inject them
      getAndInjectCookiesFromBackground();
    }
  });
}

// Function to get cookies from background script and inject into DOM
function getAndInjectCookiesFromBackground() {
  chrome.runtime.sendMessage({action: 'injectCookies'}, (response) => {
    console.log('Received cookies from background script:', response);
    if (response && response.cookies) {
      injectCookiesIntoDOM(response.cookies);
    } else {
      console.log('No cookies received from background script');
      injectCookiesIntoDOM({});
    }
  });
}

// Only process cookies if we're on an ESPN page
if (window.location.hostname.includes('espn')) {
  // Send cookies when page loads
  sendCookiesToBackground();

  // Also try to get from background script (for cross-domain access)
  getAndInjectCookiesFromBackground();

  // Monitor for cookie changes only on ESPN pages
  let lastCookieString = document.cookie;

  // Check for cookie changes periodically (only on ESPN pages)
  setInterval(() => {
    if (document.cookie !== lastCookieString) {
      lastCookieString = document.cookie;
      sendCookiesToBackground();
    }
    // Also periodically check background script for updates
    getAndInjectCookiesFromBackground();
  }, 5000); // Increased interval to 5 seconds to reduce frequency
} else {
  // For non-ESPN pages, just get cookies from background script once
  getAndInjectCookiesFromBackground();
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getCookies') {
    const cookies = getCookiesFromPage();
    sendResponse({cookies: cookies, url: window.location.href});
  }
});
