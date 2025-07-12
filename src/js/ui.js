// UI management module
export class UIManager {
    constructor(dataManager) {
        this.dataManager = dataManager;
        this.currentParticipantSort = { field: 'name', direction: 'asc' };
        this.currentScoringSort = { field: 'rank', direction: 'asc' };
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
            participantRidersBody: document.getElementById('participantRidersBody'),
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

        // Add sorting event listeners
        this.bindSortingEvents();

        // Make functions globally available
        window.showDetailView = (id) => this.showDetailView(id);
        window.showMainView = () => this.showMainView();
        window.showScoringView = () => this.showScoringView();
        window.showScoringDetailView = (id) => this.showScoringDetailView(id);
    }

    displayParticipants(participants) {
        this.elements.tableBody.innerHTML = '';

        if (participants.length === 0) {
            this.elements.tableBody.innerHTML = '<tr><td colspan="3">No participants found</td></tr>';
            return;
        }

        // Get scoring data to add position and points
        const scoringResults = this.dataManager.getScoringResults();
        
        // Create enhanced participant data with scoring info
        const enhancedParticipants = participants.map(participant => {
            const scoreData = scoringResults.find(result => result.participant_id === participant.id);
            return {
                ...participant,
                position: scoreData ? scoreData.rank : '-',
                points: scoreData ? scoreData.total_points : '-'
            };
        });

        // Sort the participants
        const sortedParticipants = this.sortParticipants(enhancedParticipants);

        sortedParticipants.forEach(participant => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="position">${participant.position}</td>
                <td class="participant-name">${participant.name}</td>
                <td class="total-points">${participant.points}</td>
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

    async showDetailView(participantId) {
        const participant = this.dataManager.getParticipant(participantId);
        if (!participant) {
            console.error('Participant not found:', participantId);
            return;
        }

        // Update URL fragment
        window.location.hash = `participant-detail-${participantId}`;

        // Ensure GC data is loaded for team/status information
        if (!this.dataManager.gcData) {
            await this.dataManager.loadGCData();
        }

        this.elements.participantName.textContent = participant.name;
        
        // Update navigation to show participants as active
        this.elements.navScoring.classList.remove('active');
        this.elements.navParticipants.classList.add('active');
        this.elements.navGC.classList.remove('active');
        
        // Populate table with all 15 riders
        this.populateParticipantRidersTable(participant.riders);

        // Switch views
        this.elements.scoringView.style.display = 'none';
        this.elements.scoringDetailView.style.display = 'none';
        this.elements.mainView.style.display = 'none';
        this.elements.detailView.style.display = 'block';
        this.elements.gcView.style.display = 'none';
    }

    populateParticipantRidersTable(riders) {
        this.elements.participantRidersBody.innerHTML = '';
        
        riders.forEach((rider, index) => {
            const position = index + 1;
            const row = document.createElement('tr');
            
            // Get rider status from GC data
            const riderStatus = this.getRiderStatus(rider);
            
            // Add different styling for main vs reserve riders
            const isReserve = position > 10;
            
            row.innerHTML = `
                <td class="position ${isReserve ? 'reserve-position' : 'main-position'}">${position}</td>
                <td class="rider-name">${rider}</td>
                <td class="team-name">${riderStatus.team || 'N/A'}</td>
                <td class="rider-status ${riderStatus.statusClass}">${riderStatus.status}</td>
            `;
            
            if (isReserve) {
                row.classList.add('reserve-rider-row');
            }
            
            this.elements.participantRidersBody.appendChild(row);
        });
    }

    getRiderStatus(riderName) {
        if (!this.dataManager.gcData) {
            return { status: 'Unknown', statusClass: '', team: '' };
        }
        
        // Check if rider is in active standings
        const activeRider = this.dataManager.gcData.gc_standings.find(r => 
            r.rider.toLowerCase() === riderName.toLowerCase()
        );
        
        if (activeRider) {
            return { 
                status: `GC ${activeRider.position}`, 
                statusClass: 'active-rider',
                team: activeRider.team 
            };
        }
        
        // Check if rider is abandoned
        const abandonedRider = this.dataManager.gcData.abandoned_riders.find(r => 
            r.rider.toLowerCase() === riderName.toLowerCase()
        );
        
        if (abandonedRider) {
            return { 
                status: 'DNF', 
                statusClass: 'dnf-rider',
                team: abandonedRider.team 
            };
        }
        
        // Rider not found in race data (DNS)
        return { 
            status: 'DNS', 
            statusClass: 'dns-rider',
            team: 'N/A' 
        };
    }

    showMainView() {
        this.elements.mainView.style.display = 'block';
        this.elements.detailView.style.display = 'none';
        // Clear search when returning to main view
        this.elements.searchInput.value = '';
        this.displayParticipants(this.dataManager.getAllParticipants());
    }

    showError(message) {
        this.elements.tableBody.innerHTML = `<tr><td colspan="3">Error: ${message}</td></tr>`;
    }

    async showParticipantsView() {
        try {
            // Calculate scoring data if not already calculated
            if (!this.dataManager.scoringData) {
                // Ensure GC data is loaded for calculations
                if (!this.dataManager.gcData) {
                    await this.dataManager.loadGCData();
                }
                this.dataManager.calculateScoring();
            }
            
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
            
        } catch (error) {
            console.error('Error showing participants view:', error);
            this.elements.tableBody.innerHTML = '<tr><td colspan="3">Error loading participant data</td></tr>';
        }
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

        // Sort the results
        const sortedResults = this.sortScoringResults([...results]);

        sortedResults.forEach(result => {
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

        // Update URL fragment
        window.location.hash = `scoring-detail-${participantId}`;

        this.elements.scoringParticipantName.textContent = scoreData.participant_name;
        this.elements.totalPoints.textContent = scoreData.total_points;
        this.elements.participantRank.textContent = `#${scoreData.rank}`;

        // Display detailed scores
        this.elements.detailedScoringBody.innerHTML = '';
        scoreData.detailed_scores.forEach(score => {
            const row = document.createElement('tr');
            
            // Handle DNF and DNS riders
            if (score.dnf || score.dns) {
                const actualPos = score.dns ? 'DNS' : 'DNF';
                
                if (score.no_replacement) {
                    // DNF/DNS with no replacement available - show penalty points
                    const reasonText = score.dns ? 'No replacement available (DNS)' : 'No replacement available (DNF)';
                    row.innerHTML = `
                        <td class="predicted-pos">${score.prediction_pos}</td>
                        <td class="rider-name">${score.rider}<div class="substitute-indicator">${reasonText}</div></td>
                        <td class="actual-pos">${actualPos}</td>
                        <td class="points">${score.points}</td>
                    `;
                    row.classList.add(score.dns ? 'dns-rider' : 'dnf-rider', 'no-replacement');
                } else {
                    // DNF/DNS with replacement - don't show points as they don't count
                    const reasonText = score.dns ? 'Did not start - replaced by' : 'Replaced by';
                    row.innerHTML = `
                        <td class="predicted-pos">${score.prediction_pos}</td>
                        <td class="rider-name">${score.rider}<div class="substitute-indicator">${reasonText} ${score.replaced_by}</div></td>
                        <td class="actual-pos">${actualPos}</td>
                        <td class="points">—</td>
                    `;
                    row.classList.add(score.dns ? 'dns-rider' : 'dnf-rider');
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

    async handleHashChange() {
        const hash = window.location.hash.substring(1); // Remove the '#'
        
        // Check for scoring detail fragments
        if (hash.startsWith('scoring-detail-')) {
            const participantId = parseInt(hash.replace('scoring-detail-', ''));
            if (!isNaN(participantId)) {
                // Ensure scoring data is calculated before showing detail
                if (!this.dataManager.scoringData) {
                    if (!this.dataManager.gcData) {
                        await this.dataManager.loadGCData();
                    }
                    this.dataManager.calculateScoring();
                }
                this.showScoringDetailView(participantId);
                return;
            }
        }
        
        // Check for participant detail fragments
        if (hash.startsWith('participant-detail-')) {
            const participantId = parseInt(hash.replace('participant-detail-', ''));
            if (!isNaN(participantId)) {
                await this.showDetailView(participantId);
                return;
            }
        }
        
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

    bindSortingEvents() {
        // Participant table sorting
        const participantTable = document.getElementById('participantsTable');
        if (participantTable) {
            participantTable.addEventListener('click', (e) => {
                if (e.target.classList.contains('sortable') || e.target.parentElement.classList.contains('sortable')) {
                    const header = e.target.classList.contains('sortable') ? e.target : e.target.parentElement;
                    const sortField = header.dataset.sort;
                    this.sortParticipantTable(sortField);
                }
            });
        }

        // Scoring table sorting
        const scoringTable = document.getElementById('scoringTable');
        if (scoringTable) {
            scoringTable.addEventListener('click', (e) => {
                if (e.target.classList.contains('sortable') || e.target.parentElement.classList.contains('sortable')) {
                    const header = e.target.classList.contains('sortable') ? e.target : e.target.parentElement;
                    const sortField = header.dataset.sort;
                    this.sortScoringTable(sortField);
                }
            });
        }
    }

    sortParticipantTable(field) {
        // Toggle direction if same field, otherwise default to asc
        if (this.currentParticipantSort.field === field) {
            this.currentParticipantSort.direction = this.currentParticipantSort.direction === 'asc' ? 'desc' : 'asc';
        } else {
            this.currentParticipantSort.field = field;
            this.currentParticipantSort.direction = 'asc';
        }

        this.updateSortIndicators('participantsTable', field, this.currentParticipantSort.direction);
        this.displayParticipants(this.dataManager.getAllParticipants());
    }

    sortScoringTable(field) {
        // Toggle direction if same field, otherwise default to asc
        if (this.currentScoringSort.field === field) {
            this.currentScoringSort.direction = this.currentScoringSort.direction === 'asc' ? 'desc' : 'asc';
        } else {
            this.currentScoringSort.field = field;
            this.currentScoringSort.direction = 'asc';
        }

        this.updateSortIndicators('scoringTable', field, this.currentScoringSort.direction);
        this.displayScoringResults();
    }

    updateSortIndicators(tableId, activeField, direction) {
        const table = document.getElementById(tableId);
        const headers = table.querySelectorAll('.sortable');
        
        headers.forEach(header => {
            const indicator = header.querySelector('.sort-indicator');
            const field = header.dataset.sort;
            
            if (field === activeField) {
                indicator.textContent = direction === 'asc' ? ' ↑' : ' ↓';
                indicator.style.color = '#FFD100';
            } else {
                indicator.textContent = '';
                indicator.style.color = '';
            }
        });
    }

    sortParticipants(participants) {
        const { field, direction } = this.currentParticipantSort;
        
        return participants.sort((a, b) => {
            let aVal, bVal;
            
            switch (field) {
                case 'position':
                    aVal = a.position === '-' ? 999 : parseInt(a.position);
                    bVal = b.position === '-' ? 999 : parseInt(b.position);
                    break;
                case 'name':
                    aVal = a.name.toLowerCase();
                    bVal = b.name.toLowerCase();
                    break;
                case 'points':
                    aVal = a.points === '-' ? 999999 : parseInt(a.points);
                    bVal = b.points === '-' ? 999999 : parseInt(b.points);
                    break;
                default:
                    return 0;
            }
            
            if (aVal < bVal) return direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return direction === 'asc' ? 1 : -1;
            return 0;
        });
    }

    sortScoringResults(results) {
        const { field, direction } = this.currentScoringSort;
        
        return results.sort((a, b) => {
            let aVal, bVal;
            
            switch (field) {
                case 'rank':
                    aVal = a.rank;
                    bVal = b.rank;
                    break;
                case 'name':
                    aVal = a.participant_name.toLowerCase();
                    bVal = b.participant_name.toLowerCase();
                    break;
                case 'points':
                    aVal = a.total_points;
                    bVal = b.total_points;
                    break;
                default:
                    return 0;
            }
            
            if (aVal < bVal) return direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return direction === 'asc' ? 1 : -1;
            return 0;
        });
    }
}