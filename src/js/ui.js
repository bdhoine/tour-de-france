// UI management module
export class UIManager {
    constructor(dataManager) {
        this.dataManager = dataManager;
        this.initializeElements();
        this.bindEvents();
    }

    initializeElements() {
        this.elements = {
            scoringView: document.getElementById('scoringView'),
            scoringDetailView: document.getElementById('scoringDetailView'),
            mainView: document.getElementById('mainView'),
            detailView: document.getElementById('detailView'),
            gcView: document.getElementById('gcView'),
            tableBody: document.getElementById('tableBody'),
            searchInput: document.getElementById('searchInput'),
            participantName: document.getElementById('participantName'),
            mainRiders: document.getElementById('mainRiders'),
            reserveRiders: document.getElementById('reserveRiders'),
            gcTableBody: document.getElementById('gcTableBody'),
            abandonedList: document.getElementById('abandonedList'),
            gcSearchInput: document.getElementById('gcSearchInput'),
            navScoring: document.getElementById('navScoring'),
            navParticipants: document.getElementById('navParticipants'),
            navGC: document.getElementById('navGC'),
            scoringTableBody: document.getElementById('scoringTableBody'),
            scoringSearchInput: document.getElementById('scoringSearchInput'),
            scoringParticipantName: document.getElementById('scoringParticipantName'),
            totalPoints: document.getElementById('totalPoints'),
            participantRank: document.getElementById('participantRank'),
            substitutesUsed: document.getElementById('substitutesUsed'),
            detailedScoringBody: document.getElementById('detailedScoringBody')
        };
    }

    bindEvents() {
        this.elements.searchInput.addEventListener('input', (e) => {
            this.handleSearch(e.target.value);
        });

        this.elements.scoringSearchInput.addEventListener('input', (e) => {
            this.handleScoringSearch(e.target.value);
        });

        this.elements.gcSearchInput.addEventListener('input', (e) => {
            this.handleGCSearch(e.target.value);
        });

        // Navigation events
        this.elements.navScoring.addEventListener('click', (e) => {
            e.preventDefault();
            this.navigateToFragment('scoring');
        });

        this.elements.navParticipants.addEventListener('click', (e) => {
            e.preventDefault();
            this.navigateToFragment('participants');
        });

        this.elements.navGC.addEventListener('click', (e) => {
            e.preventDefault();
            this.navigateToFragment('gc');
        });

        // Handle URL fragment changes
        window.addEventListener('hashchange', () => {
            this.handleHashChange();
        });

        // Handle initial page load
        window.addEventListener('load', () => {
            this.handleHashChange();
        });

        // Make functions globally available
        window.showDetailView = (id) => this.showDetailView(id);
        window.showMainView = () => this.showMainView();
        window.showScoringView = () => this.showScoringView();
        window.showScoringDetailView = (id) => this.showScoringDetailView(id);
    }

    displayParticipants(participants) {
        this.elements.tableBody.innerHTML = '';

        if (participants.length === 0) {
            this.elements.tableBody.innerHTML = '<tr><td>No participants found</td></tr>';
            return;
        }

        participants.forEach(participant => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${participant.name}</td>
            `;
            row.onclick = () => this.showDetailView(participant.id);
            this.elements.tableBody.appendChild(row);
        });
    }

    updateStats() {
        // Stats section removed - no longer needed
    }

    handleSearch(searchTerm) {
        const filteredParticipants = this.dataManager.searchParticipants(searchTerm);
        this.displayParticipants(filteredParticipants);
    }

    showDetailView(participantId) {
        const participant = this.dataManager.getParticipant(participantId);
        if (!participant) {
            console.error('Participant not found:', participantId);
            return;
        }

        this.elements.participantName.textContent = participant.name;
        
        // Split riders into main (first 10) and reserves (last 5)
        const mainRiders = participant.riders.slice(0, 10);
        const reserveRiders = participant.riders.slice(10, 15);

        // Display main riders
        this.elements.mainRiders.innerHTML = '';
        mainRiders.forEach((rider, index) => {
            const li = document.createElement('li');
            li.className = 'rider-item';
            li.textContent = `${index + 1}. ${rider}`;
            this.elements.mainRiders.appendChild(li);
        });

        // Display reserve riders
        this.elements.reserveRiders.innerHTML = '';
        reserveRiders.forEach((rider, index) => {
            const li = document.createElement('li');
            li.className = 'rider-item';
            li.textContent = `${index + 1}. ${rider}`;
            this.elements.reserveRiders.appendChild(li);
        });

        // Switch views
        this.elements.mainView.style.display = 'none';
        this.elements.detailView.style.display = 'block';
    }

    showMainView() {
        this.elements.mainView.style.display = 'block';
        this.elements.detailView.style.display = 'none';
        // Clear search when returning to main view
        this.elements.searchInput.value = '';
        this.displayParticipants(this.dataManager.getAllParticipants());
    }

    showError(message) {
        this.elements.tableBody.innerHTML = `<tr><td>Error: ${message}</td></tr>`;
    }

    showParticipantsView() {
        this.elements.scoringView.style.display = 'none';
        this.elements.scoringDetailView.style.display = 'none';
        this.elements.mainView.style.display = 'block';
        this.elements.detailView.style.display = 'none';
        this.elements.gcView.style.display = 'none';
        
        // Update navigation
        this.elements.navScoring.classList.remove('active');
        this.elements.navParticipants.classList.add('active');
        this.elements.navGC.classList.remove('active');
        
        // Clear search and refresh
        this.elements.searchInput.value = '';
        this.displayParticipants(this.dataManager.getAllParticipants());
        this.updateStats();
    }

    async showGCView() {
        try {
            // Load GC data if not already loaded
            if (!this.dataManager.gcData) {
                await this.dataManager.loadGCData();
            }
            
            this.elements.scoringView.style.display = 'none';
            this.elements.scoringDetailView.style.display = 'none';
            this.elements.mainView.style.display = 'none';
            this.elements.detailView.style.display = 'none';
            this.elements.gcView.style.display = 'block';
            
            // Update navigation
            this.elements.navScoring.classList.remove('active');
            this.elements.navParticipants.classList.remove('active');
            this.elements.navGC.classList.add('active');
            
            // Clear search and display GC data
            this.elements.gcSearchInput.value = '';
            this.displayGCStandings();
            this.displayAbandonedRiders();
            
        } catch (error) {
            console.error('Error showing GC view:', error);
            this.elements.gcTableBody.innerHTML = '<tr><td colspan="4">Error loading GC data</td></tr>';
            this.elements.abandonedList.innerHTML = '<p>Error loading abandoned riders data</p>';
        }
    }

    displayGCStandings(filteredStandings = null) {
        const standings = filteredStandings || this.dataManager.getGCStandings();
        this.elements.gcTableBody.innerHTML = '';

        if (standings.length === 0) {
            const message = filteredStandings ? 'No riders found' : 'No GC data available';
            this.elements.gcTableBody.innerHTML = `<tr><td colspan="4">${message}</td></tr>`;
            return;
        }

        standings.forEach(rider => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="position">${rider.position}</td>
                <td class="rider-name">${rider.rider}</td>
                <td class="team-name">${rider.team}</td>
                <td class="time">${rider.time}</td>
            `;
            
            this.elements.gcTableBody.appendChild(row);
        });
    }

    displayAbandonedRiders() {
        const abandonedRiders = this.dataManager.getAbandonedRiders();
        this.elements.abandonedList.innerHTML = '';

        if (abandonedRiders.length === 0) {
            this.elements.abandonedList.innerHTML = '<p>No riders have left the tour</p>';
            return;
        }

        abandonedRiders.forEach(rider => {
            const div = document.createElement('div');
            div.className = 'abandoned-rider';
            div.innerHTML = `
                <div class="abandoned-rider-info">
                    <strong>${rider.rider}</strong>
                    <span class="team">${rider.team}</span>
                </div>
                <div class="abandoned-details">
                    <span class="stage">Stage ${rider.stage}</span>
                    <span class="reason">${rider.reason}</span>
                </div>
            `;
            this.elements.abandonedList.appendChild(div);
        });
    }

    async showScoringView() {
        try {
            // Calculate scoring data if not already calculated
            if (!this.dataManager.scoringData) {
                // Ensure GC data is loaded for calculations
                if (!this.dataManager.gcData) {
                    await this.dataManager.loadGCData();
                }
                this.dataManager.calculateScoring();
            }
            
            this.elements.scoringView.style.display = 'block';
            this.elements.scoringDetailView.style.display = 'none';
            this.elements.mainView.style.display = 'none';
            this.elements.detailView.style.display = 'none';
            this.elements.gcView.style.display = 'none';
            
            // Update navigation
            this.elements.navScoring.classList.add('active');
            this.elements.navParticipants.classList.remove('active');
            this.elements.navGC.classList.remove('active');
            
            // Clear search and display scoring data
            this.elements.scoringSearchInput.value = '';
            this.displayScoringResults();
            
        } catch (error) {
            console.error('Error showing scoring view:', error);
            this.elements.scoringTableBody.innerHTML = '<tr><td colspan="3">Error loading scoring data</td></tr>';
        }
    }

    displayScoringResults(filteredResults = null) {
        const results = filteredResults || this.dataManager.getScoringResults();
        this.elements.scoringTableBody.innerHTML = '';

        if (results.length === 0) {
            const message = filteredResults ? 'No participants found' : 'No scoring data available';
            this.elements.scoringTableBody.innerHTML = `<tr><td colspan="3">${message}</td></tr>`;
            return;
        }

        results.forEach(result => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="rank">${result.rank}</td>
                <td class="participant-name">${result.participant_name}</td>
                <td class="total-points">${result.total_points}</td>
            `;
            row.onclick = () => this.showScoringDetailView(result.participant_id);
            this.elements.scoringTableBody.appendChild(row);
        });
    }

    handleScoringSearch(searchTerm) {
        const allResults = this.dataManager.getScoringResults();
        if (!searchTerm.trim()) {
            this.displayScoringResults();
            return;
        }

        const term = searchTerm.toLowerCase();
        const filteredResults = allResults.filter(result =>
            result.participant_name.toLowerCase().includes(term)
        );
        this.displayScoringResults(filteredResults);
    }

    handleGCSearch(searchTerm) {
        const allStandings = this.dataManager.getGCStandings();
        if (!searchTerm.trim()) {
            this.displayGCStandings();
            return;
        }

        const term = searchTerm.toLowerCase();
        const filteredStandings = allStandings.filter(rider =>
            rider.rider.toLowerCase().includes(term) ||
            rider.team.toLowerCase().includes(term)
        );
        this.displayGCStandings(filteredStandings);
    }

    showScoringDetailView(participantId) {
        const scoreData = this.dataManager.getParticipantScore(participantId);
        if (!scoreData) {
            console.error('Score data not found for participant:', participantId);
            return;
        }

        this.elements.scoringParticipantName.textContent = scoreData.participant_name;
        this.elements.totalPoints.textContent = scoreData.total_points;
        this.elements.participantRank.textContent = `#${scoreData.rank}`;
        this.elements.substitutesUsed.textContent = scoreData.substitutes_used || 0;

        // Display detailed scores
        this.elements.detailedScoringBody.innerHTML = '';
        scoreData.detailed_scores.forEach(score => {
            const row = document.createElement('tr');
            
            // Handle DNF riders
            if (score.dnf) {
                const actualPos = 'DNF';
                
                if (score.no_replacement) {
                    // DNF with no replacement available - show penalty points
                    row.innerHTML = `
                        <td class="predicted-pos">${score.prediction_pos}</td>
                        <td class="rider-name">${score.rider}<div class="substitute-indicator">No replacement available</div></td>
                        <td class="actual-pos">${actualPos}</td>
                        <td class="points">${score.points}</td>
                    `;
                    row.classList.add('dnf-rider', 'no-replacement');
                } else {
                    // DNF with replacement - don't show points as they don't count
                    row.innerHTML = `
                        <td class="predicted-pos">${score.prediction_pos}</td>
                        <td class="rider-name">${score.rider}<div class="substitute-indicator">Replaced by ${score.replaced_by}</div></td>
                        <td class="actual-pos">${actualPos}</td>
                        <td class="points">—</td>
                    `;
                    row.classList.add('dnf-rider');
                }
            }
            // Handle substitute riders
            else if (score.is_substitute) {
                const actualPos = score.actual_pos ? score.actual_pos : 'DNF';
                row.innerHTML = `
                    <td class="predicted-pos">${score.prediction_pos}</td>
                    <td class="rider-name">${score.rider}<div class="substitute-indicator">Substitute for position ${score.replaces_position}</div></td>
                    <td class="actual-pos">${actualPos}</td>
                    <td class="points">${score.points}</td>
                `;
                row.classList.add('substitute-rider');
            }
            // Handle regular riders
            else {
                const actualPos = score.actual_pos ? score.actual_pos : 'DNF';
                row.innerHTML = `
                    <td class="predicted-pos">${score.prediction_pos}</td>
                    <td class="rider-name">${score.rider}</td>
                    <td class="actual-pos">${actualPos}</td>
                    <td class="points">${score.points}</td>
                `;
                
                // Add styling for regular DNF riders (without replacement data)
                if (!score.actual_pos) {
                    row.classList.add('dnf-rider');
                }
            }
            
            this.elements.detailedScoringBody.appendChild(row);
        });

        // Switch views
        this.elements.scoringView.style.display = 'none';
        this.elements.scoringDetailView.style.display = 'block';
        this.elements.mainView.style.display = 'none';
        this.elements.detailView.style.display = 'none';
        this.elements.gcView.style.display = 'none';
    }

    navigateToFragment(fragment) {
        window.location.hash = fragment;
    }

    handleHashChange() {
        const hash = window.location.hash.substring(1); // Remove the '#'
        
        switch (hash) {
            case 'participants':
                this.showParticipantsView();
                break;
            case 'gc':
                this.showGCView();
                break;
            case 'scoring':
            default:
                this.showScoringView();
                break;
        }
    }
}