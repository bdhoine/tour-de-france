# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Tour de France prognosis competition website built with vanilla JavaScript and Vite. The application displays participant predictions, calculates scoring based on actual race results, and shows current General Classification standings.

## Core Architecture

### Three-Layer Structure
- **DataManager** (`src/js/data.js`): Handles all data operations including participant data, GC data loading, and complex scoring calculations
- **UIManager** (`src/js/ui.js`): Manages all UI interactions, view switching, search functionality, and display logic  
- **TourDeFrameApp** (`src/js/main.js`): Application bootstrap and initialization

### Data Flow
1. App initializes by loading participant predictions from `public/data.json`
2. GC data is loaded from `public/gc-data.json` when needed for scoring calculations
3. Scoring is calculated dynamically using tournament rules: prediction_position + actual_position = points (lowest wins)
4. Complex rider replacement logic handles DNF scenarios with substitute riders

### Key Components

**Scoring System**: Golf-style scoring where participants predict top 10 riders plus 5 substitutes. When main riders DNF, substitutes replace them. If no substitutes available, penalty is prediction_position + total_riders_in_course + 1.

**Navigation**: URL fragment-based routing with deep linking support:
- `#scoring` - Main scoring leaderboard
- `#participants` - Participant overview with sortable tables
- `#gc` - General Classification standings
- `#scoring-detail-{id}` - Individual participant scoring breakdown
- `#participant-detail-{id}` - Individual participant rider selections

**Search**: Real-time filtering across all three main views (scoring, participants, GC standings).

**Sortable Tables**: All main tables support sorting by multiple columns with visual indicators.

## Development Commands

```bash
# Start development server (port 3000, auto-opens browser)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Fetch latest GC data from Domestique Cycling
npm run fetch-gc
```

## Data Management

### Static Data Files
- `public/data.json`: Participant predictions (78 participants, each with 10 main + 5 substitute riders)
- `public/gc-data.json`: Current race standings and abandoned riders

### Live Data Updates
The `scripts/fetch-gc-data.js` script automatically fetches current Tour de France data from domestiquecycling.com by extracting the `matchcenter` JavaScript variable from their page DOM. This updates `gc-data.json` with latest standings and DNF riders.

## Styling System

Uses Le Tour de France official color scheme:
- Background: `#000000` (black)
- Primary accent: `#FFD100` (yellow)
- Text: `#ffffff` (white)
- Secondary elements: `#333333`, `#222222`

All tables follow consistent styling with same headers, hover effects, and responsive behavior.

## Key Business Logic

### Tournament Scoring Rules
1. Each participant predicts top 10 riders in order
2. Points = predicted_position + actual_finishing_position
3. When main rider DNFs, first available substitute replaces them
4. If no substitute available, rider gets penalty points
5. Lowest total points wins (golf scoring)

### Rider Replacement Logic
- **DNS vs DNF distinction**: Riders who don't start (DNS) vs those who start but don't finish (DNF)
- **Chain replacement**: If first substitute also DNFs, continue to next substitute
- **Correct scoring**: Substitutes get points based on their SUBSTITUTE position + actual finish (e.g., substitute in position 12 who finishes 5th = 12 + 5 = 17 points)
- **Penalty when no replacement**: prediction_position + (total_riders_in_course + 1)
- **Important**: Use substitute's actual prediction position (11-15), not the position they're replacing

### Recent Critical Fixes
- **Fixed substitute scoring bug**: Was incorrectly using replaced rider's position instead of substitute's actual position
- **Improved replacement chain**: Now properly skips DNF substitutes to find next available
- **Added DNS handling**: Distinguishes between riders who never started vs those who abandoned

## File Structure Notes

- ES6 modules with `"type": "module"` in package.json
- Vite handles bundling and development server
- No external dependencies beyond Vite
- Responsive CSS using modern features (Grid, Flexbox)
- All JavaScript uses modern syntax (async/await, optional chaining, etc.)