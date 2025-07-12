# 🚴‍♂️ Tour de France Prognosis Competition

A professional web application for managing Tour de France prediction competitions. Built with vanilla JavaScript and modern web technologies, featuring real-time race data integration and sophisticated scoring calculations.

![Tour de France](https://img.shields.io/badge/Tour%20de%20France-2025-yellow) ![Vite](https://img.shields.io/badge/Vite-5.0-blue) ![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-green)

## 🌟 Features

### 🏆 Competition Management
- **78 Participants** with personalized rider predictions
- **Golf-style scoring** system (lowest points wins)
- **Complex replacement logic** for DNF/DNS scenarios
- **Real-time leaderboards** with live updates

### 📊 Data Visualization
- **Interactive tables** with sorting and search functionality
- **Professional Le Tour styling** with official black/yellow theme
- **Status indicators** showing rider performance (GC position, DNF, DNS)
- **Responsive design** optimized for all devices

### 🔗 Modern Navigation
- **URL fragment routing** for deep linking
- **Browser history support** with back/forward navigation
- **Direct links** to participant details and scoring breakdowns
- **Shareable URLs** for specific views

### 📱 User Experience
- **Real-time search** across all data views
- **Sortable columns** with visual indicators
- **Hover effects** and smooth animations
- **Professional card layouts** for detailed views

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd tour-de-france

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will open automatically at `http://localhost:3000`

## 📋 Available Scripts

```bash
# Development server (auto-opens browser)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Fetch latest race data
npm run fetch-gc

# Update rider names and fix typos
npm run update-riders
npm run fix-typos
```

## 🏗️ Project Structure

```
tour-de-france/
├── public/
│   ├── data.json          # Participant predictions
│   └── gc-data.json       # Live race standings
├── src/
│   ├── css/
│   │   └── styles.css     # Le Tour official styling
│   └── js/
│       ├── main.js        # Application bootstrap
│       ├── data.js        # Data management & scoring
│       └── ui.js          # UI components & interactions
├── scripts/
│   ├── fetch-gc-data.js   # Live data fetching
│   ├── update-riders.js   # Data maintenance
│   └── fix-typos.js       # Name corrections
└── index.html             # Main application
```

## 🎯 How It Works

### Tournament Rules
1. **Predictions**: Each participant selects 10 main riders + 5 substitutes
2. **Scoring**: Points = predicted_position + actual_finishing_position
3. **Replacements**: When main riders DNF, substitutes replace them in order
4. **Penalties**: No available substitute = prediction_position + (total_riders + 1)
5. **Winner**: Lowest total points wins (golf scoring)

### Data Flow
```
Participant Predictions → Scoring Engine ← Live GC Data
                               ↓
                    Leaderboard + Individual Breakdowns
```

### Scoring Logic Example
```javascript
// Main rider in race: prediction_pos + actual_pos
points = 3 + 15 = 18

// Substitute replacement: substitute_pos + actual_pos  
points = 12 + 8 = 20

// No replacement available: prediction_pos + penalty
points = 5 + (180 + 1) = 186
```

## 🔧 Technical Architecture

### Core Components
- **DataManager**: Handles data loading, caching, and scoring calculations
- **UIManager**: Manages views, navigation, and user interactions
- **Fragment Router**: URL-based navigation with history support

### Key Technologies
- **Vanilla JavaScript** (ES6+ modules)
- **Vite** for development and building
- **CSS Grid & Flexbox** for responsive layouts
- **Modern Web APIs** (Fetch, History, URL)

### Data Sources
- **Static Predictions**: `public/data.json` (participant selections)
- **Live Race Data**: Auto-fetched from domestiquecycling.com
- **Real-time Updates**: Manual refresh or scheduled fetching

## 🎨 Design System

### Color Palette
- **Primary**: `#000000` (Le Tour Black)
- **Accent**: `#FFD100` (Le Tour Yellow)
- **Text**: `#ffffff` (White)
- **Secondary**: `#333333`, `#222222`, `#aaaaaa`

### Components
- **Tables**: Consistent styling across all views
- **Cards**: Gradient backgrounds with hover effects
- **Buttons**: Yellow accent with animations
- **Navigation**: Tab-style with active states

## 📊 Data Management

### Participant Data Structure
```json
{
  "id": 1,
  "name": "Participant Name",
  "riders": [
    "Main Rider 1",     // Position 1
    "Main Rider 2",     // Position 2
    "...",
    "Main Rider 10",    // Position 10
    "Substitute 1",     // Position 11
    "Substitute 2",     // Position 12
    "...",
    "Substitute 5"      // Position 15
  ]
}
```

### Race Data Structure
```json
{
  "gc_standings": [
    {
      "position": 1,
      "rider": "Rider Name",
      "team": "Team Name",
      "time": "04:23:45"
    }
  ],
  "abandoned_riders": [
    {
      "rider": "DNF Rider",
      "team": "Team Name",
      "stage": 5,
      "reason": "Crash"
    }
  ]
}
```

## 🔄 Data Updates

### Manual Updates
```bash
# Fetch latest race standings
npm run fetch-gc

# Update and clean rider names
npm run update-riders
```

## 🤝 Contributing

### Code Style
- Use ES6+ features and modern JavaScript
- Follow existing naming conventions
- Maintain consistent indentation (2 spaces)
- Comment complex logic thoroughly
- Keep functions focused and modular

### Testing Checklist
- [ ] All tables sort correctly
- [ ] Search functionality works across views
- [ ] URL fragments navigate properly
- [ ] Scoring calculations are accurate
- [ ] Mobile responsiveness is maintained
- [ ] Data loads correctly on refresh

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- **Tour de France** for the official styling inspiration
- **Domestique Cycling** for providing race data
- **Vite** for excellent development experience

---

**Built with ❤️ for cycling enthusiasts and prediction competition organizers**