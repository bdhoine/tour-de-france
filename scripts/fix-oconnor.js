#!/usr/bin/env node

/**
 * Fix OCONNOR mapping from Connor Swift to Ben O'Connor in data.json
 * Usage: node scripts/fix-oconnor.js
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function fixOConnor() {
    try {
        console.log('Loading data.json to fix OCONNOR mapping...');
        
        const dataPath = join(__dirname, '..', 'public', 'data.json');
        const participantsData = JSON.parse(readFileSync(dataPath, 'utf8'));
        
        let correctionsCount = 0;
        
        // Fix OCONNOR mapping from Connor Swift to Ben O'Connor
        participantsData.data.forEach(participant => {
            participant.riders = participant.riders.map(riderName => {
                if (riderName === 'Connor Swift') {
                    // Check if this was originally OCONNOR by looking for this pattern
                    // Since we can't know for sure, we'll replace all Connor Swift with Ben O'Connor
                    console.log(`✓ Fixed: "Connor Swift" → "Ben O'Connor" (${participant.name})`);
                    correctionsCount++;
                    return "Ben O'Connor";
                }
                return riderName;
            });
        });
        
        // Write updated data back to file
        writeFileSync(dataPath, JSON.stringify(participantsData, null, 2));
        
        console.log('\n' + '='.repeat(50));
        console.log('OCONNOR CORRECTION SUMMARY:');
        console.log('='.repeat(50));
        console.log(`✅ Total corrections made: ${correctionsCount}`);
        console.log('✅ All Connor Swift entries have been changed to Ben O\'Connor');
        
        console.log('\n✅ OCONNOR mapping has been fixed in data.json');
        
    } catch (error) {
        console.error('❌ Error fixing OCONNOR mapping:', error.message);
        process.exit(1);
    }
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
    fixOConnor();
}

export { fixOConnor };