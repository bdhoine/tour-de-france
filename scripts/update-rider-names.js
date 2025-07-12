#!/usr/bin/env node

/**
 * Update rider names in data.json to match gc-data.json
 * Usage: node scripts/update-rider-names.js
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function updateRiderNames() {
    try {
        console.log('Loading data files...');
        
        // Load data.json and gc-data.json
        const dataPath = join(__dirname, '..', 'public', 'data.json');
        const gcDataPath = join(__dirname, '..', 'public', 'gc-data.json');
        
        const participantsData = JSON.parse(readFileSync(dataPath, 'utf8'));
        const gcData = JSON.parse(readFileSync(gcDataPath, 'utf8'));
        
        // Create a mapping of all rider names from GC data (both active and abandoned)
        const allGCRiders = [
            ...gcData.gc_standings.map(r => r.rider),
            ...gcData.abandoned_riders.map(r => r.rider)
        ];
        
        console.log(`Found ${allGCRiders.length} riders in GC data`);
        
        // Create fuzzy matching function
        function findBestMatch(riderName, gcRiders) {
            // First try exact match
            const exactMatch = gcRiders.find(gcRider => 
                gcRider.toLowerCase() === riderName.toLowerCase()
            );
            if (exactMatch) return exactMatch;
            
            // Try partial matches (last name, first name, etc.)
            const nameParts = riderName.toLowerCase().split(' ');
            const bestMatch = gcRiders.find(gcRider => {
                const gcNameParts = gcRider.toLowerCase().split(' ');
                
                // Check if all parts of the original name are in the GC name
                return nameParts.every(part => 
                    gcNameParts.some(gcPart => 
                        gcPart.includes(part) || part.includes(gcPart)
                    )
                );
            });
            
            if (bestMatch) return bestMatch;
            
            // Try reverse match (GC name parts in original name)
            const reverseMatch = gcRiders.find(gcRider => {
                const gcNameParts = gcRider.toLowerCase().split(' ');
                
                return gcNameParts.every(gcPart => 
                    nameParts.some(part => 
                        part.includes(gcPart) || gcPart.includes(part)
                    )
                );
            });
            
            return reverseMatch || null;
        }
        
        let updatedCount = 0;
        let notFoundCount = 0;
        const notFoundRiders = [];
        
        // Update rider names in all participants
        participantsData.data.forEach(participant => {
            console.log(`\nProcessing participant: ${participant.name}`);
            
            participant.riders = participant.riders.map(riderName => {
                const bestMatch = findBestMatch(riderName, allGCRiders);
                
                if (bestMatch && bestMatch !== riderName) {
                    console.log(`  ✓ Updated: "${riderName}" → "${bestMatch}"`);
                    updatedCount++;
                    return bestMatch;
                } else if (bestMatch) {
                    console.log(`  ✓ Match: "${riderName}"`);
                    return riderName;
                } else {
                    console.log(`  ⚠️  No match found for: "${riderName}"`);
                    notFoundCount++;
                    notFoundRiders.push(riderName);
                    return riderName; // Keep original name if no match found
                }
            });
        });
        
        // Write updated data back to file
        writeFileSync(dataPath, JSON.stringify(participantsData, null, 2));
        
        console.log('\n' + '='.repeat(50));
        console.log('UPDATE SUMMARY:');
        console.log('='.repeat(50));
        console.log(`✅ Total riders updated: ${updatedCount}`);
        console.log(`⚠️  Riders not found: ${notFoundCount}`);
        
        if (notFoundRiders.length > 0) {
            console.log('\nRiders not found in GC data:');
            const uniqueNotFound = [...new Set(notFoundRiders)];
            uniqueNotFound.forEach(rider => {
                console.log(`  - ${rider}`);
            });
        }
        
        console.log('\n✅ data.json has been updated with matching rider names from gc-data.json');
        
    } catch (error) {
        console.error('❌ Error updating rider names:', error.message);
        process.exit(1);
    }
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
    updateRiderNames();
}

export { updateRiderNames };