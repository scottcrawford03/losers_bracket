// Popup script for ESPN Cookie Viewer extension
document.addEventListener('DOMContentLoaded', function() {
  // Viewer tab elements
  const refreshBtn = document.getElementById('refreshBtn');
  const openEspnBtn = document.getElementById('openEspnBtn');
  const statusDiv = document.getElementById('status');
  const statusText = document.getElementById('statusText');
  const cookiesList = document.getElementById('cookiesList');
  
  // Config tab elements
  const cookieNameInput = document.getElementById('cookieNameInput');
  const addCookieBtn = document.getElementById('addCookieBtn');
  const cookieListConfig = document.getElementById('cookieListConfig');
  const saveConfigBtn = document.getElementById('saveConfigBtn');
  
  // Tab elements
  const tabs = document.querySelectorAll('.tab');
  const tabContents = document.querySelectorAll('.tab-content');
  
  let currentCookieList = ['espn_s2']; // Default cookie list

  // Tab switching functionality
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetTab = tab.getAttribute('data-tab');
      
      // Update tab states
      tabs.forEach(t => t.classList.remove('active'));
      tabContents.forEach(content => content.classList.remove('active'));
      
      tab.classList.add('active');
      document.getElementById(targetTab + 'Tab').classList.add('active');
      
      // Load config when switching to config tab
      if (targetTab === 'config') {
        loadCookieListConfig();
      }
    });
  });

  // Load cookie list configuration
  function loadCookieListConfig() {
    chrome.runtime.sendMessage({action: 'getCookieList'}, function(response) {
      if (response && response.cookieList) {
        currentCookieList = response.cookieList;
        renderCookieListConfig();
      }
    });
  }

  // Render cookie list configuration
  function renderCookieListConfig() {
    cookieListConfig.innerHTML = '';
    
    if (currentCookieList.length === 0) {
      cookieListConfig.innerHTML = '<div style="text-align: center; opacity: 0.6; font-size: 11px;">No cookies configured</div>';
      return;
    }
    
    currentCookieList.forEach(cookieName => {
      const item = document.createElement('div');
      item.className = 'cookie-list-item';
      item.innerHTML = `
        <span style="font-size: 11px;">${cookieName}</span>
        <button class="remove-btn" data-cookie="${cookieName}">Remove</button>
      `;
      cookieListConfig.appendChild(item);
    });
    
    // Add remove button event listeners
    cookieListConfig.querySelectorAll('.remove-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const cookieName = e.target.getAttribute('data-cookie');
        currentCookieList = currentCookieList.filter(name => name !== cookieName);
        renderCookieListConfig();
      });
    });
  }

  // Add cookie to list
  addCookieBtn.addEventListener('click', function() {
    const cookieName = cookieNameInput.value.trim();
    if (cookieName && !currentCookieList.includes(cookieName)) {
      currentCookieList.push(cookieName);
      cookieNameInput.value = '';
      renderCookieListConfig();
    }
  });

  // Save configuration
  saveConfigBtn.addEventListener('click', function() {
    chrome.runtime.sendMessage({
      action: 'updateCookieList',
      cookieList: currentCookieList
    }, function(response) {
      if (response && response.status === 'updated') {
        // Show success feedback
        const originalText = saveConfigBtn.innerHTML;
        saveConfigBtn.innerHTML = '<span class="icon">✅</span> Saved!';
        setTimeout(() => {
          saveConfigBtn.innerHTML = originalText;
        }, 2000);
      }
    });
  });

  // Open ESPN button
  openEspnBtn.addEventListener('click', function() {
    chrome.tabs.create({url: 'https://www.espn.com'});
  });

  // Update UI based on current cookies
  function updateUI() {
    chrome.runtime.sendMessage({action: 'getCookies'}, function(response) {
      if (response && response.cookies && Object.keys(response.cookies).length > 0) {
        // Cookies found
        statusDiv.className = 'status has-cookies';
        statusText.textContent = `${Object.keys(response.cookies).length} ESPN Cookie(s) Found`;
        
        // Render cookies list
        cookiesList.innerHTML = '';
        Object.keys(response.cookies).forEach(cookieName => {
          const cookie = response.cookies[cookieName];
          const item = document.createElement('div');
          item.className = 'cookie-item';
          item.innerHTML = `
            <div class="cookie-name">${cookieName}</div>
            <div class="cookie-value">${cookie.value}</div>
          `;
          cookiesList.appendChild(item);
        });
      } else {
        // No cookies found
        statusDiv.className = 'status no-cookies';
        statusText.textContent = 'No ESPN Cookies Found';
        
        cookiesList.innerHTML = '<div style="text-align: center; opacity: 0.6; font-size: 11px; padding: 20px;">No cookies found. Visit ESPN and refresh.</div>';
      }
    });
  }

  // Refresh button
  refreshBtn.addEventListener('click', function() {
    // Show loading state
    const originalText = refreshBtn.innerHTML;
    refreshBtn.innerHTML = '<span class="icon">⏳</span> Checking...';
    refreshBtn.disabled = true;
    
    // Update UI
    updateUI();
    
    // Reset button after a short delay
    setTimeout(() => {
      refreshBtn.innerHTML = originalText;
      refreshBtn.disabled = false;
    }, 1000);
  });

  // Periodic update to check for cookie changes
  let updateInterval;
  
  function startPeriodicUpdate() {
    updateInterval = setInterval(updateUI, 3000); // Check every 3 seconds
  }
  
  function stopPeriodicUpdate() {
    if (updateInterval) {
      clearInterval(updateInterval);
    }
  }

  // Start periodic updates
  startPeriodicUpdate();

  // Initial UI update
  updateUI();
});
