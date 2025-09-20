// Background script for ESPN S2 Cookie Viewer extension
let currentEspnS2Cookie = null;

// Load espn_s2 cookie from storage when extension starts
loadEspnS2FromStorage();

// Function to save espn_s2 cookie to storage
function saveEspnS2ToStorage() {
  try {
    chrome.storage.local.set({
      espnS2Cookie: currentEspnS2Cookie
    }, () => {
      if (chrome.runtime.lastError) {
        console.error('Error saving espn_s2 to Chrome storage:', chrome.runtime.lastError);
      } else {
        console.log('espn_s2 cookie saved to Chrome storage');
      }
    });
  } catch (error) {
    console.error('Error saving espn_s2 cookie to storage:', error);
  }
}

// Function to load espn_s2 cookie from storage
function loadEspnS2FromStorage() {
  try {
    chrome.storage.local.get(['espnS2Cookie'], (result) => {
      if (result.espnS2Cookie) {
        currentEspnS2Cookie = result.espnS2Cookie;
        console.log('Loaded espn_s2 cookie from storage');
      }
    });
  } catch (error) {
    console.error('Error loading espn_s2 cookie from storage:', error);
  }
}

// Function to get espn_s2 cookie from ESPN domains
function getEspnS2FromEspnDomains() {
  const espnDomains = [
    'https://www.espn.com',
    'https://www.espn.co.uk',
    'https://www.espn.com.au',
    'https://www.espn.in',
    'https://www.espn.com.br',
    'https://www.espn.com.mx'
  ];
  
  // Try to get cookie from each ESPN domain
  espnDomains.forEach(domain => {
    chrome.cookies.get({
      url: domain,
      name: 'espn_s2'
    }, (cookie) => {
      if (cookie) {
        currentEspnS2Cookie = {
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
        console.log('espn_s2 cookie found from ESPN domain:', currentEspnS2Cookie);
        saveEspnS2ToStorage();
      }
    });
  });
}

// Listen for messages from content script and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'updateEspnS2') {
    if (request.cookie) {
      // Add timestamp and URL to cookie data
      currentEspnS2Cookie = {
        ...request.cookie,
        timestamp: new Date().toISOString(),
        url: request.url || 'unknown'
      };
      console.log('espn_s2 cookie updated:', currentEspnS2Cookie);
    } else {
      // If no cookie found on current page, try to get from ESPN domains
      getEspnS2FromEspnDomains();
    }
    
    // Save to storage
    saveEspnS2ToStorage();
    sendResponse({status: 'updated'});
  } else if (request.action === 'getEspnS2') {
    // If no cookie stored, try to get from ESPN domains
    if (!currentEspnS2Cookie) {
      getEspnS2FromEspnDomains();
    }
    sendResponse({cookie: currentEspnS2Cookie});
  } else if (request.action === 'injectEspnS2') {
    // Send espn_s2 cookie to content script for DOM injection
    sendResponse({cookie: currentEspnS2Cookie});
  }
});

// Monitor espn_s2 cookie changes specifically
chrome.cookies.onChanged.addListener((changeInfo) => {
  const cookie = changeInfo.cookie;
  if (cookie.name === 'espn_s2' && cookie.domain.includes('espn')) {
    currentEspnS2Cookie = {
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
    
    console.log('espn_s2 cookie changed:', currentEspnS2Cookie);
    saveEspnS2ToStorage();
  }
});
