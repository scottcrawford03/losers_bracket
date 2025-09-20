// Popup script for ESPN S2 Cookie Viewer extension
document.addEventListener('DOMContentLoaded', function() {
  const refreshBtn = document.getElementById('refreshBtn');
  const statusDiv = document.getElementById('status');
  const statusText = document.getElementById('statusText');
  const cookieDisplay = document.getElementById('cookieDisplay');
  const cookieValue = document.getElementById('cookieValue');
  const cookieInfo = document.getElementById('cookieInfo');

  // Update UI based on current espn_s2 cookie
  function updateUI() {
    chrome.runtime.sendMessage({action: 'getEspnS2'}, function(response) {
      if (response && response.cookie) {
        // Cookie found
        statusDiv.className = 'status has-cookie';
        statusText.textContent = 'ESPN S2 Cookie Found';
        
        cookieDisplay.style.display = 'block';
        cookieValue.textContent = response.cookie.value;
        
        // Format cookie info
        const info = [];
        if (response.cookie.domain) info.push(`Domain: ${response.cookie.domain}`);
        if (response.cookie.timestamp) {
          const date = new Date(response.cookie.timestamp);
          info.push(`Updated: ${date.toLocaleString()}`);
        }
        cookieInfo.textContent = info.join(' | ');
      } else {
        // No cookie found
        statusDiv.className = 'status no-cookie';
        statusText.textContent = 'No ESPN S2 Cookie Found';
        
        cookieDisplay.style.display = 'none';
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
    updateInterval = setInterval(updateUI, 2000); // Check every 2 seconds
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
