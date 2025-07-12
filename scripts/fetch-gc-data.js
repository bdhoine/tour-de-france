#!/usr/bin/env node

/**
 * Fetch GC data from Domestique Cycling and generate gc-data.json
 * Usage: node scripts/fetch-gc-data.js
 */

import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DOMESTIQUE_URL = 'https://www.domestiquecycling.com/en/cycling-races/tour-de-france/2025/';

async function fetchGCData() {
    try {
        console.log('Fetching data from Domestique Cycling...');
        
        const response = await fetch(DOMESTIQUE_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const html = await response.text();
        
        // Extract edition_data variable from the HTML
        console.log('Looking for edition_data variable...');
        
        const editionDataMatch = html.match(/var\s+edition_data\s*=\s*({[\s\S]*?});/);
        if (!editionDataMatch) {
            throw new Error('Could not find edition_data variable in the page');
        }
        
        console.log('Found edition_data variable, parsing JSON...');
        
        // Clean up the extracted JSON string
        let jsonString = editionDataMatch[1];
        
        // Handle potential trailing content after the JSON
        let openBraces = 0;
        let endIndex = 0;
        
        for (let i = 0; i < jsonString.length; i++) {
            if (jsonString[i] === '{') openBraces++;
            if (jsonString[i] === '}') openBraces--;
            if (openBraces === 0) {
                endIndex = i + 1;
                break;
            }
        }
        
        jsonString = jsonString.substring(0, endIndex);
        
        const editionData = JSON.parse(jsonString);
        console.log('Successfully extracted edition_data');
        
        // Transform the data to our gc-data.json format
        const gcData = transformEditionData(editionData);
        
        // Write to public/gc-data.json
        const outputPath = join(__dirname, '..', 'public', 'gc-data.json');
        writeFileSync(outputPath, JSON.stringify(gcData, null, 2));
        
        console.log(`✅ Successfully generated gc-data.json with:`);
        console.log(`   - ${gcData.gc_standings.length} riders in GC standings`);
        console.log(`   - ${gcData.abandoned_riders.length} abandoned riders`);
        console.log(`   - Last updated: ${gcData.last_updated}`);
        
    } catch (error) {
        console.error('❌ Error fetching GC data:', error.message);
        process.exit(1);
    }
}

function transformEditionData(data) {
    const gcStandings = [];
    const abandonedRiders = [];
    
    console.log('Processing edition_data structure...');
    
    // Find the 2025 Tour de France edition
    let tourEdition2025 = null;
    
    if (Array.isArray(data)) {
        // If data is an array of editions
        tourEdition2025 = data.find(edition => 
            edition.title === "2025" || 
            edition.title === 2025 || 
            (edition.date && edition.date.some && edition.date.some(d => d.includes('2025')))
        );
        console.log(`Found ${data.length} editions, looking for 2025...`);
    } else if (data.title === "2025" || data.title === 2025) {
        // If data is directly the 2025 edition
        tourEdition2025 = data;
        console.log('Data is directly the 2025 edition');
    } else {
        // Check if this is the root object with the 2025 data
        if (data.gcRanking && (data.title === "2025" || data.date?.some?.(d => d.includes('2025')))) {
            tourEdition2025 = data;
            console.log('Found 2025 data in root object');
        }
    }
    
    if (tourEdition2025) {
        console.log(`Found 2025 Tour de France edition`);
        
        if (tourEdition2025.gcRanking && Array.isArray(tourEdition2025.gcRanking)) {
            console.log(`Processing ${tourEdition2025.gcRanking.length} riders from gcRanking`);
            
            tourEdition2025.gcRanking.forEach((rider) => {
                if (rider.stillInTheRace) {
                    // Active rider - add to GC standings
                    gcStandings.push({
                        position: rider.ranking,
                        rider: rider.title,
                        team: rider.team?.title || 'Unknown Team',
                        time: rider.readableTime || '00:00:00'
                    });
                } else {
                    // Abandoned rider - add to abandoned list
                    abandonedRiders.push({
                        rider: rider.title,
                        team: rider.team?.title || 'Unknown Team',
                        stage: 'Unknown', // Stage info might be elsewhere in the data
                        reason: 'Abandoned'
                    });
                }
            });
        } else {
            console.log('No gcRanking found in 2025 edition');
        }
    } else {
        console.log('Could not find 2025 Tour de France edition in data');
        if (Array.isArray(data)) {
            console.log('Available editions:', data.map(e => e.title || e.year || 'Unknown').join(', '));
        } else {
            console.log('Data structure keys:', Object.keys(data));
        }
    }
    
    // Sort GC standings by position
    gcStandings.sort((a, b) => a.position - b.position);
    
    return {
        race_info: {
            name: "Tour de France 2025",
            year: 2025,
            current_stage: tourEdition2025?.currentStage || "Unknown"
        },
        gc_standings: gcStandings,
        abandoned_riders: abandonedRiders,
        last_updated: new Date().toISOString(),
        source: "Domestique Cycling",
        data_structure_version: "1.0"
    };
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
    fetchGCData();
}

export { fetchGCData, transformEditionData };