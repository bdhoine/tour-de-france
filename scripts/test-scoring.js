#!/usr/bin/env node

/**
 * Test the scoring calculation to verify DNS rider replacement
 * Usage: node scripts/test-scoring.js
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function testScoring() {
    try {
        console.log('Testing DNS rider replacement logic...');
        
        const dataPath = join(__dirname, '..', 'public', 'data.json');
        const gcDataPath = join(__dirname, '..', 'public', 'gc-data.json');
        
        const participantsData = JSON.parse(readFileSync(dataPath, 'utf8'));
        const gcData = JSON.parse(readFileSync(gcDataPath, 'utf8'));
        
        // Find Liza Graus (or other participant with CARAPAZ)
        const lizaGraus = participantsData.data.find(p => p.name.toLowerCase().includes('graus'));
        if (!lizaGraus) {
            console.log('❌ Could not find Liza Graus in data');
            return;
        }
        
        console.log(`Found participant: ${lizaGraus.name}`);
        console.log('Top 10 riders:', lizaGraus.riders.slice(0, 10));
        console.log('Substitutes:', lizaGraus.riders.slice(10, 15));
        
        // Check if CARAPAZ is in their predictions
        const hasCarapaz = lizaGraus.riders.some(rider => rider.toLowerCase().includes('carapaz'));
        console.log(`Has Carapaz in predictions: ${hasCarapaz}`);
        
        // Check if CARAPAZ is in the race
        const allRaceRiders = [
            ...gcData.gc_standings.map(r => r.rider),
            ...gcData.abandoned_riders.map(r => r.rider)
        ];
        
        const carapazInRace = allRaceRiders.some(rider => rider.toLowerCase().includes('carapaz'));
        console.log(`Carapaz in race data: ${carapazInRace}`);
        
        if (hasCarapaz && !carapazInRace) {
            console.log('✅ Confirmed: CARAPAZ is in predictions but not in race (DNS)');
            console.log('This should trigger substitute replacement logic');
        }
        
        // Simulate the scoring logic for this specific case
        const mainRiders = lizaGraus.riders.slice(0, 10);
        const substituteRiders = lizaGraus.riders.slice(10, 15);
        
        console.log('\nScoring simulation:');
        mainRiders.forEach((rider, index) => {
            const predictionPos = index + 1;
            const isInRace = allRaceRiders.some(raceRider => 
                raceRider.toLowerCase() === rider.toLowerCase()
            );
            
            if (!isInRace) {
                console.log(`Position ${predictionPos}: ${rider} - DNS (should be replaced)`);
                
                // Find first available substitute
                for (let i = 0; i < substituteRiders.length; i++) {
                    const substitute = substituteRiders[i];
                    const subIsInRace = allRaceRiders.some(raceRider => 
                        raceRider.toLowerCase() === substitute.toLowerCase()
                    );
                    
                    if (subIsInRace) {
                        console.log(`  → Replaced by: ${substitute} (substitute ${i + 1})`);
                        break;
                    } else {
                        console.log(`  → Substitute ${i + 1} (${substitute}) also not in race`);
                    }
                }
            } else {
                console.log(`Position ${predictionPos}: ${rider} - OK`);
            }
        });
        
    } catch (error) {
        console.error('❌ Error testing scoring:', error.message);
    }
}

// Run the test
testScoring();