// Fantasy Football Losers Bracket Frontend
class FantasyLosersBracketViewer {
    constructor() {
        this.teams = [];
        this.winnersBracket = [];
        this.losersBracket = [];
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
        this.updateStatus('Loading Losers Bracket...', 'Please wait while we fetch the current elimination matchups');
        
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                // Get ESPN S2 cookie value
                const espnS2Cookie = this.getEspnS2Cookie();
                
                // Build API URL with query parameter
                let apiUrl = 'http://localhost:8001/v1/teams';
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
                console.log('API Response data:', data);
                
                // Parse the data and display as bracket
                this.teams = data.teams || [];
                console.log('Teams data:', this.teams);
                
                if (this.teams && this.teams.length > 0) {
                    this.createBrackets();
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
        this.updateStatus('Loading Losers Bracket...', 'Please wait while we fetch the current elimination matchups');
        
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
            console.log('API Response data:', data);
            
            // Parse the data and display as bracket
            this.teams = data.teams || [];
            console.log('Teams data:', this.teams);
            
            if (this.teams && this.teams.length > 0) {
                this.createBrackets();
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

    // Create winners and losers brackets from teams data
    createBrackets() {
        // Sort teams by playoff seed
        const sortedTeams = [...this.teams].sort((a, b) => (a.playoffSeed || 999) - (b.playoffSeed || 999));
        
        // Create winners bracket (seeds 1-6)
        this.winnersBracket = this.createWinnersBracket(sortedTeams);
        
        // Create losers bracket (seeds 7-12)
        this.losersBracket = this.createLosersBracket(sortedTeams);
    }

    // Create winners bracket matchups
    createWinnersBracket(teams) {
        const winnersTeams = teams.filter(team => team.playoffSeed >= 1 && team.playoffSeed <= 6);
        const matchups = [];
        
        // Seeds 1 and 2 get byes
        const seed1 = winnersTeams.find(team => team.playoffSeed === 1);
        const seed2 = winnersTeams.find(team => team.playoffSeed === 2);
        
        if (seed1) {
            matchups.push({
                home: seed1,
                away: { name: 'BYE', owner: 'Automatic Advance', currentScore: 0, playoffSeed: '', id: 'bye-1' },
                isBye: true,
                bracketType: 'winners'
            });
        }
        
        if (seed2) {
            matchups.push({
                home: seed2,
                away: { name: 'BYE', owner: 'Automatic Advance', currentScore: 0, playoffSeed: '', id: 'bye-2' },
                isBye: true,
                bracketType: 'winners'
            });
        }
        
        // Seeds 3v6 and 4v5
        const seed3 = winnersTeams.find(team => team.playoffSeed === 3);
        const seed6 = winnersTeams.find(team => team.playoffSeed === 6);
        const seed4 = winnersTeams.find(team => team.playoffSeed === 4);
        const seed5 = winnersTeams.find(team => team.playoffSeed === 5);
        
        if (seed3 && seed6) {
            matchups.push({
                home: seed3,
                away: seed6,
                isBye: false,
                bracketType: 'winners'
            });
        }
        
        if (seed4 && seed5) {
            matchups.push({
                home: seed4,
                away: seed5,
                isBye: false,
                bracketType: 'winners'
            });
        }
        
        return matchups;
    }

    // Create losers bracket matchups
    createLosersBracket(teams) {
        const losersTeams = teams.filter(team => team.playoffSeed >= 7 && team.playoffSeed <= 12);
        const matchups = [];
        
        // Seeds 11 and 12 get byes
        const seed11 = losersTeams.find(team => team.playoffSeed === 11);
        const seed12 = losersTeams.find(team => team.playoffSeed === 12);
        
        if (seed11) {
            matchups.push({
                home: seed11,
                away: { name: 'BYE', owner: 'Automatic Advance', currentScore: 0, playoffSeed: '', id: 'bye-11' },
                isBye: true,
                bracketType: 'losers'
            });
        }
        
        if (seed12) {
            matchups.push({
                home: seed12,
                away: { name: 'BYE', owner: 'Automatic Advance', currentScore: 0, playoffSeed: '', id: 'bye-12' },
                isBye: true,
                bracketType: 'losers'
            });
        }
        
        // Seeds 10v7 and 9v8
        const seed10 = losersTeams.find(team => team.playoffSeed === 10);
        const seed7 = losersTeams.find(team => team.playoffSeed === 7);
        const seed9 = losersTeams.find(team => team.playoffSeed === 9);
        const seed8 = losersTeams.find(team => team.playoffSeed === 8);
        
        if (seed10 && seed7) {
            matchups.push({
                home: seed10,
                away: seed7,
                isBye: false,
                bracketType: 'losers'
            });
        }
        
        if (seed9 && seed8) {
            matchups.push({
                home: seed9,
                away: seed8,
                isBye: false,
                bracketType: 'losers'
            });
        }
        
        return matchups;
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
        const winnersCount = this.winnersBracket.length;
        const losersCount = this.losersBracket.length;
        const teamCount = this.teams.length;
        const espnS2Cookie = this.getEspnS2Cookie();
        const authStatus = espnS2Cookie ? 'with ESPN authentication' : 'without ESPN authentication';
        this.updateStatus(`${winnersCount + losersCount} Playoff Matchups Found`, `${teamCount} teams, ${winnersCount} winners bracket, ${losersCount} losers bracket matchups loaded successfully ${authStatus}`);
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
        this.updateStatus('No Losers Bracket Found', 'Unable to fetch losers bracket tournament matchups');
    }

    // Render bracket view
    renderBracket() {
        const bracketDisplay = document.getElementById('bracketDisplay');
        
        // Create bracket structure with both winners and losers brackets
        const bracketHtml = this.createDualBracketHTML();
        bracketDisplay.innerHTML = bracketHtml;
    }

    // Render list view
    renderList() {
        const bracketDisplay = document.getElementById('bracketDisplay');
        
        let listHtml = '<div class="brackets-container">';
        
        // Winners bracket
        listHtml += '<div class="bracket-section">';
        listHtml += '<h2 class="bracket-title winners-title">Winners Bracket</h2>';
        listHtml += '<div class="matchup-list">';
        this.winnersBracket.forEach((matchup, index) => {
            listHtml += this.createMatchupHTML(matchup, index);
        });
        listHtml += '</div>';
        listHtml += '</div>';
        
        // Losers bracket
        listHtml += '<div class="bracket-section">';
        listHtml += '<h2 class="bracket-title losers-title">Losers Bracket</h2>';
        listHtml += '<div class="matchup-list">';
        this.losersBracket.forEach((matchup, index) => {
            listHtml += this.createMatchupHTML(matchup, index);
        });
        listHtml += '</div>';
        listHtml += '</div>';
        
        listHtml += '</div>';
        
        bracketDisplay.innerHTML = listHtml;
    }

    // Create dual bracket HTML structure
    createDualBracketHTML() {
        if (this.winnersBracket.length === 0 && this.losersBracket.length === 0) {
            return '<div class="no-matchups">No matchups available</div>';
        }
        
        let bracketHtml = '<div class="brackets-container">';
        
        // Winners bracket
        if (this.winnersBracket.length > 0) {
            bracketHtml += '<div class="bracket-section">';
            bracketHtml += '<h2 class="bracket-title winners-title">Winners Bracket</h2>';
            bracketHtml += '<div class="matchup-list">';
            this.winnersBracket.forEach((matchup, index) => {
                bracketHtml += this.createMatchupHTML(matchup, index);
            });
            bracketHtml += '</div>';
            bracketHtml += '</div>';
        }
        
        // Losers bracket
        if (this.losersBracket.length > 0) {
            bracketHtml += '<div class="bracket-section">';
            bracketHtml += '<h2 class="bracket-title losers-title">Losers Bracket</h2>';
            bracketHtml += '<div class="matchup-list">';
            this.losersBracket.forEach((matchup, index) => {
                bracketHtml += this.createMatchupHTML(matchup, index);
            });
            bracketHtml += '</div>';
            bracketHtml += '</div>';
        }
        
        bracketHtml += '</div>';
        return bracketHtml;
    }

    // Create bracket HTML structure (legacy method for single bracket)
    createBracketHTML() {
        if (this.winnersBracket.length === 0 && this.losersBracket.length === 0) {
            return '<div class="no-matchups">No matchups available</div>';
        }
        
        return this.createDualBracketHTML();
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
            
            // Get losers from current round and sort by playoff seed for proper matching
            const losers = this.getLosersFromRound(currentRound);
            losers.sort((a, b) => {
                const seedA = parseInt(a.playoffSeed) || 999;
                const seedB = parseInt(b.playoffSeed) || 999;
                return seedA - seedB; // Sort by seed ascending (1, 2, 3...)
            });
            
            // Match highest seed with lowest seed, second highest with second lowest, etc.
            for (let i = 0; i < nextRoundSize; i++) {
                const homeIndex = i;
                const awayIndex = losers.length - 1 - i;
                
                if (homeIndex < awayIndex) {
                    nextRound.push({
                        home: losers[homeIndex],
                        away: losers[awayIndex],
                        isPlaceholder: true
                    });
                } else if (homeIndex === awayIndex) {
                    // If odd number of teams, the middle team gets a bye
                    nextRound.push({
                        home: losers[homeIndex],
                        away: {
                            name: 'BYE',
                            points: 0,
                            owner: 'Automatic Advance',
                            id: 'bye',
                            playoffSeed: ''
                        },
                        isPlaceholder: true
                    });
                }
            }
            
            rounds.push(nextRound);
            currentRound = nextRound;
        }
        
        return rounds;
    }

    // Get losers from a round of matchups
    getLosersFromRound(round) {
        const losers = [];
        
        round.forEach(matchup => {
            if (matchup.isPlaceholder) {
                // For placeholder matchups, add both teams as they represent advancing teams
                if (matchup.home && matchup.home.name !== 'BYE') {
                    losers.push(matchup.home);
                }
                if (matchup.away && matchup.away.name !== 'BYE') {
                    losers.push(matchup.away);
                }
            } else {
                // For actual matchups, determine the loser
                const homeScore = matchup.home.points || 0;
                const awayScore = matchup.away.points || 0;
                
                if (homeScore < awayScore) {
                    losers.push(matchup.home);
                } else if (awayScore < homeScore) {
                    losers.push(matchup.away);
                }
                // If scores are equal, we could handle this case differently if needed
            }
        });
        
        return losers;
    }

    // Get round title based on round index
    getRoundTitle(roundIndex, totalRounds) {
        const roundNames = [
            'Losers Bracket Round 1',
            'Losers Bracket Round 2', 
            'Losers Bracket Round 3',
            'Losers Bracket Round 4',
            'Losers Bracket Round 5',
            'Losers Championship'
        ];
        
        if (roundIndex < roundNames.length) {
            return roundNames[roundIndex];
        }
        
        return `Losers Bracket Round ${roundIndex + 1}`;
    }

    // Create individual matchup HTML
    createMatchupHTML(matchup, index) {
        const homeTeam = matchup.home;
        const awayTeam = matchup.away;
        const homeScore = homeTeam.currentScore || 0;
        const awayScore = awayTeam.currentScore || 0;
        const homeSeed = homeTeam.playoffSeed || '';
        const awaySeed = awayTeam.playoffSeed || '';
        const isPlaceholder = matchup.isPlaceholder || false;
        const isBye = matchup.isBye || false;
        const bracketType = matchup.bracketType || 'winners';
        
        // Debug logging
        if (!isBye) {
            console.log(`Matchup ${index}: ${homeTeam.name} (${homeScore}) vs ${awayTeam.name} (${awayScore}) - ${bracketType} bracket`);
        }
        
        // Determine winner/loser based on bracket type
        let homeWinner = false;
        let awayWinner = false;
        let homeLoser = false;
        let awayLoser = false;
        
        if (isBye) {
            // For bye matchups, the non-bye team advances
            if (bracketType === 'winners') {
                homeWinner = awayTeam.name === 'BYE';
                awayWinner = homeTeam.name === 'BYE';
            } else {
                // In losers bracket, the non-bye team advances (loses)
                homeLoser = awayTeam.name === 'BYE';
                awayLoser = homeTeam.name === 'BYE';
            }
        } else if (bracketType === 'winners') {
            // In winners bracket, higher score wins
            homeWinner = homeScore > awayScore;
            awayWinner = awayScore > homeScore;
        } else {
            // In losers bracket, lower score advances (loses)
            homeLoser = homeScore < awayScore;
            awayLoser = awayScore < homeScore;
        }
        
        return `
            <div class="matchup ${isPlaceholder ? 'placeholder' : ''} ${isBye ? 'bye-matchup' : ''}" data-index="${index}">
                <div class="team team1 ${homeWinner ? 'winner' : ''} ${homeLoser ? 'loser-advancing' : ''} ${homeTeam.name === 'BYE' ? 'bye-team' : ''}">
                    <div class="team-header">
                        <span class="team-name">${homeTeam.name}</span>
                        ${homeSeed ? `<span class="playoff-seed">#${homeSeed}</span>` : ''}
                    </div>
                    <span class="score">${homeTeam.name === 'BYE' ? 'BYE' : homeScore.toFixed(2)}</span>
                    ${homeWinner ? '<span class="advancing-indicator winner-indicator">→ ADVANCING</span>' : ''}
                    ${homeLoser ? '<span class="advancing-indicator loser-indicator">→ ADVANCING</span>' : ''}
                </div>
                <div class="vs">vs</div>
                <div class="team team2 ${awayWinner ? 'winner' : ''} ${awayLoser ? 'loser-advancing' : ''} ${awayTeam.name === 'BYE' ? 'bye-team' : ''}">
                    <div class="team-header">
                        <span class="team-name">${awayTeam.name}</span>
                        ${awaySeed ? `<span class="playoff-seed">#${awaySeed}</span>` : ''}
                    </div>
                    <span class="score">${awayTeam.name === 'BYE' ? 'BYE' : awayScore.toFixed(2)}</span>
                    ${awayWinner ? '<span class="advancing-indicator winner-indicator">→ ADVANCING</span>' : ''}
                    ${awayLoser ? '<span class="advancing-indicator loser-indicator">→ ADVANCING</span>' : ''}
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
    window.fantasyLosersBracketViewer = new FantasyLosersBracketViewer();
});