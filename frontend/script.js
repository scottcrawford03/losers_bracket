// ESPN S2 Cookie Viewer Frontend
class EspnS2Viewer {
    constructor() {
        this.currentCookie = null;
        this.refreshInterval = null;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkForCookie();
        this.startAutoRefresh();
    }

    // Setup event listeners
    setupEventListeners() {
        // Refresh button
        const refreshBtn = document.getElementById('refreshBtn');
        refreshBtn.addEventListener('click', () => {
            this.checkForCookie();
        });

        // Copy button
        const copyBtn = document.getElementById('copyBtn');
        copyBtn.addEventListener('click', () => {
            this.copyCookieValue();
        });

        // Open ESPN button
        const openEspnBtn = document.getElementById('openEspnBtn');
        openEspnBtn.addEventListener('click', () => {
            window.open('https://www.espn.com', '_blank');
        });

        // Listen for cookie updates from the extension
        document.addEventListener('espnS2CookieUpdated', (event) => {
            this.handleCookieUpdate(event.detail.value);
            // console.log(this.httpGet('http://localhost:8001/v1/matchups?espn_s2=' + event.detail.value));
        });
    }

    httpGet(theUrl) {
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.open( "GET", theUrl, false ); // false for synchronous request
        xmlHttp.send( null );
        return xmlHttp.responseText;
    }

    // Check for ESPN S2 cookie in DOM
    checkForCookie() {
        this.updateStatus('Checking for ESPN S2 Cookie...', 'Please wait while we retrieve the cookie value');
        
        // Try to get cookie from DOM elements
        const espnS2Element = document.getElementById('espn-s2-cookie');
        const bodyDataAttribute = document.body.getAttribute('data-espn-s2-cookie');
        
        let cookieValue = null;
        
        if (espnS2Element) {
            cookieValue = espnS2Element.textContent || espnS2Element.getAttribute('data-espn-s2-value');
        } else if (bodyDataAttribute) {
            cookieValue = bodyDataAttribute;
        }

        
        
        if (cookieValue && cookieValue.trim() !== '') {
            this.handleCookieUpdate(cookieValue);
        } else {
            this.showNoCookie();
        }
    }

    // Handle cookie update
    handleCookieUpdate(cookieValue) {
        if (cookieValue && cookieValue.trim() !== '') {
            this.currentCookie = {
                value: cookieValue,
                domain: this.getCookieDomain(),
                timestamp: new Date().toISOString()
            };
            this.showCookie();
        } else {
            this.showNoCookie();
        }
    }

    // Get cookie domain from current page or ESPN
    getCookieDomain() {
        const hostname = window.location.hostname;
        if (hostname.includes('espn')) {
            return hostname;
        }
        return 'espn.com (cross-domain)';
    }

    // Show cookie display
    showCookie() {
        const cookieSection = document.getElementById('cookieSection');
        const noCookieSection = document.getElementById('noCookieSection');
        
        cookieSection.style.display = 'block';
        noCookieSection.style.display = 'none';
        
        // Update cookie value
        document.getElementById('cookieValue').textContent = this.currentCookie.value;
        document.getElementById('cookieDomain').textContent = this.currentCookie.domain;
        document.getElementById('lastUpdated').textContent = new Date(this.currentCookie.timestamp).toLocaleString();
        document.getElementById('cookieLength').textContent = this.currentCookie.value.length + ' characters';
        
        // Update status
        this.updateStatus('ESPN S2 Cookie Found', 'Cookie value is available');
    }

    // Show no cookie state
    showNoCookie() {
        const cookieSection = document.getElementById('cookieSection');
        const noCookieSection = document.getElementById('noCookieSection');
        
        cookieSection.style.display = 'none';
        noCookieSection.style.display = 'block';
        
        // Update status
        this.updateStatus('No ESPN S2 Cookie Found', 'The cookie is not available in your browser');
    }

    // Update status display
    updateStatus(title, message) {
        document.getElementById('statusTitle').textContent = title;
        document.getElementById('statusMessage').textContent = message;
    }

    // Copy cookie value to clipboard
    async copyCookieValue() {
        if (!this.currentCookie) return;

        try {
            await navigator.clipboard.writeText(this.currentCookie.value);
            this.showNotification('Cookie value copied to clipboard!', 'success');
        } catch (error) {
            console.error('Failed to copy:', error);
            this.showNotification('Failed to copy cookie value', 'error');
        }
    }

    // Start auto-refresh
    startAutoRefresh() {
        // Check for cookie every 3 seconds
        this.refreshInterval = setInterval(() => {
            this.checkForCookie();
        }, 60000);
    }

    // Stop auto-refresh
    stopAutoRefresh() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
        }
    }

    // Show notification
    showNotification(message, type = 'info') {
        const notification = document.getElementById('notification');
        const notificationText = document.getElementById('notificationText');
        
        notificationText.textContent = message;
        notification.className = `notification ${type} show`;
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }
}

// Initialize viewer when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.espnS2Viewer = new EspnS2Viewer();
});

