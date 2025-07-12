#!/usr/bin/env node

/**
 * Fix typos in rider names in data.json
 * Usage: node scripts/fix-typos.js
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function fixTypos() {
    try {
        console.log('Loading data.json to fix typos...');
        
        const dataPath = join(__dirname, '..', 'public', 'data.json');
        const participantsData = JSON.parse(readFileSync(dataPath, 'utf8'));
        
        // Define typo corrections based on the unmatched names
        const typoCorrections = {
            'SJKELMOSE': 'Mattias Skjelmose',
            'RODRIQUEZ': 'Carlos Rodriguez',
            'VINNEGAARD': 'Jonas Vingegaard',
            'JORGENSEN': 'Matteo Jorgenson',
            'MARINEZ LENNY': 'Lenny Martinez',
            'MARTINEZ LANNY': 'Lenny Martinez',
            'RODRIGUEZ CHRIS': 'Cristian Rodriguez',
            'GREGOIRE': 'Romain Grégoire'
        };
        
        let totalCorrections = 0;
        const correctionSummary = {};
        
        // Fix typos in all participants
        participantsData.data.forEach(participant => {
            participant.riders = participant.riders.map(riderName => {
                if (typoCorrections[riderName]) {
                    const correctedName = typoCorrections[riderName];
                    console.log(`✓ Fixed typo: "${riderName}" → "${correctedName}" (${participant.name})`);
                    
                    if (!correctionSummary[riderName]) {
                        correctionSummary[riderName] = { correctedTo: correctedName, count: 0 };
                    }
                    correctionSummary[riderName].count++;
                    totalCorrections++;
                    
                    return correctedName;
                }
                return riderName;
            });
        });
        
        // Write updated data back to file
        writeFileSync(dataPath, JSON.stringify(participantsData, null, 2));
        
        console.log('\n' + '='.repeat(50));
        console.log('TYPO CORRECTION SUMMARY:');
        console.log('='.repeat(50));
        console.log(`✅ Total corrections made: ${totalCorrections}`);
        
        if (Object.keys(correctionSummary).length > 0) {
            console.log('\nCorrections by typo:');
            Object.entries(correctionSummary).forEach(([typo, info]) => {
                console.log(`  "${typo}" → "${info.correctedTo}" (${info.count} occurrences)`);
            });
        }
        
        console.log('\n✅ Typos have been fixed in data.json');
        
    } catch (error) {
        console.error('❌ Error fixing typos:', error.message);
        process.exit(1);
    }
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
    fixTypos();
}

export { fixTypos };