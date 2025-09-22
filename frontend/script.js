// Fantasy Football Bracket Frontend
class FantasyBracketViewer {
    constructor() {
        this.matchups = [];
        this.teams = [];
        this.viewMode = 'bracket'; // 'bracket' or 'list'
        this.isLoading = false; // Prevent multiple simultaneous API calls
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        // Small delay to allow extension to inject cookies
        setTimeout(() => {
            this.fetchMatchupsWithRetry();
        }, 500);
    }

    // Setup event listeners
    setupEventListeners() {
        // Refresh button
        const refreshBtn = document.getElementById('refreshBtn');
        refreshBtn.addEventListener('click', () => {
            this.fetchMatchups();
        });

        // Toggle view button
        const toggleViewBtn = document.getElementById('toggleViewBtn');
        toggleViewBtn.addEventListener('click', () => {
            this.toggleView();
        });

        // Note: Removed automatic cookie update listener to prevent repeated API calls
    }

    // Get ESPN S2 cookie value from DOM
    getEspnS2Cookie() {
        // Try to get from data attribute first (injected by extension)
        const cookieValue = document.body.getAttribute('data-espn-cookie-espn_s2');
        if (cookieValue) {
            return cookieValue;
        }
        
        // Fallback: try to get from hidden element
        const cookieElement = document.getElementById('espn-cookie-espn_s2');
        if (cookieElement && cookieElement.textContent) {
            return cookieElement.textContent;
        }
        
        // Fallback: try to parse from document.cookie
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
            const [name, value] = cookie.trim().split('=');
            if (name === 'espn_s2' && value) {
                return decodeURIComponent(value);
            }
        }
        
        return null;
    }

    // Fetch matchups with retry mechanism for initial load
    async fetchMatchupsWithRetry(maxRetries = 5, delay = 1000) {
        if (this.isLoading) {
            console.log('API call already in progress, skipping...');
            return;
        }
        
        this.isLoading = true;
        this.updateStatus('Loading Matchups...', 'Please wait while we fetch the current fantasy football matchups');
        
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                // Get ESPN S2 cookie value
                const espnS2Cookie = this.getEspnS2Cookie();
                
                // Build API URL with query parameter
                let apiUrl = 'http://localhost:8001/v1/matchups';
                if (espnS2Cookie) {
                    apiUrl += `?espn_s2=${encodeURIComponent(espnS2Cookie)}`;
                    console.log('Using ESPN S2 cookie for API call');
                } else {
                    console.warn(`ESPN S2 cookie not found (attempt ${attempt}/${maxRetries}), making API call without authentication`);
                }
                
                const response = await fetch(apiUrl);
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const data = await response.json();
                console.log('Matchups data:', data);
                
                // Parse the data and display as bracket
                this.matchups = data.currentMatchups || [];
                this.teams = data.teams || [];
                
                if (this.matchups && this.matchups.length > 0) {
                    this.showBracket();
                } else {
                    this.showNoData();
                }
                
                // Success - exit retry loop
                this.isLoading = false;
                return;
                
            } catch (error) {
                console.error(`Error fetching matchups (attempt ${attempt}/${maxRetries}):`, error);
                
                if (attempt === maxRetries) {
                    // Final attempt failed
                    this.isLoading = false;
                    this.showNoData();
                    this.showNotification('Failed to fetch matchups. Please check if the API server is running.', 'error');
                } else {
                    // Wait before retrying
                    this.updateStatus(`Retrying... (${attempt}/${maxRetries})`, 'Waiting for ESPN cookie to be available');
                    this.showNotification(`Retrying API call (${attempt}/${maxRetries})...`, 'info');
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
        }
        
        // Ensure loading flag is reset even if we exit the loop
        this.isLoading = false;
    }

    // Fetch matchups from API (direct call for refresh button)
    async fetchMatchups() {
        if (this.isLoading) {
            console.log('API call already in progress, skipping...');
            return;
        }
        
        this.isLoading = true;
        this.updateStatus('Loading Matchups...', 'Please wait while we fetch the current fantasy football matchups');
        
        try {
            // Get ESPN S2 cookie value
            const espnS2Cookie = this.getEspnS2Cookie();
            
            // Build API URL with query parameter
            let apiUrl = 'http://localhost:8001/v1/matchups';
            if (espnS2Cookie) {
                apiUrl += `?espn_s2=${encodeURIComponent(espnS2Cookie)}`;
                console.log('Using ESPN S2 cookie for API call');
            } else {
                console.warn('ESPN S2 cookie not found, making API call without authentication');
            }
            
            const response = await fetch(apiUrl);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Matchups data:', data);
            
            // Parse the data and display as bracket
            this.matchups = data.currentMatchups || [];
            this.teams = data.teams || [];
            
            if (this.matchups && this.matchups.length > 0) {
                this.showBracket();
            } else {
                this.showNoData();
            }
        } catch (error) {
            console.error('Error fetching matchups:', error);
            this.showNoData();
            this.showNotification('Failed to fetch matchups. Please check if the API server is running.', 'error');
        } finally {
            this.isLoading = false;
        }
    }


    // Show bracket display
    showBracket() {
        const bracketSection = document.getElementById('bracketSection');
        const noDataSection = document.getElementById('noDataSection');
        
        bracketSection.style.display = 'block';
        noDataSection.style.display = 'none';
        
        // Render bracket based on view mode
        if (this.viewMode === 'bracket') {
            this.renderBracket();
        } else {
            this.renderList();
        }
        
        // Update status
        const matchupCount = this.matchups.length;
        const teamCount = this.teams.length;
        const espnS2Cookie = this.getEspnS2Cookie();
        const authStatus = espnS2Cookie ? 'with ESPN authentication' : 'without ESPN authentication';
        this.updateStatus(`${matchupCount} Matchup(s) Found`, `${teamCount} teams, ${matchupCount} current matchups loaded successfully ${authStatus}`);
    }

    // Show no data state
    showNoData() {
        const bracketSection = document.getElementById('bracketSection');
        const noDataSection = document.getElementById('noDataSection');
        
        bracketSection.style.display = 'none';
        noDataSection.style.display = 'block';
        
        // Update help text based on ESPN S2 cookie availability
        const espnS2Cookie = this.getEspnS2Cookie();
        const helpText = document.querySelector('.help-text');
        
        if (espnS2Cookie) {
            helpText.innerHTML = `
                <p><strong>Please try:</strong></p>
                <ul>
                    <li>Check if the API server is running on localhost:8001</li>
                    <li>Verify the API endpoint is accessible</li>
                    <li>Refresh the page to try again</li>
                </ul>
                <p style="margin-top: 15px; color: #4CAF50; font-weight: 600;">
                    <i class="fas fa-check-circle"></i> ESPN S2 cookie is available
                </p>
            `;
        } else {
            helpText.innerHTML = `
                <p><strong>Please try:</strong></p>
                <ul>
                    <li>Visit any ESPN website (espn.com) and log in</li>
                    <li>Check if the API server is running on localhost:8001</li>
                    <li>Refresh the page to try again</li>
                </ul>
                <p style="margin-top: 15px; color: #FF9800; font-weight: 600;">
                    <i class="fas fa-exclamation-triangle"></i> ESPN S2 cookie not found - authentication may be required
                </p>
            `;
        }
        
        // Update status
        this.updateStatus('No Matchups Found', 'Unable to fetch fantasy football matchups');
    }

    // Render bracket view
    renderBracket() {
        const bracketDisplay = document.getElementById('bracketDisplay');
        
        // Create bracket structure
        const bracketHtml = this.createBracketHTML();
        bracketDisplay.innerHTML = bracketHtml;
    }

    // Render list view
    renderList() {
        const bracketDisplay = document.getElementById('bracketDisplay');
        
        let listHtml = '<div class="matchup-list">';
        this.matchups.forEach((matchup, index) => {
            listHtml += this.createMatchupHTML(matchup, index);
        });
        listHtml += '</div>';
        
        bracketDisplay.innerHTML = listHtml;
    }

    // Create bracket HTML structure
    createBracketHTML() {
        if (this.matchups.length === 0) return '<div class="no-matchups">No matchups available</div>';
        
        // Sort matchups by round (if available) or create rounds
        const rounds = this.organizeMatchupsIntoRounds();
        
        let bracketHtml = '<div class="bracket">';
        
        rounds.forEach((round, roundIndex) => {
            bracketHtml += `<div class="round round-${roundIndex + 1}">`;
            bracketHtml += `<h3 class="round-title">${this.getRoundTitle(roundIndex, rounds.length)}</h3>`;
            bracketHtml += '<div class="matchups">';
            
            round.forEach((matchup, matchupIndex) => {
                bracketHtml += this.createMatchupHTML(matchup, matchupIndex);
            });
            
            bracketHtml += '</div>';
            bracketHtml += '</div>';
        });
        
        bracketHtml += '</div>';
        return bracketHtml;
    }

    // Organize matchups into rounds for bracket display
    organizeMatchupsIntoRounds() {
        const totalMatchups = this.matchups.length;
        const rounds = [];
        
        // For current matchups, we'll show them as the first round
        // and create placeholder rounds for the tournament progression
        let currentRound = [...this.matchups];
        rounds.push(currentRound);
        
        // Create subsequent rounds by halving the matchups
        while (currentRound.length > 1) {
            const nextRoundSize = Math.ceil(currentRound.length / 2);
            const nextRound = [];
            
            for (let i = 0; i < nextRoundSize; i++) {
                nextRound.push({
                    home: {
                        name: `Winner of Match ${i * 2 + 1}`,
                        points: 0,
                        owner: '',
                        id: `placeholder-${i * 2 + 1}`
                    },
                    away: {
                        name: `Winner of Match ${i * 2 + 2}`,
                        points: 0,
                        owner: '',
                        id: `placeholder-${i * 2 + 2}`
                    },
                    isPlaceholder: true
                });
            }
            
            rounds.push(nextRound);
            currentRound = nextRound;
        }
        
        return rounds;
    }

    // Get round title based on round index
    getRoundTitle(roundIndex, totalRounds) {
        const roundNames = [
            'First Round',
            'Second Round', 
            'Sweet 16',
            'Elite 8',
            'Final 4',
            'Championship'
        ];
        
        if (roundIndex < roundNames.length) {
            return roundNames[roundIndex];
        }
        
        return `Round ${roundIndex + 1}`;
    }

    // Create individual matchup HTML
    createMatchupHTML(matchup, index) {
        const homeTeam = matchup.home;
        const awayTeam = matchup.away;
        const homeScore = homeTeam.points || 0;
        const awayScore = awayTeam.points || 0;
        const isPlaceholder = matchup.isPlaceholder || false;
        
        // Determine winner based on points
        const homeWinner = homeScore > awayScore;
        const awayWinner = awayScore > homeScore;
        
        return `
            <div class="matchup ${isPlaceholder ? 'placeholder' : ''}" data-index="${index}">
                <div class="team team1 ${homeWinner ? 'winner' : ''}">
                    <span class="team-name">${homeTeam.name}</span>
                    <span class="score">${homeScore.toFixed(2)}</span>
                </div>
                <div class="vs">vs</div>
                <div class="team team2 ${awayWinner ? 'winner' : ''}">
                    <span class="team-name">${awayTeam.name}</span>
                    <span class="score">${awayScore.toFixed(2)}</span>
                </div>
                <div class="matchup-info">
                    <div class="owner-info">
                        <span class="owner">${homeTeam.owner || 'No Owner'}</span>
                        <span class="owner">${awayTeam.owner || 'No Owner'}</span>
                    </div>
                </div>
            </div>
        `;
    }

    // Toggle between bracket and list view
    toggleView() {
        this.viewMode = this.viewMode === 'bracket' ? 'list' : 'bracket';
        
        const toggleBtn = document.getElementById('toggleViewBtn');
        const icon = toggleBtn.querySelector('i');
        
        if (this.viewMode === 'bracket') {
            icon.className = 'fas fa-list';
            toggleBtn.innerHTML = '<i class="fas fa-list"></i> Toggle View';
            this.renderBracket();
        } else {
            icon.className = 'fas fa-eye';
            toggleBtn.innerHTML = '<i class="fas fa-eye"></i> Toggle View';
            this.renderList();
        }
        
        this.showNotification(`Switched to ${this.viewMode} view`, 'info');
    }

    // Update status display
    updateStatus(title, message) {
        document.getElementById('statusTitle').textContent = title;
        document.getElementById('statusMessage').textContent = message;
        
        // Update status icon based on ESPN S2 cookie availability
        const statusIcon = document.querySelector('.status-icon i');
        const espnS2Cookie = this.getEspnS2Cookie();
        
        if (espnS2Cookie) {
            statusIcon.className = 'fas fa-check-circle';
            statusIcon.style.color = '#4CAF50';
        } else {
            statusIcon.className = 'fas fa-exclamation-triangle';
            statusIcon.style.color = '#FF9800';
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
    window.fantasyBracketViewer = new FantasyBracketViewer();
});