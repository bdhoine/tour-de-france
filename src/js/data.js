// Data management module
export class DataManager {
    constructor() {
        this.participantsData = [];
        this.gcData = null;
        this.scoringData = null;
    }

    async loadData() {
        try {
            const response = await fetch('/data.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            this.participantsData = data.data;
            return this.participantsData;
        } catch (error) {
            console.error('Error loading data:', error);
            throw error;
        }
    }

    async loadGCData() {
        try {
            const response = await fetch('/gc-data.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.gcData = await response.json();
            return this.gcData;
        } catch (error) {
            console.error('Error loading GC data:', error);
            throw error;
        }
    }

    getParticipant(id) {
        return this.participantsData.find(p => p.id === id);
    }

    getAllParticipants() {
        return this.participantsData;
    }

    searchParticipants(searchTerm) {
        const term = searchTerm.toLowerCase();
        return this.participantsData.filter(participant =>
            participant.name.toLowerCase().includes(term)
        );
    }

    getTotalCount() {
        return this.participantsData.length;
    }

    getGCStandings() {
        return this.gcData ? this.gcData.gc_standings : [];
    }

    getAbandonedRiders() {
        return this.gcData ? this.gcData.abandoned_riders : [];
    }


    getScoringResults() {
        return this.scoringData ? this.scoringData.scoring_results : [];
    }

    getScoringRules() {
        return this.scoringData ? this.scoringData.scoring_rules : {};
    }

    getParticipantScore(participantId) {
        if (!this.scoringData) return null;
        return this.scoringData.scoring_results.find(result => result.participant_id === participantId);
    }

    calculateScoring() {
        if (!this.participantsData || !this.gcData) {
            console.error('Cannot calculate scoring: missing participant data or GC data');
            return null;
        }

        const gcStandings = this.gcData.gc_standings;
        const abandonedRiders = this.gcData.abandoned_riders;
        
        // Create a lookup for actual finishing positions
        const actualPositions = {};
        gcStandings.forEach(standing => {
            actualPositions[standing.rider] = standing.position;
        });

        // Mark abandoned riders (DNF)
        const dnfRiders = new Set();
        abandonedRiders.forEach(rider => {
            dnfRiders.add(rider.rider);
        });
        
        // Create a set of all riders who are actually in the race (active + DNF)
        const allRaceRiders = new Set();
        gcStandings.forEach(standing => allRaceRiders.add(standing.rider));
        abandonedRiders.forEach(rider => allRaceRiders.add(rider.rider));

        const totalRidersInCourse = gcStandings.length + abandonedRiders.length;
        const dnfPenalty = totalRidersInCourse + 1;

        const scoringResults = this.participantsData.map(participant => {
            const mainRiders = participant.riders.slice(0, 10); // First 10 are main riders
            const substituteRiders = participant.riders.slice(10, 15); // Next 5 are substitutes
            
            let detailedScores = [];
            let substitutesUsed = 0;
            let substituteIndex = 0;

            // Process main riders (positions 1-10)
            mainRiders.forEach((rider, index) => {
                const predictionPos = index + 1;
                
                if (!allRaceRiders.has(rider)) {
                    // Main rider not in race (DNS) - must replace with substitute
                    let substituteFound = false;
                    
                    // Look for available substitute that didn't DNF
                    while (substituteIndex < substituteRiders.length && !substituteFound) {
                        const substituteRider = substituteRiders[substituteIndex];
                        
                        if (substituteRider && allRaceRiders.has(substituteRider)) {
                            // Found valid substitute who is in the race
                            const substituteActualPos = actualPositions[substituteRider];
                            const substitutePoints = substituteActualPos ? 
                                predictionPos + substituteActualPos : // Use MAIN rider's prediction position + substitute's actual position
                                predictionPos + dnfPenalty; // DNF penalty with main rider's position

                            detailedScores.push({
                                prediction_pos: predictionPos,
                                rider: rider,
                                actual_pos: null,
                                points: 0,
                                dnf: false, // Not DNF, just DNS (did not start)
                                dns: true,
                                is_substitute: false,
                                replaced_by: substituteRider
                            });

                            detailedScores.push({
                                prediction_pos: predictionPos, // Use the MAIN rider's position, not substitute position
                                rider: substituteRider,
                                actual_pos: substituteActualPos || null,
                                points: substitutePoints,
                                dnf: dnfRiders.has(substituteRider), // Check if substitute DNF'd
                                is_substitute: true,
                                replaces_position: predictionPos
                            });

                            substitutesUsed++;
                            substituteIndex++;
                            substituteFound = true;
                        } else {
                            // This substitute also DNF or doesn't exist, try next one
                            substituteIndex++;
                        }
                    }
                    
                    if (!substituteFound) {
                        // No valid substitute available - rider gets penalty
                        detailedScores.push({
                            prediction_pos: predictionPos,
                            rider: rider,
                            actual_pos: null,
                            points: predictionPos + dnfPenalty,
                            dns: true,
                            is_substitute: false,
                            no_replacement: true
                        });
                    }
                } else if (dnfRiders.has(rider)) {
                    // Main rider started but DNF'd - try to find a substitute
                    let substituteFound = false;
                    
                    // Look for available substitute that is in the race
                    while (substituteIndex < substituteRiders.length && !substituteFound) {
                        const substituteRider = substituteRiders[substituteIndex];
                        
                        if (substituteRider && allRaceRiders.has(substituteRider)) {
                            // Found valid substitute
                            const substituteActualPos = actualPositions[substituteRider];
                            const substitutePoints = substituteActualPos ? 
                                predictionPos + substituteActualPos : // Use main rider's prediction position + substitute's actual position
                                predictionPos + dnfPenalty; // DNF penalty with main rider's position

                            detailedScores.push({
                                prediction_pos: predictionPos,
                                rider: rider,
                                actual_pos: null,
                                points: 0,
                                dnf: true,
                                is_substitute: false,
                                replaced_by: substituteRider
                            });

                            detailedScores.push({
                                prediction_pos: predictionPos, // Use the MAIN rider's position
                                rider: substituteRider,
                                actual_pos: substituteActualPos || null,
                                points: substitutePoints,
                                dnf: dnfRiders.has(substituteRider),
                                is_substitute: true,
                                replaces_position: predictionPos
                            });

                            substitutesUsed++;
                            substituteIndex++;
                            substituteFound = true;
                        } else {
                            // This substitute also not available, try next one
                            substituteIndex++;
                        }
                    }
                    
                    if (!substituteFound) {
                        // No valid substitute available - rider gets penalty
                        detailedScores.push({
                            prediction_pos: predictionPos,
                            rider: rider,
                            actual_pos: null,
                            points: predictionPos + dnfPenalty,
                            dnf: true,
                            is_substitute: false,
                            no_replacement: true
                        });
                    }
                } else {
                    // Main rider is in race and finished
                    const actualPos = actualPositions[rider];
                    const points = predictionPos + actualPos;

                    detailedScores.push({
                        prediction_pos: predictionPos,
                        rider: rider,
                        actual_pos: actualPos,
                        points: points,
                        dnf: false,
                        is_substitute: false
                    });
                }
            });

            // Calculate total points (only counting the 10 scoring riders)
            // We need exactly 10 scoring riders: main riders + substitutes (or penalty for no replacement)
            const scoringRiders = detailedScores.filter(score => 
                (!score.dnf && !score.is_substitute) || // Main riders who finished
                (score.is_substitute) || // All substitutes count
                (score.dnf && score.no_replacement) // DNF riders with no replacement get penalty
            );
            
            const totalPoints = scoringRiders.reduce((sum, score) => sum + score.points, 0);

            return {
                participant_id: participant.id,
                participant_name: participant.name,
                total_points: totalPoints,
                substitutes_used: substitutesUsed,
                detailed_scores: detailedScores
            };
        });

        // Sort by total points (lowest wins)
        scoringResults.sort((a, b) => a.total_points - b.total_points);

        // Add rankings
        scoringResults.forEach((result, index) => {
            result.rank = index + 1;
        });

        // Create scoring data structure
        this.scoringData = {
            scoring_results: scoringResults,
            scoring_rules: {
                calculation: "prediction_position + actual_position = points",
                objective: "lowest total points wins",
                dnf_penalty: dnfPenalty,
                total_riders_in_course: totalRidersInCourse,
                total_finishers: gcStandings.length
            }
        };

        return this.scoringData;
    }
}