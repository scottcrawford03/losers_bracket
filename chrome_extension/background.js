// Background script for ESPN Cookie Viewer extension
let currentCookies = {};
let cookieList = ['espn_s2']; // Default cookie list

// Load cookies and configuration from storage when extension starts
loadCookiesFromStorage();
loadCookieListFromStorage();

// Function to save cookies to storage
function saveCookiesToStorage() {
  try {
    chrome.storage.local.set({
      espnCookies: currentCookies
    }, () => {
      if (chrome.runtime.lastError) {
        console.error('Error saving cookies to Chrome storage:', chrome.runtime.lastError);
      } else {
        console.log('Cookies saved to Chrome storage');
      }
    });
  } catch (error) {
    console.error('Error saving cookies to storage:', error);
  }
}

// Function to load cookies from storage
function loadCookiesFromStorage() {
  try {
    chrome.storage.local.get(['espnCookies'], (result) => {
      if (result.espnCookies) {
        currentCookies = result.espnCookies;
        console.log('Loaded cookies from storage');
      }
    });
  } catch (error) {
    console.error('Error loading cookies from storage:', error);
  }
}

// Function to save cookie list configuration to storage
function saveCookieListToStorage() {
  try {
    chrome.storage.local.set({
      espnCookieList: cookieList
    }, () => {
      if (chrome.runtime.lastError) {
        console.error('Error saving cookie list to Chrome storage:', chrome.runtime.lastError);
      } else {
        console.log('Cookie list saved to Chrome storage');
      }
    });
  } catch (error) {
    console.error('Error saving cookie list to storage:', error);
  }
}

// Function to load cookie list configuration from storage
function loadCookieListFromStorage() {
  try {
    chrome.storage.local.get(['espnCookieList'], (result) => {
      if (result.espnCookieList) {
        cookieList = result.espnCookieList;
        console.log('Loaded cookie list from storage:', cookieList);
      }
    });
  } catch (error) {
    console.error('Error loading cookie list from storage:', error);
  }
}

// Function to get cookies from ESPN domains
function getCookiesFromEspnDomains() {
  const espnDomains = [
    'https://www.espn.com',
    'https://www.espn.co.uk',
    'https://www.espn.com.au',
    'https://www.espn.in',
    'https://www.espn.com.br',
    'https://www.espn.com.mx'
  ];
  
  // Try to get each cookie from ESPN domains
  cookieList.forEach(cookieName => {
    espnDomains.forEach(domain => {
      chrome.cookies.get({
        url: domain,
        name: cookieName
      }, (cookie) => {
        if (cookie) {
          currentCookies[cookieName] = {
            name: cookie.name,
            value: cookie.value,
            domain: cookie.domain,
            path: cookie.path,
            secure: cookie.secure,
            httpOnly: cookie.httpOnly,
            sameSite: cookie.sameSite,
            expirationDate: cookie.expirationDate,
            storeId: cookie.storeId,
            timestamp: new Date().toISOString(),
            url: domain
          };
          console.log(`${cookieName} cookie found from ESPN domain:`, currentCookies[cookieName]);
          saveCookiesToStorage();
        }
      });
    });
  });
}

// Listen for messages from content script and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'updateCookies') {
    if (request.cookies) {
      // Update cookies with timestamp and URL
      Object.keys(request.cookies).forEach(cookieName => {
        if (request.cookies[cookieName]) {
          currentCookies[cookieName] = {
            ...request.cookies[cookieName],
            timestamp: new Date().toISOString(),
            url: request.url || 'unknown'
          };
          console.log(`${cookieName} cookie updated:`, currentCookies[cookieName]);
        } else {
          // Remove cookie if it's null/undefined
          delete currentCookies[cookieName];
        }
      });
    } else {
      // If no cookies found on current page, try to get from ESPN domains
      getCookiesFromEspnDomains();
    }
    
    // Save to storage
    saveCookiesToStorage();
    
    // Also try to get additional cookies from ESPN domains if we don't have all configured cookies
    const configuredCookies = cookieList.filter(name => !currentCookies[name]);
    if (configuredCookies.length > 0) {
      console.log('Missing configured cookies, trying to get from ESPN domains:', configuredCookies);
      getCookiesFromEspnDomains();
    }
    
    sendResponse({status: 'updated'});
  } else if (request.action === 'getCookies') {
    // If no cookies stored, try to get from ESPN domains
    if (Object.keys(currentCookies).length === 0) {
      getCookiesFromEspnDomains();
    }
    sendResponse({cookies: currentCookies});
  } else if (request.action === 'injectCookies') {
    // Send cookies to content script for DOM injection
    console.log('Sending cookies for DOM injection:', currentCookies);
    sendResponse({cookies: currentCookies});
  } else if (request.action === 'getCookieList') {
    // Send current cookie list configuration
    sendResponse({cookieList: cookieList});
  } else if (request.action === 'updateCookieList') {
    // Update cookie list configuration
    cookieList = request.cookieList || ['espn_s2'];
    saveCookieListToStorage();
    console.log('Cookie list updated:', cookieList);
    sendResponse({status: 'updated'});
  }
});

// Monitor cookie changes for all configured cookies
chrome.cookies.onChanged.addListener((changeInfo) => {
  const cookie = changeInfo.cookie;
  if (cookieList.includes(cookie.name) && cookie.domain.includes('espn')) {
    currentCookies[cookie.name] = {
      name: cookie.name,
      value: cookie.value,
      domain: cookie.domain,
      path: cookie.path,
      secure: cookie.secure,
      httpOnly: cookie.httpOnly,
      sameSite: cookie.sameSite,
      expirationDate: cookie.expirationDate,
      storeId: cookie.storeId,
      changeType: changeInfo.cause,
      timestamp: new Date().toISOString()
    };
    
    console.log(`${cookie.name} cookie changed:`, currentCookies[cookie.name]);
    saveCookiesToStorage();
  }
});
