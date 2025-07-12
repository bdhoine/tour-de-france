#!/usr/bin/env node

/**
 * Test Barry's specific replacement case
 * Usage: node scripts/test-barry-replacement.js
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function testBarryReplacement() {
    try {
        console.log('Testing Barry\'s replacement logic...');
        
        const dataPath = join(__dirname, '..', 'public', 'data.json');
        const gcDataPath = join(__dirname, '..', 'public', 'gc-data.json');
        
        const participantsData = JSON.parse(readFileSync(dataPath, 'utf8'));
        const gcData = JSON.parse(readFileSync(gcDataPath, 'utf8'));
        
        // Find Barry
        const barry = participantsData.data.find(p => p.name.toLowerCase().includes('barry'));
        if (!barry) {
            console.log('❌ Could not find Barry in data');
            return;
        }
        
        console.log(`Found participant: ${barry.name}`);
        console.log('Top 10 riders:', barry.riders.slice(0, 10));
        console.log('Substitutes:', barry.riders.slice(10, 15));
        
        // Check race status of each rider
        const allRaceRiders = [
            ...gcData.gc_standings.map(r => r.rider),
            ...gcData.abandoned_riders.map(r => r.rider)
        ];
        
        const dnfRiders = new Set(gcData.abandoned_riders.map(r => r.rider));
        
        console.log('\nRace status check:');
        
        // Check Evenepoel
        const evenepoel = barry.riders.find(r => r.toLowerCase().includes('evenepoel'));
        const evenepoelInRace = allRaceRiders.some(rr => rr.toLowerCase().includes('evenepoel'));
        console.log(`Remco Evenepoel: ${evenepoelInRace ? 'IN RACE' : 'DNS'}`);
        
        // Check Adam Yates  
        const adamYates = barry.riders.find(r => r === 'Adam Yates');
        const adamYatesInRace = allRaceRiders.some(rr => rr === 'Adam Yates');
        const adamYatesDNF = dnfRiders.has('Adam Yates');
        console.log(`Adam Yates: ${adamYatesInRace ? (adamYatesDNF ? 'DNF' : 'ACTIVE') : 'DNS'}`);
        
        // Check Simon Yates
        const simonYates = barry.riders.find(r => r === 'Simon Yates');
        const simonYatesInRace = allRaceRiders.some(rr => rr === 'Simon Yates');
        const simonYatesDNF = dnfRiders.has('Simon Yates');
        console.log(`Simon Yates: ${simonYatesInRace ? (simonYatesDNF ? 'DNF' : 'ACTIVE') : 'DNS'}`);
        
        console.log('\nExpected replacement chain:');
        console.log('1. Remco Evenepoel (pos 3) DNS → should be replaced');
        console.log('2. Adam Yates (sub 1) DNF → should be skipped');
        console.log('3. Simon Yates (sub 2) ACTIVE → should be the final replacement');
        
    } catch (error) {
        console.error('❌ Error testing Barry replacement:', error.message);
    }
}

// Run the test
testBarryReplacement();