#!/usr/bin/env node

/**
 * Format participant names to proper case (first letter of each word capitalized)
 * Usage: node scripts/format-participant-names.js
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function formatParticipantNames() {
    try {
        console.log('Loading data.json to format participant names...');
        
        const dataPath = join(__dirname, '..', 'public', 'data.json');
        const participantsData = JSON.parse(readFileSync(dataPath, 'utf8'));
        
        function toProperCase(name) {
            return name
                .toLowerCase()
                .split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');
        }
        
        let updatedCount = 0;
        
        // Format participant names
        participantsData.data.forEach(participant => {
            const originalName = participant.name;
            const formattedName = toProperCase(originalName);
            
            if (originalName !== formattedName) {
                console.log(`✓ Updated: "${originalName}" → "${formattedName}"`);
                participant.name = formattedName;
                updatedCount++;
            } else {
                console.log(`✓ Already formatted: "${originalName}"`);
            }
        });
        
        // Write updated data back to file
        writeFileSync(dataPath, JSON.stringify(participantsData, null, 2));
        
        console.log('\n' + '='.repeat(50));
        console.log('PARTICIPANT NAME FORMATTING SUMMARY:');
        console.log('='.repeat(50));
        console.log(`✅ Total participants updated: ${updatedCount}`);
        console.log(`✅ Total participants processed: ${participantsData.data.length}`);
        
        console.log('\n✅ Participant names have been formatted to proper case in data.json');
        
    } catch (error) {
        console.error('❌ Error formatting participant names:', error.message);
        process.exit(1);
    }
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
    formatParticipantNames();
}

export { formatParticipantNames };